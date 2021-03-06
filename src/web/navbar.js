(function() {
  'use strict';

  var app = angular.module('navbar-directive', []);

  app.directive('navbar', function() {
    return {
      restrict: 'E',
      templateUrl: 'navbar.html',
      transclude: true,
      controller: ['Pages', 'timefilter', 'timepicker',
        function(Pages, timefilter, timepicker) {
        var self = this;

        self.pages = Pages.getPages();

        self.timefilter = timefilter.time;
        self.interval = timefilter.interval;

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
