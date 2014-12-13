(function() {
    
    'use strict';

    var app = angular.module('projectApp', [
        'ngAnimate',
        'ngAria',
        'ngCookies',
        'ngMessages',
        'ngResource',
        'ngRoute',
        'ngSanitize',
        'ui.bootstrap'
    ]);

    app.config(['$routeProvider', function ($routeProvider) {
        $routeProvider
        .when('/', {
            templateUrl: 'views/main.html'
        })
        .when('/:typeId', {
            templateUrl: 'views/main.html',
            resolve: {
                selectedSource: function($route, Source, $q, $location) {
                    var defer = $q.defer();
                    
                    Source.findById($route.current.params.typeId)
                        .then(function(result) {
                            console.log('found the comic with url id:');
                            console.log(result);
                            defer.resolve(result);
                        }, function() {
                            $location.path('/');
                            defer.resolve();
                        });
                    
                    return defer.promise;
                }
            },
            controller: function(selectedSource, selectedSourceValue) {
                console.log('In general controller, setting selectedSource as:');
                console.log(selectedSource);
                selectedSourceValue.selectedSource = selectedSource;
            }
        })
        .otherwise({
            redirectTo: '/'
        });
    }]);

    app.value('selectedSourceValue', {});

    app.value('apiUrl', 'http://viva-pablo.codio.io:3000/comics/:typeId');


    app.factory('Source', ['$resource', 'apiUrl', function($resource, apiUrl) {
        
        var Source = $resource(
            apiUrl, {'typeId': '@_id'},
            {'query':
                {method: 'GET', isArray: true},
             'update':
                {method: 'PUT'}
            }
        );
        
        var model = {
            sources: [],
            
            queryAllSources: function() {
                return Source.query(function(sourcesFromServer) {
                    model.sources = sourcesFromServer;
                }).$promise;
            },
            
            findById: function(id) {
                return Source.get({typeId: id}).$promise;
            },
            
            createNew: function(newSource) {
                return Source.save(newSource, function(savedSource) {
                    model.sources.push(savedSource);
                }).$promise;
            },
            
            update: function(source) {
                console.log('Update function called on model. Saving this one:');
                console.log(source);
                return Source.update(source, function() {
                    console.log('It is now saved. Updating model.');
                    model.queryAllSources();
                }).$promise;
            }
        };
        
        return model;
        
    }]);

    app.filter('urlEncoded', function() {
        return function(inputToEncode) {
            return encodeURIComponent(inputToEncode);
        };
    });

    app.controller('SourcesController', ['Source', '$scope', '$routeParams', function(Source, $scope, $routeParams) {
        console.log('SourcesController loaded');
        
        Source.queryAllSources();        
        $scope.sources = function() {return Source.sources; };
        
        $scope.isActive = function(id) {
            var active = (id === $routeParams.typeId);
            return active;
        };
    }]);

    app.directive('sourcesList', function() {
        return {
            restrict: 'E',
            templateUrl: '/views/sources_list.html',
            controller: 'SourcesController',
            controllerAs: 'sources'
        };
    });

    app.controller('MyCarouselController', ['$routeParams', '$scope', 'selectedSourceValue', function($routeParams, $scope, selectedSourceValue) {
        console.log('MyCarouselController loaded.');

        $scope.comic = {};

        var selectedSource = selectedSourceValue.selectedSource;

        console.log('Currently selected comic:');
        console.log(selectedSource);
        
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

    }]);


    app.directive('comicsCarousel', function() {
        return {
            restrict: 'E',
            templateUrl: 'views/comics_carousel.html',
            controller: 'MyCarouselController'
        };
    });
    
})();
