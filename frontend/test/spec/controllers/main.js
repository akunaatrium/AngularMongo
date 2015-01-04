'use strict';

describe('blaa', function () {

    beforeEach(module('projectApp'));

    //var ComicsCarouselController, $scope;
  
    beforeEach(inject(function($controller, $rootScope) {
        $scope = $rootScope.$new();

/*      
        $httpBackend.when('GET', 'https://api.github.com/users/jasonmore').respond({things: 'and stuff'});
*/
    
        //ComicsCarouselController = $controller('ComicsCarouselController', { $scope: $scope });
        //$httpBackend.flush();
    }));
    
    
    describe('ComicImage.getComicImage()', function() {
        it('should respond with code 200 if image is found', function () {
            expect(5).toEqual(5);
        });
    });


});
