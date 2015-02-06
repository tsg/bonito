(function() {
  'use strict';

  // Displays a detailed performance dashboard.
  var module = angular.module('bonitoPerformanceDashboard', [
    'bonitoPerfDashMocks',
    'bonitoTimefilter',
    'bonitoPanel',
    'bonitoFormatters'
  ]);

  module.controller('performanceDashboard',
    ['_', 'Pages', 'perfDashProxyMock', 'timefilter', '$scope', '$interval', 'formatters',
  function(_, Pages, Proxy, timefilter, $scope, $interval, formatters) {
    _.assign(Pages.activePage, Pages.getPageById('dashboards'));
    Pages.activePage.activeSubpage = Pages.subpageById(Pages.activePage, 'platformwide');

    var self = this;

    self.viz = [{
      name: 'volume',
      type: 'linechart',
      config: {
        type: 'volume',
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
        type: 'errorsrate',
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
        type: 'histogram',
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
        type: 'percentile',
        rt_field: 'responsetime',
        percentile: 99
      }
    }];

    self.metrics = [{
      name: 'volume_avg',
      config: {
        type: 'volume',
        field: 'count',
        agg: 'avg',
        interval: 's'
      },
      display: {
        name: 'Volume average',
      }
    }, {
      name: 'volume_max',
      config: {
        type: 'volume',
        field: 'count',
        agg: 'max',
        interval: 's'
      },
      display: {
        name: 'Volume peak',
      }
    }, {
      name: 'errorsrate',
      config: {
        type: 'errorsrate',
        status_field: 'status',
        ok_value: 'Ok',
        count_field: 'count',
        interval: 's',
        agg: 'avg'
      },
      display: {
        name: 'Errors/k',
      }
    }, {
      name: 'rt_50th',
      config: {
        type: 'percentile',
        field: 'responsetime',
        datatype: 'duration',
        percentile: 50.0
      },
      display: {
        name: 'Response time 50th',
      }
    }, {
      name: 'rt_90th',
      config: {
        type: 'percentile',
        field: 'responsetime',
        datatype: 'duration',
        percentile: 99.0
      },
      display: {
        name: 'Response time 99th',
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
        to: timefilter.time.to,
        viz: self.viz,
        metrics: self.metrics
      }).then(function() {

        _.each(Proxy.vizResult(), function(result, name) {
          _.find(self.viz, {name: name}).data = result.data;
        });

        _.each(Proxy.metricsResult(), function(result, name) {
          var metric = _.find(self.metrics, {name: name});
          metric.value = result.value;
          if (metric.config.datatype === 'duration') {
            metric.display.value = formatters.formatDuration(result.value);
            metric.display.class = formatters.formatDurationClass(result.value);
          } else {
            metric.display.value = formatters.formatNumber(result.value);
            metric.display.class = formatters.formatNumberClass(result.value);
          }
        });

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
