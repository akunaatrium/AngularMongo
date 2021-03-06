(function() {
	
	'use strict';
	
	var app = angular.module('projectApp');
	
	app.filter('trusted', ['$sce', function ($sce) {
		return function (url) {
			return $sce.trustAsResourceUrl(url);
		};
	}]);

	app.directive('safeImage', function () {
		return {
			restrict: 'E',
			scope: {src:'@', imgClass: '@'},
			replace: true,
			transclude: true,
			template: '<div><img ng-src="{{src}}" class="{{imgClass}}" ng-show="vm.imageStatus==\'good\'"/>' +
			'<div class="spinner" ng-show="vm.imageStatus==\'transistioning\'"><div class="cube1"></div><div class="cube2"></div></div>' +
			'<ng-transclude ng-show="vm.imageStatus==\'bad\'"></ng-transclude></div>',

			controller: function ($scope) {
				var vm = {};
				$scope.vm = vm;

				$scope.$on('nextOrPreviousClicked', function (event) {
					vm.imageStatus = 'transistioning';
				});

			},
			
			link: function (scope, element, attrs) {
				element.children().on('error', function (event) {
					scope.vm.imageStatus = 'bad';
					scope.$apply();
				});
			
				element.children().on('load', function (event) {
					scope.vm.imageStatus = 'good';
					scope.$apply();
				});
			}
		};
	});

})();
