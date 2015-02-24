var express = require('express')
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var cors = require('cors');
var config = require('config'); // https://github.com/lorenwest/node-config
var request = require('request');
var colors = require('colors/safe');
var bunyan = require('bunyan'); // Logging.
var morgan = require('morgan'); // HTTP request logging.

var Comic = require('./models/comic');

var log = bunyan.createLogger({name: 'Comics Backend', level: config.get('logLevel')});

log.info('Environment: ' + config.util.getEnv('NODE_ENV'));

// Mongoose connections and event handling.
// ----------------------------------------

var mongooseConnection = mongoose.connect(config.get('mongoConnectionString'));
var conn = mongoose.connection;

log.debug('Setting mongodb open event handler.');

conn.on('open', function () {
    log.info('Connection to mongodb successful.');
});

conn.on('error', function (err) {
    log.error('Error connecting to mongodb.', {error: err});
});

var gracefulExit = function () {
  mongoose.connection.close(function () {
    log.info('Mongoose connection with DB is disconnected through app termination.');
    process.exit(0);
  });
};

process.on('SIGINT', gracefulExit).on('SIGTERM', gracefulExit);

// Routing functions.
// ------------------

// POST /comics
function createNewComic(req, res) {
    log.debug('Creating new comic which will look like this:');
    var comic = new Comic();
    comic.type = req.body.type;
    comic.urlPattern = req.body.urlPattern;
    log.debug({comic: comic});
    comic.save(function (err, newComic) {
        if (err)
            res.send(err);
        log.debug('New comic created. It is:', {newComic: newComic});
        res.json(newComic);
    });
}

// GET /comics
function getAllComics(req, res) {
    log.debug('Getting all comics.');
    Comic.find(function(err, comics) {
        if (err)
            res.send(err);

        res.json(comics);
    });
}

// GET /comics/:id
function getComic(req, res) {
    log.debug('Getting information about comic with id: ' + req.params.id);
    
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
    log.debug('Deleting a comic');
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
    log.debug('Requesting comic image with typeid: ' + req.params.typeid + ' and date: ' + req.params.date);
    
    Comic.findById(req.params.typeid, function (err, comic) {
        if (!comic) {
            log.debug('The comic type was not found.');
            res.status(404).send();
            return null;
        }
        
        log.debug('Comic found. urlPattern is: ' + comic.urlPattern);
        
        comic.getComicImage(req.params.date, function (err, image) {
            if (err) {
                log.debug('Error getting comic image.', {error: err});
                res.status(err).send();
                return;
            }

            res.setHeader('Content-Type', image.contentType);
            res.send(image.imageData);
        });
    });
}


// Creating application and routes.
// --------------------------------

var app = express();

app.use(cors()); // This is needed in case backend is running on a domain other than frontend.

app.use(bodyParser.json()); // To make it easy to get body out of POST requests.

app.use(morgan('combined')); // This logs all requests.

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

    log.info('Backend listening at http://%s:%s', host, port);
})

module.exports = app;
