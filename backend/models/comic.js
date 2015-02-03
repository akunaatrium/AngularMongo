var mongoose = require('mongoose');
var _ = require('lodash');
var moment = require('moment');
var request = require('request');
var colors = require('colors/safe');
var bunyan = require('bunyan'); // Logging.
var config = require('config'); // https://github.com/lorenwest/node-config

var log = bunyan.createLogger({name: 'Comics Backend', level: config.get('logLevel')});

var conn = mongoose.connection;
var mongo = mongoose.mongo;

var getGrid = function() {
	return mongo.Grid(conn.db);
}

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

var DATE_FORMAT = 'YYYYMMDD';

var getRequestedMoment = function (date) {
	return moment(date, DATE_FORMAT);
};

ComicSchema.methods.getImageUrl = function (date) {
	var comic = this;

	// Finding comic specific date pattern.
	var urlPattern = comic.urlPattern;
	
	var comicDateFormat = urlPattern.substring(urlPattern.lastIndexOf('[') + 1, urlPattern.lastIndexOf(']'));
	var dateInComicFormat = getRequestedMoment(date).format(comicDateFormat);
	log.debug('Date in comic specific format: ' + dateInComicFormat);

	var imageUrl = urlPattern.replace(/\[.*\]/, dateInComicFormat);

	return imageUrl;
};

/*
	Arguments:
	date - date as a string in format YYYYMMDD.
	callback - function which is called with arguments err and comicImage.
				Successful response from origin server sets err to null and comicImage to an object with keys contentType and imageData.
*/

/*
	Logic: taking in a date, it returns binary data of the comic image. datePattern and type is known.
	Level1 logic:
		* Generate the url to concrete image using date.
		* Search comicImages collection for the concrete image using typeid and date and return whether comic image data exists.
			* If not found, use generated imageUrl to request th ecomic image from source and save the image to grid.
			* If found, return the image data from grid.
*/
ComicSchema.methods.getComicImage = function (date, callback) {
	var comic = this;

	// First, let's search the database for the image. comicImages collection contains all references to images.

	var comicImages = conn.db.collection('comicImages');

	comicImages.findOne({type_id: mongo.ObjectID(this._id), date: getRequestedMoment(date).toDate()}, function (err, result) {
		if (err || !result) {
			// Image not found.
			log.debug('No saved image. Gotta load from origin and save it then.');
			requestImageAndSave(function (response, imageData) {
				if (response.statusCode != 200) {
					callback("Could not get image from origin. HTTP status code: " + response.statusCode);
					return;
				}
				callback(null, {contentType: response.headers['content-type'], imageData: imageData});
			});
		} else {
			// Image found:
			var imageFileId = result.image_id;
			getGrid().get(imageFileId, function (err, data) {
				if (err) {
					log.debug('Image was in comicImages but did not find image from GridFS.');
					callback(err);
					return;
				}
				log.debug('Returning image from Grid.');
				// Finding the right content-type:
				var files = conn.db.collection('fs.files');
				files.findOne({_id: imageFileId}, function (err, imageFile) {
					callback(null, {contentType: imageFile.contentType, imageData: data});
				});
			});
		}
	});
	
	function requestImageAndSave(callback) {
		log.debug('requestImageAndSave called!');
		var imageUrl = comic.getImageUrl(date);
		log.debug('Trying to find image from the origin: ' + imageUrl);

		request({url: imageUrl, encoding: null}, function (err, response, body) {
			var imageData = body;
			if (err || response.statusCode != 200) {
				log.debug('Image not found from the origin.');
				callback(response);
				return;
			}
			log.debug('Image found from origin.');

			log.debug('Saving picture to Grid with the following attributes: ');

			getGrid().put(imageData, {content_type: response.headers['content-type'], metadata: {type: comic.type, date: getRequestedMoment(date).format('LL')}}, function (err, result) {
				if (err) {
					log.debug('Error saving ' + comic.type + '/' + getRequestedMoment(date).toString() + ' comic to GridFS. ' + err);
					callback(response);
					return;
				}

				log.debug(colors.green('Picture saved to GridFS with file ID: ' + result._id));

				// Create an entry to comicImages collection which maches comic type with an image and issue date.
				var comicImages = conn.db.collection('comicImages');
				comicImages.insert({type_id: comic._id, image_id: result._id, date: getRequestedMoment(date).toDate()}, function (err, result) {
					if (err) {
						log.debug('Could not create a comicImage entry');
						callback(response);
						return;
					}
					log.debug('Saved ' + comic.type + ' from date ' + getRequestedMoment(date).toString() + ' to comicImage');
					callback(response, imageData);
				});
			});
		});
	}
}


module.exports = mongoose.model('Comic', ComicSchema);
