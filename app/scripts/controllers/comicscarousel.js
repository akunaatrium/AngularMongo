(function() {

    'use strict';
    
    var app = angular.module('projectApp');
    
    app.controller('ComicsCarouselController', ['$stateParams', 'selectedSourceValue', function($stateParams, selectedSourceValue) {
        console.log('ComicsCarouselController loaded.');

        var vm = this;
        
        vm.comic = {};

        var selectedSource = selectedSourceValue.selectedSource;

        console.log('Currently selected comic:');
        console.log(selectedSource);
        
        if (!selectedSource) {
            return;
        }

        vm.comic.type = selectedSource.type;
        
        var date = moment().subtract(1, 'days');

        var datePattern;
        var urlPattern;

        var showNewComic = function(newDate) {
            var comicSpecificCurrentDate = newDate.format(datePattern);
            vm.comic.url = urlPattern.replace(/\[.*\]/, comicSpecificCurrentDate);
            vm.comic.dateToShow = moment(newDate).format('LL');
        };

        urlPattern = selectedSource.urlPattern;
        datePattern = urlPattern.substring(urlPattern.lastIndexOf('[') + 1, urlPattern.lastIndexOf(']'));
        showNewComic(date);

        vm.previousComicImage = function() {
            date = date.subtract(1, 'days');
            showNewComic(date);
        };

        vm.nextComicImage = function() {
            date = date.add(1, 'days');
            showNewComic(date);
        };

    }]);
    
})();
