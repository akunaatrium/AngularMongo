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

.controller('AddSourceController', ['$modal', 'Source', '$scope', '$routeParams', function($modal, Source, $scope, $routeParams) {
    console.log('AddSourceController loaded.');
        
    $scope.openNewSourceDialog = function() {
        var modalInstance = $modal.open({
            templateUrl: 'addsource/newSourceForm.html',
            controller: 'DialogController',
            controllerAs: 'dialog',
            resolve:
                {
                    currentSource: function() {
                        return 'tere';
                    }
                }
            });
        
        modalInstance.result.then(function (newSource) {
            Source.save(newSource, function() {
                $scope.$broadcast('SourcesUpdated', newSource);
            });
        });
    };
    
    
}])

.controller('DialogController', ['$modalInstance', '$scope', 'currentSource', function($modalInstance, $scope, currentSource) {

    console.log('currentSource:');
    console.log(currentSource);
    
    $scope.newSource = {
        type: 'Coolio',
        urlPattern: 'http://www.coolioblaa.com/[YYYYMMDD].jpg'
    };
    
    $scope.ok = function() {
        $modalInstance.close($scope.newSource);
    };
    
    $scope.cancel = function() {
        $modalInstance.dismiss();
    }
}])
;
