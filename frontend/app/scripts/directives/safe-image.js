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
				console.log('directive controller initialized');
				var vm = {};
				$scope.vm = vm;

				$scope.$on('nextOrPreviousClicked', function (event) {
					vm.imageStatus = 'transistioning';
				});

			},
			
			link: function (scope, element, attrs) {

				element.children().on('error', function (event) {
					console.log('error');
					scope.vm.imageStatus = 'bad';
					scope.$apply();
				});
			
				element.children().on('load', function (event) {
					console.log('load');
					scope.vm.imageStatus = 'good';
					scope.$apply();
				});

				element.children().on('onloadstart', function () {
					console.log('onloadstart');
					scope.vm.transistioning = true;
					scope.$apply();
				});

				element.children().on('onloadend', function () {
					console.log('onloadend');
					scope.vm.transistioning = false;
					scope.$apply();
				});
			}
		};
	});

})();
