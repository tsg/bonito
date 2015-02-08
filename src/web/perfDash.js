(function() {
  'use strict';

  // Displays a detailed performance dashboard.
  var module = angular.module('bonitoPerformanceDashboard', [
    //'bonitoPerfDashMocks',
    'bonitoTimefilter',
    'bonitoPanel',
    'bonitoFormatters'
  ]);

  module.controller('performanceDashboard',
    ['_', 'Pages', 'perfDashProxy', 'timefilter', '$scope', '$interval', 'formatters',
  function(_, Pages, Proxy, timefilter, $scope, $interval, formatters) {
    _.assign(Pages.activePage, Pages.getPageById('dashboards'));
    Pages.activePage.activeSubpage = Pages.subpageById(Pages.activePage, 'platformwide');

    var self = this;

    self.dashboard = {
      display: {
        title: 'Platform'
      },
      viz: [{
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
      }],

      metrics: [{
        name: 'volume_avg',
        type: 'volume',
        config: {
          field: 'count',
          agg: 'avg',
          interval: 's'
        },
        display: {
          name: 'Volume average',
        }
      }, {
        name: 'volume_max',
        type: 'volume',
        config: {
          field: 'count',
          agg: 'total'
        },
        display: {
          name: 'Volume peak',
        }
      }, {
        name: 'errorsrate',
        type: 'errorsrate',
        config: {
          status_field: 'status',
          ok_value: 'Ok',
          count_field: 'count'
        },
        display: {
          name: 'Errors/k',
        }
      }, {
        name: 'rt_50th',
        type: 'percentile',
        config: {
          field: 'responsetime',
          datatype: 'duration',
          percentile: 50.0
        },
        display: {
          name: 'Response time 50th',
        }
      }, {
        name: 'rt_90th',
        type: 'percentile',
        config: {
          field: 'responsetime',
          datatype: 'duration',
          percentile: 99.0
        },
        display: {
          name: 'Response time 99th',
        }
      }],

      dimensions: [{
        name: 'services',
        display: {
          section: 'Services'
        },
        metrics: [{
          name: 'services',
          config: {
            type: 'cardinality',
            field: 'service'
          },
          display: {
            name: 'Services'
          }
        }, {
          name: 'avg_volume_per_service',
          config: {
            type: 'card_volume',
            agg: 'avg',
            dimension_field: 'service',
            field: 'count'
          },
          display: {
            name: 'Volume per service (avg)'
          }
        }],
        viz: [{
          name: 'topvolume',
          config: {
            type: 'topvolume',
            field: 'count'
          },
          display: {
            title: 'Top services by volume',
            type: 'barchart'
          }
        }, {
          name: 'toppercentile',
          config: {
            type: 'toppercentile',
            field: 'responsetime',
            percentile: 99.0
          },
          display: {
            title: 'Slowest services by 99th percentile',
            type: 'horizontal',
            class: 'warning',
            datatype: 'duration'
          }
        }, {
          name: 'toperrors',
          config: {
            type: 'toperrors',
            status_field: 'status',
            ok_value: 'Ok'
          },
          display: {
            title: 'Services with most errors',
            type: 'barchart',
            class: 'errors'
          }
        }]
      }, {
        name: 'hosts',
        display: {
          section: 'Hosts'
        },
        metrics: [{
          name: 'hosts',
          config: {
            type: 'cardinality',
            field: 'host'
          },
          display: {
            name: 'Hosts'
          }
        }, {
          name: 'avg_volume_per_host',
          config: {
            type: 'card_volume',
            agg: 'avg',
            dimension_field: 'host',
            field: 'count'
          },
          display: {
            name: 'Volume per host (avg)'
          }
        }],
        viz: [{
          name: 'topvolume',
          config: {
            type: 'topvolume',
            field: 'count'
          },
          display: {
            title: 'Top hosts by volume',
            type: 'barchart'
          }
        }, {
          name: 'toppercentile',
          config: {
            type: 'toppercentile',
            field: 'responsetime',
            percentile: 99.0
          },
          display: {
            title: 'Slowest hosts by 99th percentile',
            type: 'barchart',
            datatype: 'duration',
            class: 'warning'
          }
        }, {
          name: 'toperrors',
          config: {
            type: 'toperrors',
            status_field: 'status',
            ok_value: 'Ok'
          },
          display: {
            title: 'Top hosts by total number of errors',
            type: 'horizontal',
            class: 'errors'
          }
        }]
      }]
    };

    self.extractConfig = function(dashboard) {
      var pickConfig = function(d) {
        return _.pick(d, ['name', 'type', 'config']);
      };
      return {
        metrics: _.map(dashboard.metrics, pickConfig),
        viz: _.map(dashboard.viz, pickConfig),
        dimensions: _.map(dashboard.dimensions, function(dim) {
          return {
            name: dim.name,
            config: dim.config || {},
            metrics: _.map(dim.metrics, pickConfig),
            viz: _.map(dim.viz, pickConfig)
          };
        })
      };
    };

    self.setMetricDisplay = function(metric, value) {
      if (metric.config.datatype === 'duration') {
        metric.display.value = formatters.formatDuration(value);
        metric.display.class = formatters.formatDurationClass(value);
      } else {
        metric.display.value = formatters.formatNumber(value);
        metric.display.class = formatters.formatNumberClass(value);
      }
    };

    self.load = function() {
      $interval.cancel(self.timer);
      timefilter.interval.loading = true;

      Proxy.load({
        from: timefilter.time.from,
        to: timefilter.time.to,
        dashboard: self.extractConfig(self.dashboard)
      }).then(function() {
        _.each(Proxy.vizResult(), function(result, name) {
          _.find(self.dashboard.viz, {name: name}).data = result.data;
        });

        _.each(Proxy.metricsResult(), function(result, name) {
          var metric = _.find(self.dashboard.metrics, {name: name});
          metric.value = result.value;
          self.setMetricDisplay(metric, result.value);
        });

        _.each(Proxy.dimResult(), function(dimRes, name) {
          var dim = _.find(self.dashboard.dimensions, {name: name});
          _.each(dimRes.metrics, function(result, name) {
            var metric = _.find(dim.metrics, {name: name});
            metric.value = result.value;
            self.setMetricDisplay(metric, result.value);
          });

          _.each(dimRes.viz, function(vizRes, name) {
            _.find(dim.viz, {name: name}).values = vizRes.values;
          });
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
