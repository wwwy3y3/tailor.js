var should= require('should');
var Tailor= require('../lib/main');

describe('Tailor api', function () {
	this.timeout(9000);

	//set your s3 configs here
	Tailor.s3({
	    key: 'key'
	  , secret: 'secret'
	  , bucket: 'bucket'
	});

	Tailor.strategy({
		medium: {
			width: 100,
			height: 100,
			process: 'cropAndScale',
			keepSrc: true

		},

		large: {
			width: 150,
			height: 150,
			process: 'cropAndScale',
			keepSrc: true

		}
	});

	it('should crop, scale, then upload photo', function (done) {
		Tailor('./baby.jpg').strategy('medium')
							.args({ width: 150, height: 150, left: 200, top: 100 })
						    .process(function(err, datas){
						   		if(err) return done(err);
						   		datas.should.be.ok
						   		done();
						   	});
	});


});