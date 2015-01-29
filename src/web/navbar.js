(function() {
  'use strict';

  var app = angular.module('navbar-directive', []);

  app.directive('navbar', function() {
    return {
      restrict: 'E',
      templateUrl: 'navbar.html',
      transclude: true,
      controller: ['Pages', 'timefilter', '$scope', '$location', 'timepicker', '$routeParams',
        function(Pages, timefilter, $scope, $location, timepicker, $routeParams) {
        var self = this;

        self.pages = Pages.getPages();

        timefilter.set(timepicker.fromUrlParameters($routeParams));

        self.timefilter = timefilter.time;

        // the activePage reference is shared between controllers
        self.activePage = Pages.activePage;

        self.timepickerVisible = false;

        self.toggleTimepicker = function() {
          self.timepickerVisible = !self.timepickerVisible;
        };

        // watch for time filter changes to update the URL bar
        $scope.$watch(function() {
          return timefilter.time;
        }, function(newVals, oldVals) {
          if (newVals !== oldVals) {
            var params = timepicker.toUrlParameters(timefilter.time);
            _.each(params, function(value, key) {
              $location.search(key, value);
            });
          }
        }, true);

      }],
      controllerAs: 'navbar'
    };
  });
})();
