'use strict';

/**
 * @ngdoc function
 * @name projectApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the projectApp
 */
angular.module('projectApp')
  .controller('MainCtrl', function () {
    this.comics = [
        {
         url: 'https://garfield.com/uploads/strips/2014-12-04.jpg',
         description: 'Blaa 1'
        },
        {
         url: 'https://garfield.com/uploads/strips/2014-12-03.jpg',
         description: 'Blaa 2'
        },
        {
         url: 'https://garfield.com/uploads/strips/2014-12-02.jpg',
         description: 'Blaa 3'
        },
        {
         url: 'https://garfield.com/uploads/strips/2014-12-01.jpg',
         description: 'Blaa 4'
        }        
    ];
  });
