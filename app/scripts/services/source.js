(function() {
    
    'use strict';
    
    var app = angular.module('projectApp');
    
    app.factory('Source', ['$resource', 'apiUrl', '$q', function($resource, apiUrl, $q) {
        
        var Source = $resource(
            apiUrl, {'typeId': '@_id'},
             {'update': {method: 'PUT'}},
             {'query': {cache: true}}
        );
        
        function getFirstSource() {
            var defer = $q.defer();

            var allSourcesPromise = model.queryAllSources();

            allSourcesPromise.then(function(allSources) {
                if (allSources.length > 0) {
                    defer.resolve(allSources[0]);
                } else {
                    defer.reject();
                }
            });

            return defer.promise;
        }

        function queryAllSources() {
            console.log('querying all sources');
            return Source.query(function(sourcesFromServer) {
                model.sources = sourcesFromServer;
            }).$promise;
        }

        function findById(id) {
            console.log('finding by id');
            return Source.get({typeId: id}).$promise;
        }

        function createNew(newSource) {
            return Source.save(newSource, function(savedSource) {
                model.sources.push(savedSource);
            }).$promise;
        }
        
        function update(source) {
            console.log('Update function called on model. Saving this one:');
            console.log(source);
            return Source.update(source, function() {
                console.log('It is now saved. Updating model.');
                model.queryAllSources();
            }).$promise;
        };

        function remove(source) {
            console.log('Deleting source with id: ' + source._id);
            return Source.delete({typeId: source._id}, function() {
                model.queryAllSources();
            }).$promise;
        }
        
        var model = {
            sources: [],
            
            getFirstSource: getFirstSource,
            queryAllSources: queryAllSources,
            findById: findById,
            createNew: createNew,
            update: update,
            remove: remove
        };
        
        return model;
        
    }]);
    
})();
