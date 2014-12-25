(function() {

    'use strict';
    
    var app = angular.module('projectApp');
    
    app.controller('ComicsCarouselController', ['$stateParams', 'selectedSourceValue', function($stateParams, selectedSourceValue) {
        console.log('ComicsCarouselController loaded.');

        var vm = this;
        
        var comic = selectedSourceValue.selectedSource;
        
        vm.comic = comic;
        
        // Add a few features to comic object.

        comic._date = moment().subtract(1, 'days');
        var urlPattern = comic.urlPattern;
        comic._DATE_PATTERN = urlPattern.substring(urlPattern.lastIndexOf('[') + 1, urlPattern.lastIndexOf(']'));
        
        comic.getImageUrl = function() {
            var dateInComicFormat = this._date.format(this._DATE_PATTERN);
            var imageUrl = this.urlPattern.replace(/\[.*\]/, dateInComicFormat);
            return imageUrl;
        };

        comic.getDateToShow = function() {
            return moment(this._date).format('LL');
        };
        
        comic.next = function() {
            this._date = this._date.add(1, 'days');
        };
        
        comic.previous = function() {
            this._date = this._date.subtract(1, 'days');
        };
    }]);
})();
