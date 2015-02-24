process.env.NODE_ENV = "test";

var should = require('should');
var supertest = require('supertest');
var async = require('async');
var _ = require('lodash');
var nock = require('nock');
var fs = require('fs');
var config = require('config'); // https://github.com/lorenwest/node-config
var bunyan = require('bunyan'); // Logging.
var mongoose = require('mongoose');
var Q = require('q');


var log = bunyan.createLogger({name: 'Comics Backend', level: config.get('logLevel')});


var getNumberOne = function () {
	return Q.Promise(function(resolve, reject, notify) {
		log.debug('Getting number one');
		resolve(1);
	});
};

var addTwo = function (number) {
	return Q.Promise(function(resolve, reject, notify) {
		log.debug('Adding number two');
		resolve();
	});
};

var printOut = function (stuff) {
	log.debug('Printing out ' + stuff);
	return Q.fcall(function () {
		return 10;
	});
};

var cool = function () {
	log.debug('Cool function executed');
};

describe('Funny business', function () {
	it('blaa', function (done) {
		getNumberOne()
		.then(function (number) { var resultFromAddTwo = addTwo(number); log.debug('ResultFromAddTwo: ' + resultFromAddTwo); return resultFromAddTwo; })
		.then(function (stuff) { printOut(stuff); })
		.then(cool.bind())
		.then(done())
		.fail(function (error) { log.debug("Error happened and we are handling it. Reason: " + error); });
	});

});
