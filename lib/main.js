var gm= require('gm');
var knox= require('knox');
var utility= require('./utility');
var UUID= require('node-uuid');
var async= require('async');

function Tailor (source) {
	var self= this;

	if (!(this instanceof Tailor))
    	return new Tailor(source);

    // image source
    self.source= source;
    return self;
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

Tailor.stategy= function (params) {
	stategies= params;
}

//proto functions

Tailor.prototype.stategy = function(_strategy) {
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
	  , dest= 
	  , args= self.args	  //arguments will u be uesd in gm commands
	  , chosenStrategy= stategies[self.chosenStrategy];  //strategy used in this process


	async.waterfall([
		function processImg (callback) {
			//custimate process image function
			if(utility.isFunction(chosenStrategy.process))
				return chosenStrategy.process(image, args, function () {
					image.write(dest, callback);
				});

			//frequenly used function
			if(chosenStrategy.process==='cropAndScale')
				image.resize(agrs.width, args.height)
		             .crop(100, 100, agrs.left, agrs.top)
		             .write(dest, callback);
		},

		function uploadS3 (callback) {
			// body...
		}
		]);

	
};
