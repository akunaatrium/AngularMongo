(function() {
    'use strict';
    var app = angular.module('projectApp');
    
    app.directive('sourcesList', function() {
        return {
            restrict: 'E',
            templateUrl: '/views/sources_list.html',
            controller: 'SourcesController',
            controllerAs: 'sources'
        };
    });
    
})();

