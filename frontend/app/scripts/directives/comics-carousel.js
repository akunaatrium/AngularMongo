(function() {

    'use strict';
    
    var app = angular.module('projectApp');
    
    app.directive('comicsCarousel', function() {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'views/comics-carousel.html'
        };
    });
    
})();
