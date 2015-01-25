process.env.NODE_ENV = "test";

var should = require('should');
var supertest = require('supertest');
var async = require('async');
var _ = require('lodash');
var nock = require('nock');
var fs = require('fs');

var mongoose = require('mongoose');
var Comic = require('../models/comic');

var app = require('../server');

var dropDatabase = function (callback) {
	console.log('Dropping test database.');
	mongoose.connection.db.dropDatabase(function (err, result) {
		should.not.exist(err);
		callback();
	});
};

describe('Comics API', function () {
	var COMICS = [
		{
			type: 'Garfield',
			urlPattern: 'https://garfield.com/uploads/strips/[YYYY-MM-DD].jpg'
		},
		{
			type: 'Scarygoround',
			urlPattern: 'http://scarygoround.com/strips/[YYYYMMDD].png'
		},
		{
			type: 'hello',
			urlPattern: 'http://world'
		}
	];

	before(function (done) {
		mongoose.connection.on('connected', function () {
			console.log('Connection to MongoDB is established. Tests can now run.');
			done();
		});
	});

	beforeEach(function (done) {
		console.log('Adding three comics to test database.');
		var comic1 = new Comic(COMICS[0]);
		var comic2 = new Comic(COMICS[1]);
		var comic3 = new Comic(COMICS[2]);

		async.parallel([
			function (callback) { comic1.save(callback); },
			function (callback) { comic2.save(callback); },
			function (callback) { comic3.save(callback); },
			],
			done
		);
	});

	afterEach(function (done) {
		console.log('afterEach function called (which should drop database)');
		dropDatabase(done);
	});

	describe('GET /comics', function () {

		// Tests.
		it('should return successful result', function (done) {
			supertest(app).get('/comics')
				.expect(200)
				.end(function (err, res) {
					should.not.exist(err);
					should.exist(res);
					done();
				});
		});

		it('should return a response with correct content type', function (done) {
			supertest(app).get('/comics')
				.expect('Content-Type', /json/)
				.end(done);
		});

		it('should return array of length 3', function (done) {
			supertest(app).get('/comics')
				.end(function (err, res) {
					var comics = res.body;
					comics.should.be.an.Array.and.have.lengthOf(3);
					done();
				});
		});

		it('should return all comics with correct values', function (done) {
			supertest(app).get('/comics')
				.end(function (err, res) {
					var comics = res.body;
					_.forEach(comics, function(comic, index, collection) {
						var strippedComic = {type: comic.type, urlPattern: comic.urlPattern};
						COMICS.should.containEql(strippedComic);
					});
					done();
				});
		});
	}); // GET /comics

	describe('GET /comics/:id', function () {

		var specialComic = {
			_id: null,
			type: 'foo',
			urlPattern: 'http://bar'
		};

		before(function (done) {
			console.log('Adding comic with special ID to test database.');
			var objectId = new mongoose.mongo.ObjectID();
			specialComic._id = objectId;
			var comic = new Comic(specialComic);
			comic.save(done);
		});

		it('should return the right comic', function (done) {
			supertest(app).get('/comics/' + specialComic._id)
				.end(function (err, res) {
					var comic = res.body;
					comic.should.have.property('type', specialComic.type);
					comic.should.have.property('urlPattern', specialComic.urlPattern);
					comic.should.have.property('_id', specialComic._id.toHexString());
					done();
				});
		});
	}); // GET /comics/:id

	describe('PUT /comics/:id', function () {

		var specialComic = {
			_id: null,
			type: 'foo',
			urlPattern: 'http://bar'
		};

		beforeEach(function (done) {
			console.log('Adding comic with special ID to test database.');
			var objectId = new mongoose.mongo.ObjectID();
			specialComic._id = objectId;
			var comic = new Comic(specialComic);
			comic.save(done);
		});

		it('should be possible to request updating a comic and the response should be the comic with updated values', function (done) {
			supertest(app).put('/comics/' + specialComic._id)
				.send({type: 'foo', urlPattern: 'http://burrito'})
				.expect(200)
				.end(function (err, res) {
					var comic = res.body;
					comic.should.have.property('_id', specialComic._id.toHexString());
					comic.should.have.property('type', 'foo');
					comic.should.have.property('urlPattern', 'http://burrito');
					done();
				});
		});

		it('should actually update the comic in the database', function (done) {
			async.series([
				function (callback) {
					supertest(app).put('/comics/' + specialComic._id)
						.send({type: 'foo', urlPattern: 'http://burrito'})
						.expect(200)
						.end(callback);
				},
				function (callback) {
					supertest(app).get('/comics/' + specialComic._id)
						.expect(200)
						.end(function (err, res) {
							var comic = res.body;
							comic.should.have.property('_id', specialComic._id.toHexString());
							comic.should.have.property('type', 'foo');
							comic.should.have.property('urlPattern', 'http://burrito');
							callback();
						});
				}
				],
				done);
		});

		it('should not be possible to assign weird values for fields', function (done) {
			async.series([
				function (callback) {
					supertest(app).put('/comics/' + specialComic._id)
						.send({type: 'foo', urlPattern: ''})
						.expect(400, callback);
				},
				function (callback) {
					supertest(app).put('/comics/' + specialComic._id)
						.send({type: 'foo', urlPattern: '   '})
						.expect(400, callback);
				},
				function (callback) {
					supertest(app).put('/comics/' + specialComic._id)
						.send({type: 'foo', urlPattern: 'this string does not start with http'})
						.expect(400, callback);
				}
				],
				done);
		});

	}); // PUT /comics/:id

	describe('DELETE /comics/:id', function () {

		var specialComic = {
			_id: null,
			type: 'foo',
			urlPattern: 'http://bar'
		};

		before(function (done) {
			console.log('Adding comic with special ID to test database.');
			var objectId = new mongoose.mongo.ObjectID();
			specialComic._id = objectId;
			var comic = new Comic(specialComic);
			comic.save(done);
		});

		it('should actually delete the comic from the database', function (done) {
			async.series([
				function (callback) {
					supertest(app).delete('/comics/' + specialComic._id)
						.expect(200)
						.end(callback);
				},
				function (callback) {
					supertest(app).get('/comics/' + specialComic._id)
						.expect(404, callback);
				}
				],
				done);
		});

		it('should not be possible to delete a non-existent comic', function (done) {
			supertest(app).get('/comics/abc123blaa')
				.expect(404, done)
		});
	}); // /DELETE /comics/:id

	describe('GET /comicimage/:typeid/:date', function () {

		var specialComic = {
			_id: null,
			type: 'My special comic',
			urlPattern: 'http://give.me/my/picture[DDMMYYYY].png'
		};

		describe('One request', function () {

			before(function (done) {
				console.log('Adding comic with special ID to test database.');
				var objectId = new mongoose.mongo.ObjectID();
				specialComic._id = objectId;
				var comic = new Comic(specialComic);
				comic.save(done);
			});

			after(function () {
				nock.cleanAll();
			});

			it('should return the correct image', function (done) {
				nock('http://give.me').get('/my/picture31071985.png')
					.replyWithFile(200, __dirname + '/bright_sun_icon.png', {'Content-Type': 'image/png'});

				var typeid = specialComic._id;
				supertest(app).get('/comicimage/' + typeid + '/19850731')
					.expect(200)
					.end(function (err, res) {
						if (err) throw err;
						// Let's check if the returned image equals the file contents.
						var content = fs.readFileSync(__dirname + '/bright_sun_icon.png');
						content.length.should.eql(res.body.length);
						content.should.eql(res.body);
						done();
					});
			});
		}); // First request

		describe('Two requests', function () {

			before(function (done) {
				console.log('Adding comic with special ID to test database.');
				var objectId = new mongoose.mongo.ObjectID();
				specialComic._id = objectId;
				var comic = new Comic(specialComic);
				comic.save(done);
			});

			after(function () {
				nock.cleanAll();
			});

			it.only('should not download image from origin on second request', function (done) {
				// Logic: retrieve image and check that origin was touched. Retrieve image and check that origin was not touched and returned image is correct.

				var originCalledCount = 0;

				nock('http://give.me')
					.get('/my/picture31071985.png')
					.reply(200, function (uri, requestBody) {
						++originCalledCount;
						return fs.readFileSync(__dirname + '/bright_sun_icon.png');
					},
					{
						'Content-Type': 'image/png'
					});

				var requestComicImage = function (callback) {
					var typeid = specialComic._id;
					supertest(app).get('/comicimage/' + typeid + '/19850731').expect(200).end(function (err, result) {
						if (err) throw err;
						originCalledCount.should.be.exactly(1);
						callback(err, result);
					});
				};

				async.series([
					function (callback) {
						console.log('Requesting comic image the first time.');
						requestComicImage(callback);
					},
					function (callback) {
						console.log('Requesting comic image the second time.');
						requestComicImage(callback);
					},
					],
					done);
			});
		}); // Second request
	}); // GET /comicimage/:typeid/:date


	after(function (done) {
		async.series([
			function (callback) { dropDatabase(callback); }, // Probably should not drop here becaus it is dropped anyway after each test.
			function (callback) { mongoose.connection.close(callback); }
			],
			done);
	});
});
