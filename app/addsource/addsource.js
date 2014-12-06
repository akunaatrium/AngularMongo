'use strict';

console.log('tere');

angular.module('projectApp')

.directive('addSourceButton', function() {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'addsource/add_source_button.html',
        controller: 'AddSourceController',
        controllerAs: 'addSource'
    };
})

.controller('AddSourceController', ['$modal', function($modal) {
    console.log('AddSourceController loaded.');
    this.openNewSourceDialog = function() {
        console.log('open is called');
        var modalInstance = $modal.open({
            templateUrl: 'addsource/newSourceForm.html',
            controller: 'ModalInstanceCtrl'
        });
    };
}])

.controller('ModalInstanceCtrl', function($modalInstance) {
    this.ok = function() {
        $modalInstance.close(this.selected.item);
    };
})
;