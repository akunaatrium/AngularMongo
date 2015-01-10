var should = require('should');
var supertest = require('supertest');

var app = require('../app.js');

describe('Comics API', function() {
  describe('GET /comics', function() {
    it('should return successful HTTP status code', function(done) {
		supertest(app).get('/comics')
        	.expect(200)
        	.end(done);
    });

    it('returned content type should be correct', function(done) {
    	supertest(app).get('/comics')
    		.expect('Content-Type', /json/)
    		.end(done);
    });

    it.only('returned value should be correct', function(done) {
    	supertest(app).get('/comics')
    		.expect(function(res) {
    			if (res.body[0].type != 'Garfield') return 'First value was not Garfield';
    		})
    		.end(done);
    });

  });

});
