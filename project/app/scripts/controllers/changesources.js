(function() {

    'use strict';

    var app = angular.module('projectApp');
    
    app.controller('ChangeSourcesController', ['$modal', 'Source', '$scope', '$route', 'selectedSourceValue', function($modal, Source, $scope, $route, selectedSourceValue) {
        console.log('ChangeSourcesController loaded.');

        $scope.openNewSourceDialog = function() {
            var newDialog = $modal.open({
                templateUrl: 'views/newSourceForm.html',
                controller: 'AddSourceDialogController'
            });
            
            newDialog.result.then(function(sourceToBeSaved) {
                Source.createNew(sourceToBeSaved);
            });
        };

        $scope.openModifySourceDialog = function() {
            var modifyDialog = $modal.open({
                templateUrl: 'views/modifySourceForm.html',
                controller: 'ModifySourceDialogController',
                resolve: {
                    existingSource: function() {return selectedSourceValue.selectedSource || {};}
                }
            });
            
            modifyDialog.result.then(function(sourceToBeModified) {
                Source.update(sourceToBeModified).then(function() {
                    $route.reload();
                });
            });
        };
        
        $scope.deleteSource = function() {
            Source.delete(selectedSourceValue.selectedSource).then(function() {
                $route.reload();
            });
        };
        
        $scope.nothingIsSelected = function() {
            return !selectedSourceValue.selectedSource;
        };
        
    }]);

    app.controller('AddSourceDialogController', ['$modalInstance', '$scope', function($modalInstance, $scope) {

        var dialogBox = $modalInstance;
        
        $scope.ok = function() {
            dialogBox.close($scope.source);
        };

        $scope.cancel = function() {
            dialogBox.dismiss();
        };
    }]);

    app.controller('ModifySourceDialogController', ['$modalInstance', '$scope', 'existingSource', 'Source', function($modalInstance, $scope, existingSource) {

        var dialogBox = $modalInstance;
        
        $scope.source = existingSource;

        $scope.ok = function() {
            dialogBox.close($scope.source);
        };

        $scope.cancel = function() {
            dialogBox.dismiss();
        };
    }]);

})();
