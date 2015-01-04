(function() {

    'use strict';

    var app = angular.module('projectApp');

    app.controller('ChangeSourcesController', ['$modal', 'Source', '$state', 'selectedSourceValue', function($modal, Source, $state, selectedSourceValue) {
        console.log('ChangeSourcesController loaded.');

        var vm = this;

        vm.openNewSourceDialog = function() {
            var newDialog = $modal.open({
                templateUrl: 'views/newSourceForm.html',
                controller: 'AddSourceDialogController',
                controllerAs: 'vm'
            });

            newDialog.result.then(function(sourceToBeSaved) {
                Source.createNew(sourceToBeSaved).then(function(sourceSaved) {
                    $state.go('ComicView', {typeId: sourceSaved._id});
                });
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
                    $state.reload();
                });
            });
        };

        vm.deleteSource = function() {
            Source.remove(selectedSourceValue.selectedSource)
                .then(function() {
                        return Source.getFirstSource();
                })
                .then(function(firstSourceInList) {
                    $state.go('ComicView', {typeId: firstSourceInList._id});
                })
                .catch(function() {
                    $state.go('Main');
                });
        };

        vm.nothingIsSelected = function() {
            return !selectedSourceValue.selectedSource;
        };
    }]);

    app.controller('AddSourceDialogController', ['$modalInstance', function($modalInstance) {

        var vm = this;

        var dialogBox = $modalInstance;

        vm.ok = function() {
            dialogBox.close(vm.source);
        };

        vm.cancel = function() {
            dialogBox.dismiss();
        };
    }]);

    app.controller('ModifySourceDialogController', ['$modalInstance', 'existingSource', function($modalInstance, existingSource) {

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
