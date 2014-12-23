(function() {
    
    'use strict';
    
    var app = angular.module('projectApp');
    
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
            },
            
            delete: function(source) {
                console.log('Deleting source with id: ' + source._id);
                return Source.delete({typeId: source._id}, function() {
                    model.queryAllSources();
                }).$promise;
            }
        };
        
        return model;
        
    }]);
    
})();
