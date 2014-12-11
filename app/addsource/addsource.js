'use strict';

angular.module('projectApp')

.directive('addSourceButton', function() {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'addsource/add_source_button.html',
        controller: 'AddRemoveSourceController'
    };
})

.controller('AddRemoveSourceController', ['$modal', 'Source', '$scope', 'selectedSourceValue', function($modal, Source, $scope, selectedSourceValue) {
    console.log('AddRemoveSourceController loaded.');
    
    $scope.selectedSource = selectedSourceValue.selectedSource;
    
    $scope.openNewSourceDialog = function() {
        var newDialog = $modal.open({
            templateUrl: 'addsource/newSourceForm.html',
            controller: 'AddSourceController'
        });
        
        newDialog.result.then(function (newSource) {
            Source.save(newSource, function(savedSource) {
                $scope.$broadcast('SourcesUpdated', savedSource);
            });
        });

    };

    $scope.openModifySourceDialog = function() {
        var modifyDialog = $modal.open({
            templateUrl: 'addsource/modifySourceForm.html',
            controller: 'ModifySourceController',
            resolve: {
                existingSource: function() {return selectedSourceValue.selectedSource || {};}
            }
        });
        
        modifyDialog.result.then(function (modifiedSource) {
            // TBI
        });

    };
    

}])

.controller('AddSourceController', ['$modalInstance', '$scope', function($modalInstance, $scope) {
            
    $scope.ok = function() {
        $modalInstance.close($scope.source);
    };
    
    $scope.cancel = function() {
        $modalInstance.dismiss();
    }
}])

.controller('ModifySourceController', ['$modalInstance', '$scope', 'existingSource', function($modalInstance, $scope, existingSource) {
    
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
