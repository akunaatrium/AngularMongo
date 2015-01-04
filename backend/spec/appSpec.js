//var request = require('request');
var moment = require('moment');

describe("string", function() {
    it("a string should equal to a char ", function() {
        var time1 = moment().add(1, 'days').subtract(1, 'days').format('YYYYMMDD');
        var time2 = moment().format('YYYYMMDD');                    
        expect(time1).toEqual(time2);
    });
});
