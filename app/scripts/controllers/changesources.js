(function() {

    'use strict';

    var app = angular.module('projectApp');
    
    app.controller('ChangeSourcesController', ['$modal', 'Source', '$scope', '$route', 'selectedSourceValue', function($modal, Source, $scope, $route, selectedSourceValue) {
        console.log('ChangeSourcesController loaded.');

        var vm = this;
        
        vm.openNewSourceDialog = function() {
            var newDialog = $modal.open({
                templateUrl: 'views/newSourceForm.html',
                controller: 'AddSourceDialogController',
                controllerAs: 'vm'
            });
            
            newDialog.result.then(function(sourceToBeSaved) {
                Source.createNew(sourceToBeSaved);
            });
        };

        vm.openModifySourceDialog = function() {
            var modifyDialog = $modal.open({
                templateUrl: 'views/modifySourceForm.html',
                controller: 'ModifySourceDialogController',
                controllerAs: 'vm',
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
        
        vm.deleteSource = function() {
            Source.delete(selectedSourceValue.selectedSource).then(function() {
                $route.reload();
            });
        };
        
        vm.nothingIsSelected = function() {
            return !selectedSourceValue.selectedSource;
        };
    }]);

    app.controller('AddSourceDialogController', ['$modalInstance', '$scope', function($modalInstance, $scope) {

        var vm = this;
        
        var dialogBox = $modalInstance;
        
        vm.ok = function() {
            dialogBox.close(vm.source);
        };

        vm.cancel = function() {
            dialogBox.dismiss();
        };
    }]);

    app.controller('ModifySourceDialogController', ['$modalInstance', '$scope', 'existingSource', 'Source', function($modalInstance, $scope, existingSource, Source) {

        var vm = this;
        
        var dialogBox = $modalInstance;
        
        vm.source = existingSource;

        vm.ok = function() {
            dialogBox.close(vm.source);
        };

        vm.cancel = function() {
            dialogBox.dismiss();
        };
    }]);

})();
