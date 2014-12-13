(function() {

    'use strict';

    var app = angular.module('projectApp');

    app.directive('addSourceButton', function() {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'addsource/add_source_button.html',
            controller: 'AddRemoveSourceController'
        };
    });

    app.controller('AddRemoveSourceController', ['$modal', 'Source', '$scope', '$route', 'selectedSourceValue', function($modal, Source, $scope, $route, selectedSourceValue) {
        console.log('AddRemoveSourceController loaded.');

        $scope.selectedSource = selectedSourceValue.selectedSource;

        $scope.openNewSourceDialog = function() {
            var newDialog = $modal.open({
                templateUrl: 'addsource/newSourceForm.html',
                controller: 'AddSourceDialogController'
            });
            
            newDialog.result.then(function(sourceToBeSaved) {
                Source.createNew(sourceToBeSaved);
            });
        };

        $scope.openModifySourceDialog = function() {
            var modifyDialog = $modal.open({
                templateUrl: 'addsource/modifySourceForm.html',
                controller: 'ModifySourceDialogController',
                resolve: {
                    existingSource: function() {return selectedSourceValue.selectedSource || {};}
                }
            });
            
            modifyDialog.result.then(function(sourceToBeModified) {
                Source.update(sourceToBeModified).then(function() {
                    selectedSourceValue.selectedSource = sourceToBeModified;
                    console.log('Setting this as selectedSource:');
                    console.log(sourceToBeModified);
                    console.log('Reloading view');
                    $route.reload();                    
                });
                
                //$scope.selectedSource = selectedSourceValue.selectedSource;
            });

        };


    }]);

    app.controller('AddSourceDialogController', ['$modalInstance', '$scope', function($modalInstance, $scope) {

        var dialogBox = $modalInstance;
        
        $scope.ok = function() {
            dialogBox.close($scope.source);
        };

        $scope.cancel = function() {
            dialogBox.dismiss();
        }
    }]);

    app.controller('ModifySourceDialogController', ['$modalInstance', '$scope', 'existingSource', 'Source', function($modalInstance, $scope, existingSource) {

        console.log('existing source = ' + existingSource)

        var dialogBox = $modalInstance;
        
        /*$scope.source = {
            type: existingSource.type || '',
            urlPattern: existingSource.urlPattern || ''
        };*/
        
        $scope.source = existingSource;

        $scope.ok = function() {
            dialogBox.close($scope.source);
        };

        $scope.cancel = function() {
            dialogBox.dismiss();
        }
    }]);
    
})();
