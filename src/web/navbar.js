(function() {
  'use strict';

  var app = angular.module('navbar-directive', []);

  app.directive('navbar', function() {
    return {
      restrict: 'E',
      templateUrl: 'navbar.html',
      transclude: true,
      controller: ['Pages', 'timefilter', '$scope', function(Pages, timefilter, $scope) {
        var self = this;

        self.pages = Pages.getPages();
        self.timefilter = timefilter.time;

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
