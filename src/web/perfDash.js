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
    self.rtHistogramData = [];

    self.viz = [{
      name: 'volume',
      type: 'linechart',
      config: {
        field: 'count',
      },
      display: {
        title: 'Volume',
        ylabel: 'Requests/s',
        classes: 'bnt-volume-graph'
      }
    }, {
      name: 'errorsrate',
      type: 'linechart',
      config: {
        status_field: 'status',
        ok_value: 'Ok',
        count_field: 'count'
      },
      display: {
        ylabel: 'Errors/k',
        title: 'Errors rate',
        type: 'area',
        classes: 'errors bnt-errors-rate-graph'
      }
    }, {
      name: 'rt_histogram',
      type: 'histogram',
      display: {
        title: 'Response time histogram',
        ylabel: 'Number of transactions',
        classes: 'bnt-responsetime-histogram',
        datatype: 'duration'
      },
      config: {
        rt_field: 'responsetime',
        count_field: 'count'
      }
    }, {
      name: 'rt_percentile',
      type: 'linechart',
      display: {
        title: 'Response times: 99th percentile',
        ylabel: 'Response time 99th',
        classes: 'bnt-responsetime-99th',
        datatype: 'duration'
      },
      config: {
        rt_field: 'responsetime',
        percentile: 99
      }
    }];

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
        datatype: 'duration',
        display: {
          title: 'Slowest services by 99th percentile',
          type: 'horizontal',
          class: 'warning'
        },
        values: [{
          name: 'Service16',
          value: 340000
        }, {
          name: 'Service18',
          value: 250000
        }, {
          name: 'Service5',
          value: 203000
        }, {
          name: 'Service9',
          value: 197000
        }, {
          name: 'Service34',
          value: 196000
        }, {
          name: 'Service52',
          value: 203000
        }, {
          name: 'Service91',
          value: 107000
        }, {
          name: 'Service3',
          value: 106000
        }]
      }, {
        display: {
          title: 'Services with most errors',
          type: 'barchart',
          class: 'errors'
        },
        values: [{
          name: 'Service34',
          value: 164
        }, {
          name: 'Service92',
          value: 65
        }, {
          name: 'Service12',
          value: 12
        }, {
          name: 'Service5',
          value: 9
        }, {
          name: 'Service6',
          value: 9
        }, {
          name: 'Service72',
          value: 65
        }, {
          name: 'Service32',
          value: 12
        }, {
          name: 'Service51',
          value: 9
        }, {
          name: 'Service62',
          value: 9
        }]
      }]
    }, {
      name: 'hosts',
      display: {
        section: 'Hosts'
      },
      metrics: [{
        display: {
          name: 'Hosts',
          value: '234',
          class: 'number-'
        }
      }, {
        display: {
          name: 'Volume per host (avg)',
          value: '100/s',
          class: 'number-'
        }
      }],
      viz: [{
        display: {
          title: 'Top hosts by volume',
          type: 'barchart'
        },
        values: [{
          name: 'alpha.service1.example.com',
          value: 45
        }, {
          name: 'omega.service1.example.com',
          value: 123
        }, {
          name: 'beta.service1.example.com',
          value: 67
        }],
      }, {
        datatype: 'duration',
        display: {
          title: 'Slowest hosts by 99th percentile',
          type: 'barchart',
          class: 'warning'
        },
        values: [{
          name: 'java1.service-java.example.com',
          value: 640000
        }, {
          name: 'java2.service-java.example.com',
          value: 250000
        }, {
          name: 'jave4.service-java.example.com',
          value: 203000
        }]
      }, {
        display: {
          title: 'Top hosts by total number of errors',
          type: 'horizontal',
          class: 'errors'
        },
        values: [{
          name: 'java1.service-java.example.com',
          value: 64
        }, {
          name: 'java2.service-java.example.com',
          value: 65
        }, {
          name: 'jave4.service-java.example.com',
          value: 12
        }, {
          name: 'jave14.service-java.example.com',
          value: 9
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
        _.find(self.viz, {name: 'volume'}).data = Proxy.volumeValues();
        _.find(self.viz, {name: 'errorsrate'}).data = Proxy.errorsData();
        _.find(self.viz, {name: 'rt_histogram'}).data = Proxy.rtHistogramData();
        _.find(self.viz, {name: 'rt_percentile'}).data = Proxy.rt99thData();

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
