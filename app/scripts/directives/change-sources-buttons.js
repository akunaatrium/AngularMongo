(function() {
    
    'use strict';
    
    var app = angular.module('projectApp');

    app.directive('changeSourcesButtons', function() {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'views/change-sources-buttons.html'
        };
    });
    
})();
