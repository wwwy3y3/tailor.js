
###	how to use
	tailor("file/path").strategy("medium")
					   .args({ width: w, height: h, left: , top: t })  // arguments required in gm api
					   .process(function(err, datas){
					   		// datas= { path: "path/to/img",  };  //data will contain the new name of the file (uuid)
					   	});


##	configure
set s3 configures

	Tailor.s3({
	    key: 'key'
	  , secret: 'secret'
	  , bucket: 'bucket'
	});




define some strategy you're going to use



	Tailor.strategy({
		medium: {
			width: 100,
			height: 100,
			process: 'cropAndScale',
			keepSrc: true  //optional, whethor keep the source file or not, after upload to s3

		},

		large: {
			width: 150,
			height: 150,
			process: 'cropAndScale'

		}
	});