(function() {
  'use strict';

  var module = angular.module('bonitoTimepicker', []);

  module.directive('bonitoTimepicker', function(_, quickRanges) {
    return {
      restrict: 'E',
      templateUrl: 'timepicker/timepicker.html',
      controller: function(timefilter) {
        var self = this;
        self.time = timefilter.get();
        self.mode = 'quick';

        self.quickLists = _(quickRanges).groupBy('section').values().value();

        self.setMode = function(mode) {
          self.mode = mode;
        };
      },
      controllerAs: 'timepicker'
    };
  });

})();
