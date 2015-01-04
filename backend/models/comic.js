var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ComicSchema = new Schema({
	type: {type: String, required: true},
    urlPattern: {type: String, required: true}
});

module.exports = mongoose.model('Comic', ComicSchema);
