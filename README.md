
###	api
	// upload to server
	// let them crop
	var tailor= new Tailor();
	tailor("file/path").strategy("small")
					   .args({ width: w, height: h, left: , top: t })
					   .process(function(err, datas){
					   		// datas= { path: "path/to/img",  };
					   	});


##	configure
	Tailor.s3("path/to/file");  // s3 configs
	Tailor.strategy({
			mini: {
				width: 50,
				height: 50,
				s3Url: "",
				process: function(gm, args, done){
							 gm("./uploads/origin_thumb/" + img_name)
				                .resize(args.width, args.height)
				                .crop(100, 100, args.left, args.top)
				                .write('./uploads/thumb/' + img_name, function(err) {
				                    if(err) return callback(err);
				                    callback();
				            });
						}
			},

			thumb: {
				width: 100,
				height: 100,
				process: 'cropAndScale'

			}


		})

### TODO
*	middleware
	*	upload to server, upload origin to s3, keep it(?), callback the file path

*	accepted formats