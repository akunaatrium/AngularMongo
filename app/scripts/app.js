(function() {
    
    'use strict';

    var app = angular.module('projectApp', [
        'ngAnimate',
        'ngAria',
        'ngCookies',
        'ngMessages',
        'ngResource',
        'ngSanitize',
        'ui.bootstrap',
        'ui.router'
    ]);

    app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider) {
        $stateProvider
            .state('Main',
                   {
                    url: '',
                    templateUrl: 'views/main.html',
                    controller: function(selectedSourceValue, Source) {
                        selectedSourceValue.selectedSource = Source.getFirstSource();
                    }
                   }
                  )
            .state('ComicView',
                   {
                    url: '/:typeId',
                    templateUrl: 'views/main.html',
                    resolve: {
                        selectedSource: function($stateParams, $state, Source, $q) {
                            var defer = $q.defer();

                            Source.findById($stateParams.typeId)
                                .then(function(result) {
                                    console.log('found the comic with url id:');
                                    console.log(result);
                                    defer.resolve(result);
                                }, function() {
                                    $state.go('Main');
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
                   }
                  );
    }]);
    
    app.value('selectedSourceValue', {});

    app.value('apiUrl', 'http://viva-pablo.codio.io:3000/comics/:typeId');
    
})();
