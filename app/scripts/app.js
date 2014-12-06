'use strict';

angular.module('projectApp', [
    /*'ngAnimate',*/
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
        redirectTo: '/:type/' + moment().format('YYYYMMDD')
    })
    .when('/:type/:date', {
        templateUrl: 'views/main.html'
    })
    .otherwise({
        redirectTo: '/'
    });
}])

.value('apiUrl', 'http://viva-pablo.codio.io:3000/comics/:id')

.factory('Source', ['$resource', 'apiUrl', function($resource, apiUrl) {
    return $resource(apiUrl, {}, {'query': {method: 'GET', cache: true, isArray: true}});
}])

.controller('SourcesController', ['Source', function(Source) {
    console.log('SourcesController loaded');
    
    var scope = this;
    
    Source.query(function(data) {
        scope.sources = data;
    }, function(err) {
        console.log('Could not get list of sources. Error: ' + err);
    });
}])

.directive('sourcesList', function() {
    return {
        restrict: 'E',
        templateUrl: '/views/sources_list.html',
        controller: 'SourcesController',
        controllerAs: 'sources'
    };
})

.controller('MyCarouselController', ['$routeParams', 'Source', '$location', function($routeParams, Source, $location) {
    console.log('MyCarouselController loaded.');
    console.log('type: ' + $routeParams.type + '; date: ' + $routeParams.date);

    var requestedComic = {
        type: $routeParams.type,
        date: $routeParams.date
    };

    var scope = this;
    
    Source.query(function(sources) {
        console.log(sources);
        var source = sources.filter(function(source) {
            console.log('comparing ' + source.type + ' with ' + requestedComic.type);
            return source.type === requestedComic.type;
        });

        var urlPattern = source[0].urlPattern;
        var datePattern = urlPattern.substring(urlPattern.lastIndexOf('[') + 1, urlPattern.lastIndexOf(']'));
        var newDate = moment(requestedComic.date, 'YYYYMMDD').format(datePattern);
        scope.comic = {
            url: urlPattern.replace(/\[.*\]/, newDate),
            date: requestedComic.date
        };
        
    });
    
    this.previousComicImage = function(date) {
        console.log('previousComicImage called with date ' + date);
        $location.path('/' + requestedComic.type + '/' + moment(date, 'YYYYMMDD').subtract(1, 'days').format('YYYYMMDD'));
    };

    this.nextComicImage = function(date) {
        console.log('nextComicImage called with date ' + date);
        $location.path('/' + requestedComic.type + '/' + moment(date, 'YYYYMMDD').add(1, 'days').format('YYYYMMDD'));
    };

}])

.directive('comicsCarousel', function() {
    return {
        restrict: 'E',
        templateUrl: 'views/comics_carousel.html',
        controller: 'MyCarouselController',
        controllerAs: 'carousel'
    };
})
;
