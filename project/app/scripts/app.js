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

    app.config(['$routeProvider', function($routeProvider) {
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
                            // Not reject because we want controller to be executed to set
                            // 'selectedSource' to undefined.
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
    
})();
