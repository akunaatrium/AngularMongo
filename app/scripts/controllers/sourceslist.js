(function() {
    
    'use strict';
    
    var app = angular.module('projectApp');
    
    app.controller('SourcesListController', ['Source', '$stateParams', function(Source, $stateParams) {
        console.log('SourcesListController loaded');
        
        var vm = this;
        
        var initialize = function() {
            Source.queryAllSources();
        };
        
        vm.getSources = function() {
            return Source.sources;
        };
        
        vm.isActive = function(id) {
            var active = (id === $stateParams.typeId);
            return active;
        };
        
        initialize();
    }]);

})(); 
