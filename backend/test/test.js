process.env.NODE_ENV = "test";

var should = require('should');
var supertest = require('supertest');
var async = require('async');
var _ = require('lodash');

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
			urlPattern: 'world'
		}
	];

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
			urlPattern: 'bar'
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
			urlPattern: 'bar'
		};

		before(function (done) {
			console.log('Adding comic with special ID to test database.');
			var objectId = new mongoose.mongo.ObjectID();
			specialComic._id = objectId;
			var comic = new Comic(specialComic);
			comic.save(done);
		});

		it('should be possible to request updating a comic and the response should be the comic with updated values', function (done) {
			supertest(app).put('/comics/' + specialComic._id)
				.send({type: 'foo', urlPattern: 'burrito'})
				.expect(200)
				.end(function (err, res) {
					var comic = res.body;
					comic.should.have.property('_id', specialComic._id.toHexString());
					comic.should.have.property('type', 'foo');
					comic.should.have.property('urlPattern', 'burrito');
					done();
				})
		});

		it.only('should actually update the comic in the database', function (done) {
			async.series([
				function (callback) {
					supertest(app).put('/comics/' + specialComic._id)
						.send({type: 'foo', urlPattern: 'burrito'})
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
							comic.should.have.property('urlPattern', 'burrito');
							callback();
						});
				}
				],
				done);
		});
	});

	after(function (done) {
		async.series([
			function (callback) { dropDatabase(callback); }, // Probably should not drop here becaus eit is dropped anyway after each test.
			function (callback) { mongoose.connection.close(callback); }
			],
			done);
	});
});
