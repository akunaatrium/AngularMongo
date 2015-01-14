var mongoose = require('mongoose');
var _ = require('lodash');

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

module.exports = mongoose.model('Comic', ComicSchema);
