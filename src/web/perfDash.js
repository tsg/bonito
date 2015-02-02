(function() {
  'use strict';

  // Displays a detailed performance dashboard.
  var module = angular.module('bonitoPerformanceDashboard', [
    'bonitoPerfDashMocks',
    'bonitoTimefilter',
    'bonitoPanel'
  ]);

  module.controller('performanceDashboard',
    ['_', 'Pages', 'perfDashProxyMock', 'timefilter', '$scope', '$interval',
  function(_, Pages, Proxy, timefilter, $scope, $interval) {
    _.assign(Pages.activePage, Pages.getPageById('dashboards'));
    Pages.activePage.activeSubpage = Pages.subpageById(Pages.activePage, 'platformwide');

    var self = this;

    self.volumeData = [];

    self.load = function() {
      $interval.cancel(self.timer);
      timefilter.interval.loading = true;

      Proxy.load({
        from: timefilter.time.from,
        to: timefilter.time.to
      }).then(function() {
        self.volumeData = Proxy.volumeValues();

        timefilter.interval.loading = false;
        if (timefilter.interval.value) {
          // using $interval instead of $timeout here because
          // the end-2-end tests don't wait for $interval but wait for $timeout.
          self.timer = $interval(function() {
            self.load();
          }, timefilter.interval.value, 1);
        }
      });
    };

    // watch for time filter changes
    $scope.$watch(function() {
      return timefilter.time;
    }, function(newVals, oldVals) {
      if (newVals !== oldVals) {
        self.load();
      }
    }, true);

    // watch for interval changes
    $scope.$watch(function() {
      return timefilter.interval.value;
    }, function(newVals, oldVals) {
      if (newVals !== oldVals) {
        self.load();
      }
    });

    // initial load
    this.load();

  }]);

})();
