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

    app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
        $stateProvider.state('Main',
                   {
                    url: '/',
                    controller: function(selectedSourceValue, Source, $state) {
                        Source.getFirstSource().then(function(firstSource) {
                            selectedSourceValue.selectedSource = firstSource;
                            console.log('Going to ComicView state with id: ' + firstSource._id);
                            $state.go('ComicView', {typeId: firstSource._id});                            
                        }).catch(function() {
                            console.log('In Main state controller, did not find first source. Not showing a template.');
                        });
                    }
                   }
        );

        $stateProvider.state('ComicView',
                   {
                    url: '/:typeId',
                    templateUrl: 'views/main.html',
                    resolve: {
                        selectedSource: function($stateParams, $state, Source, $q) {
                            // We have a typeId in the URL. Let's find the comic and set selectedSource.
                            var defer = $q.defer();
                            console.log('$stateparams.typeId: %O', $stateParams.typeId);
                            Source.findById($stateParams.typeId).then(function(foundSource) {
                                defer.resolve(foundSource);
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
                        console.log('In ComicView controller, setting selectedSource as:');
                        console.log(selectedSource);
                        selectedSourceValue.selectedSource = selectedSource;
                    }
                   }
        );

        $urlRouterProvider.otherwise('/');
    }]);
    
    app.value('selectedSourceValue', {});

    app.value('apiUrl', 'http://viva-pablo.codio.io:3000/comics/:typeId');
    app.value('comicImageUrl', 'http://viva-pablo.codio.io:3000/comicimage/:typeId/:date');
    
})();
