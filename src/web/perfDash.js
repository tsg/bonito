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
    self.errorsData = [];
    self.rt50thData = [];
    self.rt99thData = [];

    self.metrics = [{
      display: {
        name: 'Volume average',
        value: '120k/s',
        class: 'number-k'
      }
    }, {
      display: {
        name: 'Volume peak',
        value: '520k/s',
        class: 'number-k'
      }
    }, {
      display: {
        name: 'Errors/k',
        value: '300',
        class: 'number'
      }
    }, {
      display: {
        name: 'Response time 50th',
        value: '20ms',
        class: 'duration-ms'
      }
    }, {
      display: {
        name: 'Response time 99th',
        value: '30ms',
        class: 'duration-ms'
      }
    }];

    self.dimensions = [{
      name: 'services',
      display: {
        section: 'Services'
      },
      metrics: [{
        display: {
          name: 'Services',
          value: '45',
          class: 'number-'
        }
      }, {
        display: {
          name: 'Volume per service (avg)',
          value: '2666/s',
          class: 'number-'
        }
      }],
      viz: [{
        display: {
          title: 'Top services by volume',
          type: 'barchart'
        },
        values: [{
          name: 'Service16',
          value: 34000
        }, {
          name: 'Service18',
          value: 25000
        }, {
          name: 'Service5',
          value: 20300
        }, {
          name: 'Service9',
          value: 19700
        }, {
          name: 'Service34',
          value: 9600
        }],
      }, {
        display: {
          title: 'Slowest services by 99th percentile',
          type: 'barchart'
        },
        values: [{
          name: 'Service16',
          value: 340
        }, {
          name: 'Service18',
          value: 250
        }, {
          name: 'Service5',
          value: 203
        }, {
          name: 'Service9',
          value: 197
        }, {
          name: 'Service34',
          value: 196
        }]
      }]
    }];

    self.load = function() {
      $interval.cancel(self.timer);
      timefilter.interval.loading = true;

      Proxy.load({
        from: timefilter.time.from,
        to: timefilter.time.to
      }).then(function() {
        self.volumeData = Proxy.volumeValues();
        self.errorsData = Proxy.errorsData();
        self.rt50thData = Proxy.rt50thData();
        self.rt99thData = Proxy.rt99thData();

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
