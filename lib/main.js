var gm= require('gm');
var knox= require('knox');
var utility= require('./utility');
var UUID= require('node-uuid');
var async= require('async');
var fs= require('fs');

function Tailor (source) {

	if (!(this instanceof Tailor))
    	return new Tailor(source);

    // image source
    this.source= source;
    return this;
}

module.exports= Tailor;

// variables
var configs= {};
var stategies= {};
var client= null; //s3 client

/* s3: {
*       key: "s3key",
*       secret: "s3secret",
*       bucket: "s3bucket"
*   }
*/

//s3 configs
Tailor.s3= function (params) {
	configs= params;
	client= knox.createClient(configs);
};

Tailor.strategy= function (params) {
	stategies= params;
}

//proto functions

Tailor.prototype.strategy = function(_strategy) {
	var self= this;

	self.chosenStrategy= _strategy;
	return self;
};

Tailor.prototype.args = function(params) {
	var self= this;

	self.args= params;
	return self;
};

Tailor.prototype.process = function(done) {
	var self= this
	  , s3= configs
	  , image= gm(self.source)
	  , extension= self.source.substr( (self.source.lastIndexOf('.') +1) )
	  , destFilename= UUID.v1() + '.' + extension
	  , dest= './' + destFilename
	  , args= self.args	  //arguments will u be uesd in gm commands
	  , chosenStrategy= stategies[self.chosenStrategy];  //strategy used in this process


	async.auto({
		//get the filesize
		srcSize: function (callback) {
			image.size(function (err, value) {
				if(err) return callback(err);
				callback(null, value);
			})
		},

		//currently writing file to fils system, because buffer will use up lots of memory
		//s3 need the size of the file, so I need to save it in file system first
		//then upload to s3
		processImg: ['srcSize', function (callback, results) {
			//custimate process image function
			if(utility.isFunction(chosenStrategy.process))
				return chosenStrategy.process(image, args, function () {
					image.write(dest, callback);
				});

			//frequenly used function
			if(chosenStrategy.process==='cropAndScale'){
				//ratio of the width, height the photo resize
				var rx= chosenStrategy.width / args.width;
				var ry= chosenStrategy.height / args.height;

				//the width, height, left, top length after resize by ratio
				var w= Math.round(rx*results.srcSize.width);  //width
				var h= Math.round(ry*results.srcSize.height);	//height
				var l= Math.round(rx*args.left);	//left
				var t= Math.round(ry*args.top);	//top

				image.scale(w, h)
		             .crop(chosenStrategy.width, chosenStrategy.height, l, t)
		             .write(dest, callback);
		    }
		}],

		removeSrc: ['processImg', function (callback) {
			//still keep the source, after process the image
			if(chosenStrategy.keepSrc)
				return callback();

			//after process the source to dest, source could be removed
			fs.unlink(self.source, function (err) {
				if(err) return callback(err);
				callback();
			})
		}],

		imgStat: ['processImg', function (callback) {
			//get the file size of the dest file
			fs.stat(dest, function (err, stat) {
				if(err) return callback(err);
				callback(null, stat);
			})
		}],

		uploadToS3: ['imgStat', function (callback, results) {
			//if s3Url is defined in strategy
			if(chosenStrategy.s3Url)  // /folder/path
				var url= chosenStrategy.s3url + '/' + destFilename;
			else //otherwose, upload to '/'
				var url= '/' + destFilename;

			var req = client.put(url, {
			      'Content-Length': results.imgStat.size
			    , 'Content-Type': 'image/'+extension
			  });

			  //file stream upload to s3
			  fs.createReadStream(dest).pipe(req);

			  //http response from s3 put
			  req.on('response', function(res){
			    if(res.statusCode==200)
			    	callback()
			    else
			    	callback(new Error("upload fail"));
			  });
		}],

		removeDest: ['uploadToS3', function (callback) {
			//after upload, delete the file
			fs.unlink(dest, function (err) {
				if(err) return callback(err);
				callback();
			})
		}]

		}, function (err) {
			if(err) return done(err);
			done(null, {fileName: destFilename});
		});

	
};
