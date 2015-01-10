process.env.NODE_ENV = "test";

var should = require('should');
var supertest = require('supertest');
var async = require('async');

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
	var comics = [
		{
			type: 'Garfield',
			urlPattern: 'https://garfield.com/uploads/strips/[YYYY-MM-DD].jpg'
		},
		{
			type: 'Scarygoround',
			urlPattern: 'http://scarygoround.com/strips/[YYYYMMDD].png'
		}
	];

	beforeEach(function (done) {
		console.log('Adding two comics to test database.');
		var comic1 = new Comic(comics[0]);
		var comic2 = new Comic(comics[1]);

		async.parallel([
			function (callback) { comic1.save(callback); },
			function (callback) { comic2.save(callback); },
			],
			done
		);
	});

	describe('GET /comics', function () {

		afterEach(function (done) { dropDatabase(done); });

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

		it('should return array of length 2', function (done) {
			supertest(app).get('/comics')
				.end(function (err, res) {
					var comics = res.body;
					comics.should.be.an.Array.and.have.lengthOf(2);
					done();
				});
		});

		it('should return all comics with correct values', function (done) {
			supertest(app).get('/comics')
				.end(function (err, res) {
					var comics = res.body;
					comics.should.containEql(comics[0]);
					comics.should.containEql(comics[1]);
					done();
				});
		});

	}); // GET /comics

	describe('GET /comics/:id', function () {

		var objectId;
		var comicData;

		before(function (done) {
			console.log('Adding a comic with specific ID to test database.');
			objectId = new mongoose.mongo.ObjectID();
			comicData = {_id: objectId, type: 'hello', urlPattern: 'world'};
			var comic = new Comic(comicData);
			comic.save(done);
		});

		it('should return the right comic', function (done) {
			supertest(app).get('/comics/' + objectId)
				.end(function (err, res) {
					var comic = res.body;
					comic.should.have.property('type', 'hello');
					comic.should.have.property('urlPattern', 'world');
					comic.should.have.property('_id', objectId.toHexString());
					done();
				});
		});
	});

	after(function (done) {
		console.log('Closing mongodb connection.');
		mongoose.connection.close(function () {
			done();
		});
	});
});
