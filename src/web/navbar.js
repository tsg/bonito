(function() {
  'use strict';

  var app = angular.module('navbar-directive', []);

  app.directive('navbar', function() {
    return {
      restrict: 'E',
      templateUrl: 'navbar.html',
      transclude: true,
      controller: ["Pages", function(Pages) {
        self = this;

        self.pages = Pages.getPages();

        // the activePage reference is shared between controllers
        self.activePage = Pages.activePage;

        self.timepickerVisible = false;

        self.toggleTimepicker = function() {
          self.timepickerVisible = !self.timepickerVisible;
        };
      }],
      controllerAs: 'navbar'
    };
  });
})();
