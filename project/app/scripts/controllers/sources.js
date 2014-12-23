(function() {
    
    'use strict';
    
    var app = angular.module('projectApp');
    
    app.controller('SourcesController', ['Source', '$scope', '$routeParams', function(Source, $scope, $routeParams) {
        console.log('SourcesController loaded');
        
        Source.queryAllSources();        
        $scope.sources = function() {return Source.sources; };
        
        $scope.isActive = function(id) {
            var active = (id === $routeParams.typeId);
            return active;
        };
        
    }]);

})();
