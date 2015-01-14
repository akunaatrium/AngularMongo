var express = require('express')
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var cors = require('cors');
var moment = require('moment');
var config = require('config'); // https://github.com/lorenwest/node-config
var request = require('request');
var colors = require('colors/safe');

var Comic = require('./models/comic');

console.log('Environment: ' + config.util.getEnv('NODE_ENV'));

// Mongoose connections and event handling.
// ----------------------------------------

var mongooseConnection = mongoose.connect(config.get('mongoConnectionString'));
var conn = mongoose.connection;
var mongo = mongooseConnection.mongo;
var db = conn.db;
var grid = new mongo.Grid(db);

console.log('Setting mongodb open event handler.');

conn.on('open', function () {
    console.log('Connection to mongodb successful.');
});

conn.on('error', function (err) {
    console.log('Error connecting to mongodb.');
    console.log(err);
});

var gracefulExit = function () { 
  mongoose.connection.close(function () {
    console.log('Mongoose connection with DB is disconnected through app termination.');
    process.exit(0);
  });
};

process.on('SIGINT', gracefulExit).on('SIGTERM', gracefulExit);

// Routing functions.
// ------------------

// POST /comics
function createNewComic(req, res) {
    console.log('Creating new comic which will look like this:');
    var comic = new Comic();
    comic.type = req.body.type;
    comic.urlPattern = req.body.urlPattern;
    console.log(comic);
    comic.save(function (err, newComic) {
        if (err)
            res.send(err);
        console.log('New comic created. It is:');
        console.log(newComic);
        res.json(newComic);
    });
}

// GET /comics
function getAllComics(req, res) {
    console.log('Getting all comics.');
    Comic.find(function(err, comics) {
        if (err)
            res.send(err);

        res.json(comics);
    });
}

// GET /comics/:id
function getComic(req, res) {
    console.log('Getting information about comic with id: ' + req.params.id);
    
    Comic.findById(req.params.id, function (err, comic) {
        if (!comic) {
            res.status(404).send();
            return null;
        }
        res.json(comic);
    });
}

// PUT /comics/:id
function updateComic(req, res) {
    console.log('Updating a comic. Input is: v');
    console.log(req.body);
    
    Comic.findById(req.params.id, function (err, comic) {
        if (err) {
            res.send(err);
            return;
        }
        
        if (!comic) {
            res.status(404).send(); // Can't update a nonexistent comic.
            return;
        }
        
        comic.type = req.body.type;
        comic.urlPattern = req.body.urlPattern;

        comic.save(function (err) {
            if (err) {
                res.status(400).send(err);
                return;
            }
            res.json(comic);
        });
    });
}

// DELETE /comics/:id
function deleteComic(req, res) {
    console.log('Deleting a comic');
    Comic.remove({_id: req.params.id}, function (err, comic) {
        if (err) {
            res.status(400).send(err);
            return;
        }
        
        res.json({ message: 'Successfully deleted' });
    });
}

// GET /comicimage/:typeid/:date
function getComicImage(req, res) {    
    var DATE_FORMAT = 'YYYYMMDD';
    var requestedMoment = moment(req.params.date, DATE_FORMAT);
    var requestedMomentString = requestedMoment.format(DATE_FORMAT);
    
    console.log('Requesting comic image with typeid: ' + req.params.typeid + ' and date: ' + req.params.date);
    
    Comic.findById(req.params.typeid, function (err, comic) {
        if (!comic) {
            console.log('The comic type was not found.');
            res.status(404).send();
            return null;
        }
        
        console.log('comic found. urlPattern is: ' + comic.urlPattern);
        
        // Finding comic specific date pattern.

        var urlPattern = comic.urlPattern;
        
        var comicDateFormat = urlPattern.substring(urlPattern.lastIndexOf('[') + 1, urlPattern.lastIndexOf(']'));
        var dateInComicFormat = requestedMoment.format(comicDateFormat);
        console.log('Date in comic specific format: ' + dateInComicFormat);

        var imageUrl = urlPattern.replace(/\[.*\]/, dateInComicFormat);

        // First, let's search the database for the image.

        var comicImages = conn.db.collection('comicImages');
        comicImages.findOne({type_id: mongo.ObjectID(req.params.typeid), date: requestedMoment.toDate()}, function (err, result) {
            if (err || !result) {
                // Image not found.
                console.log('No saved image. Gotta load from origin and save it then.');
                requestImageAndSave(imageUrl, function (response, imageData) {
                    if (response.statusCode != 200) {
                        res.status(response.statusCode).send();
                        return;
                    }
                    res.setHeader('Content-Type', response.headers['content-type']);
                    res.send(imageData);
                });
            } else {
                // Image found:
                var imageFileId = result.image_id;
                grid.get(imageFileId, function (err, data) {
                    if (err) {
                        console.log('Image was in comicImages but did not find image from GridFS.');
                        return;
                    }
                    console.log('Returning image from Grid.');
                    // Finding the right content-type:
                    var files = conn.db.collection('fs.files');
                    files.findOne({_id: imageFileId}, function (err, imageFile) {
                        res.setHeader('Content-Type', imageFile.contentType);
                        res.send(data);
                    });
                });
            }
        });
        
        function requestImageAndSave(url, callback) {
            request({url: imageUrl, encoding: null}, function (err, response, imageData) {
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
    });
}


// Creating application and routes.
// --------------------------------

var app = express();

app.use(cors()); // This is needed in case backend is running on a domain other than frontend.

app.use(bodyParser.json()); // To make it easy to get body out of POST requests.

// Define CRUD routes for Comic types.
app.post('/comics', createNewComic);
app.get('/comics', getAllComics);
app.get('/comics/:id', getComic);
app.put('/comics/:id', updateComic);
app.delete('/comics/:id', deleteComic);

// This route gets the whole comic picture.
// :typeid is comic type id. :date must be in format YYYYMMDD.
app.get('/comicimage/:typeid/:date', getComicImage);

// Creating server to listen incoming connections.
//------------------------------------------------

var server = app.listen(config.get('port'), function () {

    var host = server.address().address
    var port = server.address().port

    console.log('Backend listening at http://%s:%s', host, port);
})

module.exports = app;
