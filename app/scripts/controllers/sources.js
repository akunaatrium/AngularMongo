(function() {
    
    'use strict';
    
    var app = angular.module('projectApp');
    
    app.controller('SourcesController', ['Source', '$scope', '$routeParams', function(Source, $scope, $routeParams) {
        console.log('SourcesController loaded');
        
        var vm = this;
        
        Source.queryAllSources();
        vm.sources = function() {return Source.sources; };
        
        vm.isActive = function(id) {
            var active = (id === $routeParams.typeId);
            return active;
        };
        
    }]);

})();
