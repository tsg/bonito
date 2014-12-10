(function() {
  'use strict';

  var app = angular.module('navbar-directive', []);

  app.directive('navbar', function() {
    return {
      restrict: 'E',
      templateUrl: 'navbar.html',
      controller: ["Pages", function(Pages) {
        this.pages = Pages.getPages();

        // the activePage reference is shared between controllers
        this.activePage = Pages.activePage;
      }],
      controllerAs: 'navbar'
    };
  });
})();
