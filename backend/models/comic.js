var mongoose = require('mongoose');
var _ = require('lodash');
var moment = require('moment');
var request = require('request');
var colors = require('colors/safe');
var bunyan = require('bunyan'); // Logging.
var config = require('config'); // https://github.com/lorenwest/node-config
var async = require('async');
var Q = require('q');

var log = bunyan.createLogger({name: 'Comics Backend', level: config.get('logLevel'), src: true});

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

ComicSchema.methods._getImageUrl = function (date) {
	var self = this;

	// Finding comic specific date pattern.
	var urlPattern = self.urlPattern;
	
	var comicDateFormat = urlPattern.substring(urlPattern.lastIndexOf('[') + 1, urlPattern.lastIndexOf(']'));
	var dateInComicFormat = getRequestedMoment(date).format(comicDateFormat);
	log.debug('Date in comic specific format: ' + dateInComicFormat);

	var imageUrl = urlPattern.replace(/\[.*\]/, dateInComicFormat);

	return imageUrl;
};

// Makes a request to origin and returns a promise of {contentType, imageData}.
ComicSchema.methods._requestImage = function (date) {
	var self = this;

	var imageUrl = self._getImageUrl(date);
	log.debug('Trying to find image from the origin: ' + imageUrl);

	return Q.Promise(function(resolve, reject, notify) {
		request({url: imageUrl, encoding: null}, function (err, response, body) {
			var imageData = body;
			if (err || response.statusCode != 200) {
				log.debug('Image not found from the origin.');
				reject(new Error('Image not found from origin.'));
				return;
			}
			resolve({contentType: response.headers['content-type'], imageData: imageData});
		});
	});
};

// Returns the image_id of the saved image.
ComicSchema.methods._saveImageToGrid = function (image, date) {
	var self = this;

	return Q.Promise(function(resolve, reject, notify) {
		getGrid().put(image.imageData, {content_type: image.contentType, metadata: {type: self.type, date: getRequestedMoment(date).format('LL')}}, function (err, comicFile) {
			if (err) {
				log.debug('Error saving ' + comic.type + '/' + getRequestedMoment(date).toString() + ' comic to GridFS. ' + err);
				reject(new Error(err));
				return;
			}

			log.debug('Image saved to GridFS with file ID: ' + comicFile._id);

			// Create an entry to comicImages collection which maches comic type with an image and issue date.
			var comicImages = conn.db.collection('comicImages');
			comicImages.insert({type_id: self._id, image_id: comicFile._id, date: getRequestedMoment(date).toDate()}, function (err, results) {
				if (err) {
					log.debug('Could not create a comicImage entry');
					reject(new Error(err));
					return;
				}
				log.debug('Saved ' + self.type + ' from date ' + getRequestedMoment(date).toString() + ' to comicImage');
				resolve(results[0].image_id);
			});
		});
	});
};

// Returns the image_id of the image file that exists in Grid.
ComicSchema.methods._ensureImageExistsInGrid = function (date) {

	log.debug('_ensureImageExistsInGrid executing');

	var self = this;
	var comicImages = conn.db.collection('comicImages');

	return Q.Promise(function(resolve, reject, notify) {

		// First check if it exists.
		comicImages.findOne({type_id: self._id, date: getRequestedMoment(date).toDate()}, function (err, comicImage) {
			if (err || !comicImage) { // Does not exist.
				log.debug('Starting to request image because it is not in Grid.');

				self._requestImage(date)
				.then(function (image) { // image is the structure {contentType, imageData}.
					self._saveImageToGrid(image, date)
					.then(function (imageId) {
						log.debug('Image saved to Grid with image_id: ' + imageId);
						resolve(imageId);
					})
					.done();
				})
				.done();
			} else { // Image exists.
				log.debug('Image exists in Grid with image_id: ' + comicImage.image_id);
				resolve(comicImage.image_id);
			}
		});
	});
};

// Returns an object {contentType, imageData}.
ComicSchema.methods._getImageFromGrid = function (imageFileId) {
	var self = this;

	return Q.Promise(function(resolve, reject, notify) {
		log.debug('_getImageFromGrid executing.');

		getGrid().get(imageFileId, function (err, data) {
			if (err) {
				log.debug('Image was in comicImages but did not find image from GridFS.');
				reject(new Error(err));
				return;
			}
			log.debug('Returning image from Grid.');
			// Finding the right content-type:
			var files = conn.db.collection('fs.files');
			files.findOne({_id: imageFileId}, function (err, imageFile) {
				resolve({contentType: imageFile.contentType, imageData: data});
			});
		});
	});
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
	var self = this;

	self._ensureImageExistsInGrid(date)

	.then(function (imageId) { return self._getImageFromGrid(imageId); })

	.then(function (image) {
		callback(null, image);
	})

	.fail(callback)

	.done();
}


module.exports = mongoose.model('Comic', ComicSchema);
