var mongoose = require('mongoose');
var _ = require('lodash');
var moment = require('moment');
var request = require('request');
var colors = require('colors/safe');

var Schema = mongoose.Schema;

var ComicSchema = new Schema({
	type: { type: String, required: true, trim: true },
	urlPattern: { type: String, required: true, trim: true }
});

ComicSchema.path('type').validate(function (type) {
  return type.length;
}, 'Comic type cannot be blank');

ComicSchema.path('urlPattern').validate(function (urlPattern) {
  return urlPattern.length;
}, 'Comic URL pattern cannot be blank');

ComicSchema.path('urlPattern').validate(function (urlPattern) {
  return (urlPattern.substring(0, 'http'.length) === 'http');
}, 'Comic URL pattern must start with http');

/*
	Arguments:
	date - date as a string in format YYYYMMDD.
	callback - function which is called with arguments err and comicImage.
				Successful response from origin server sets err to null and comicImage to an object with keys contentType and imageData.
*/
ComicSchema.methods.getComicImage = function (date, callback) {
	var conn = mongoose.connection;
	var mongo = mongoose.mongo;
	var grid = mongo.Grid(conn.db);

	var comic = this;

	var DATE_FORMAT = 'YYYYMMDD';
	var requestedMoment = moment(date, DATE_FORMAT);
	var requestedMomentString = requestedMoment.format(DATE_FORMAT);

	// Finding comic specific date pattern.
	var urlPattern = this.urlPattern;
	
	var comicDateFormat = urlPattern.substring(urlPattern.lastIndexOf('[') + 1, urlPattern.lastIndexOf(']'));
	var dateInComicFormat = requestedMoment.format(comicDateFormat);
	console.log('Date in comic specific format: ' + dateInComicFormat);

	var imageUrl = urlPattern.replace(/\[.*\]/, dateInComicFormat);

	// First, let's search the database for the image. comicImages collection contains all references to images.

	var comicImages = conn.db.collection('comicImages');
	comicImages.findOne({type_id: mongo.ObjectID(this._id), date: requestedMoment.toDate()}, function (err, result) {
		if (err || !result) {
			// Image not found.
			console.log('No saved image. Gotta load from origin and save it then.');
			requestImageAndSave(imageUrl, function (response, imageData) {
				if (response.statusCode != 200) {
					callback("Could not get image from origin. HTTP status code: " + response.statusCode);
					return;
				}
				callback(null, {contentType: response.headers['content-type'], imageData: imageData});
			});
		} else {
			// Image found:
			var imageFileId = result.image_id;
			grid.get(imageFileId, function (err, data) {
				if (err) {
					console.log('Image was in comicImages but did not find image from GridFS.');
					callback(err);
					return;
				}
				console.log('Returning image from Grid.');
				// Finding the right content-type:
				var files = conn.db.collection('fs.files');
				files.findOne({_id: imageFileId}, function (err, imageFile) {
					callback(null, {contentType: imageFile.contentType, imageData: data});
				});
			});
		}
	});
	
	function requestImageAndSave(imageUrl, callback) {
		console.log('Trying to find image from the origin: ' + imageUrl);

		request({url: imageUrl, encoding: null}, function (err, response, body) {
			var imageData = body;
			if (err || response.statusCode != 200) {
				console.log('Image not found from the origin.');
				callback(response);
				return;
			}
			console.log('Image found from origin.');

			grid.put(imageData, {content_type: response.headers['content-type'], metadata: {type: comic.type, date: requestedMoment.format('LL')}}, function (err, result) {
				if (err) {
					console.log('Error saving ' + comic.type + '/' + requestedMomentString + ' comic to GridFS. ' + err);
					callback(response);
					return;
				}

				console.log(colors.green('Picture saved to GridFS with file ID: ' + result._id));

				// Create an entry to comicImages collection which maches comic type with an image and issue date.
				var comicImages = conn.db.collection('comicImages');
				comicImages.insert({type_id: comic._id, image_id: result._id, date: requestedMoment.toDate()}, function (err, result) {
					if (err) {
						console.log('Could not create a comicImage entry');
						callback(response);
						return;
					}
					console.log('Saved ' + comic.type + ' from date ' + requestedMomentString + ' to comicImage');
					callback(response, imageData);
				});
			});
		});
	}
}


module.exports = mongoose.model('Comic', ComicSchema);
