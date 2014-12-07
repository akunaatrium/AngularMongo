'use strict';

angular.module('projectApp', [
    'ngAnimate',
    'ngAria',
    'ngCookies',
    'ngMessages',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'ui.bootstrap'
])
.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
    .when('/', {
        templateUrl: 'views/main.html'
    })
    .when('/:type', {
        templateUrl: 'views/main.html'
    })
    .otherwise({
        redirectTo: '/'
    });
}])

.value('apiUrl', 'http://viva-pablo.codio.io:3000/comics/:id')

.factory('Source', ['$resource', 'apiUrl', function($resource, apiUrl) {
    var Source = $resource(apiUrl, {}, {'query': {method: 'GET', cache: true, isArray: true}});
            
    return Source;
}])

.filter('urlEncoded', function() {
    return function(inputToEncode) {
        return encodeURIComponent(inputToEncode);
    };
})

.controller('SourcesController', ['Source', '$scope', '$routeParams', function(Source, $scope, $routeParams) {
    console.log('SourcesController loaded');
    
    $scope.sources = Source.query();
    
    $scope.$on('SourcesUpdated', function(event, newSource) {
       console.log(newSource);
        $scope.sources.push(newSource);
    });
    
    $scope.isActive = function(sourceType) {
        var active = (sourceType === $routeParams.type);
        return active;
    };
    
}])

.directive('sourcesList', function() {
    return {
        restrict: 'E',
        templateUrl: '/views/sources_list.html',
        controller: 'SourcesController',
        controllerAs: 'sources'
    };
})

.controller('MyCarouselController', ['$routeParams', 'Source', '$scope', function($routeParams, Source, $scope) {
    console.log('MyCarouselController loaded.');

    var requestedComicType = decodeURIComponent($routeParams.type);

    var date = moment().subtract(1, 'days');

    var datePattern;
    var urlPattern;

    $scope.comic = {};
    
    var requestedSourcePromise = Source.query();
    requestedSourcePromise.$promise.then(function(allSources) {
        var filteredSources = allSources.filter(function(source) {
            return source.type === requestedComicType;
        });
        var requestedSource = filteredSources[0];
        
        urlPattern = requestedSource.urlPattern;
        datePattern = urlPattern.substring(urlPattern.lastIndexOf('[') + 1, urlPattern.lastIndexOf(']'));
        
        showNewComic(date);
    });
    
    var showNewComic = function(newDate) {
        var comicSpecificCurrentDate = newDate.format(datePattern);
        $scope.comic.url = urlPattern.replace(/\[.*\]/, comicSpecificCurrentDate);
        $scope.comic.dateToShow = moment(newDate).format('LL');
    };
    
    $scope.previousComicImage = function() {
        date = date.subtract(1, 'days');
        showNewComic(date);
    };

    $scope.nextComicImage = function() {
        date = date.subtract(1, 'days');
        showNewComic(date);
    };

}])


.directive('comicsCarousel', function() {
    return {
        restrict: 'E',
        templateUrl: 'views/comics_carousel.html',
        controller: 'MyCarouselController'
    };
})

;
