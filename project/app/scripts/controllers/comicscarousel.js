(function() {

    'use strict';
    
    var app = angular.module('projectApp');
    
    app.controller('ComicsCarouselController', ['$routeParams', '$scope', 'selectedSourceValue', function($routeParams, $scope, selectedSourceValue) {
        console.log('ComicsCarouselController loaded.');

        $scope.comic = {};

        var selectedSource = selectedSourceValue.selectedSource;

        console.log('Currently selected comic:');
        console.log(selectedSource);
        
        if (!selectedSource) {
            return;
        }

        $scope.comic.type = selectedSource.type;
        
        var date = moment().subtract(1, 'days');

        var datePattern;
        var urlPattern;

        var showNewComic = function(newDate) {
            var comicSpecificCurrentDate = newDate.format(datePattern);
            $scope.comic.url = urlPattern.replace(/\[.*\]/, comicSpecificCurrentDate);
            $scope.comic.dateToShow = moment(newDate).format('LL');
        };

        urlPattern = selectedSource.urlPattern;
        datePattern = urlPattern.substring(urlPattern.lastIndexOf('[') + 1, urlPattern.lastIndexOf(']'));
        showNewComic(date);

        $scope.previousComicImage = function() {
            date = date.subtract(1, 'days');
            showNewComic(date);
        };

        $scope.nextComicImage = function() {
            date = date.add(1, 'days');
            showNewComic(date);
        };

    }]);
    
})();
