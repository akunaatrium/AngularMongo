'use strict';

angular.module('projectApp')

.directive('addSourceButton', function() {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'addsource/add_source_button.html',
        controller: 'AddSourceController'
    };
})

.controller('AddSourceController', ['$modal', 'Source', '$scope', 'selectedSourceValue', function($modal, Source, $scope, selectedSourceValue) {
    console.log('AddSourceController loaded.');
    
    $scope.selectedSource = selectedSourceValue.selectedSource;
    
    $scope.openNewSourceDialog = function(selectedSource) {
        console.log('selected source coming in:');
        console.log(selectedSource);
        var modalInstance = $modal.open({
            templateUrl: 'addsource/newSourceForm.html',
            controller: 'DialogController',
            resolve: {
                existingSource: function() {return selectedSourceValue.selectedSource || {};}
            }
            });
        
        modalInstance.result.then(function (source) {
            Source.save(newSource, function() {
                $scope.$broadcast('SourcesUpdated', newSource);
            });
        });
    };
    
    
}])

.controller('DialogController', ['$modalInstance', '$scope', 'existingSource', function($modalInstance, $scope, existingSource) {
    
    console.log('existing source = ' + existingSource)
    
    $scope.source = {
        type: existingSource.type || '',
        urlPattern: existingSource.urlPattern || ''
    };
    
    $scope.ok = function() {
        $modalInstance.close($scope.source);
    };
    
    $scope.cancel = function() {
        $modalInstance.dismiss();
    }
}])
;
