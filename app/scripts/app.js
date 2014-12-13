'use strict';

angular.module('projectApp', [
    'ngAnimate',
    'ngAria',
    'ngCookies',
    'ngMessages',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ui.bootstrap'
])

.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
    .when('/', {
        templateUrl: 'views/main.html'
    })
    .when('/:typeId', {
        templateUrl: 'views/main.html',
        resolve: {
            selectedSource: function($route, Source) {
                return Source.get({typeId: $route.current.params.typeId}).$promise;
            }
        },
        controller: function(selectedSource, selectedSourceValue) {
            console.log('setting global value');
            selectedSourceValue.selectedSource = selectedSource;
        }
    })
    .otherwise({
        redirectTo: '/'
    });
}])

.value('selectedSourceValue', {})

.value('apiUrl', 'http://viva-pablo.codio.io:3000/comics/:typeId')


.factory('Source', ['$resource', 'apiUrl', function($resource, apiUrl) {
    return $resource(apiUrl, {'typeId': '@_id'}, {'query': {method: 'GET', cache: true, isArray: true}, 'get': {cache: true}});
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
    
    $scope.isActive = function(id) {
        var active = (id === $routeParams.typeId);
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

.controller('MyCarouselController', ['$routeParams', '$scope', 'selectedSourceValue', function($routeParams, $scope, selectedSourceValue) {
    console.log('MyCarouselController loaded.');
    
    $scope.comic = {};
    
    var selectedSource = selectedSourceValue.selectedSource;
    
    if (!selectedSource) {
        return;
    }
   
    
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
    
    console.log('function defined');
    $scope.previousComicImage = function() {
        date = date.subtract(1, 'days');
        showNewComic(date);
    };

    $scope.nextComicImage = function() {
        date = date.add(1, 'days');
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
