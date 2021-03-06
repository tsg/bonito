(function() {
  'use strict';

  var module = angular.module('bonitoPerfDashMocks', [
    'bonitoTestData'
  ]);

  module.factory('perfDashProxyMock', function(testdata) {

    var self = this;

    self.config = {
      from: moment().subtract(1, 'hours'),
      to: moment(),
      points: 50
    };

    self.genVizData = function(viz) {
      self.volumeValues = testdata.getRandoms({
        from: self.config.from,
        to: self.config.to,
        points: self.config.points,
        lower: 50e3,
        upper: 80e3
      });

      self.errorsData = testdata.getRandoms({
        from: self.config.from,
        to: self.config.to,
        points: self.config.points,
        lower: 0,
        upper: 30
      });

      self.rt50thData = testdata.getRandoms({
        from: self.config.from,
        to: self.config.to,
        points: self.config.points,
        lower: 100,
        upper: 50000
      });

      self.rt99thData = testdata.getRandoms({
        from: self.config.from,
        to: self.config.to,
        points: self.config.points,
        lower: 30000,
        upper: 100000
      });

      self.rtHistogramData = testdata.getLogNormal({
        samples: 1000,
        max: 500000,
        median:  150000,
        multiplier: 50,
        points: 20
      });

      return {
        volume: {
          data: self.volumeValues
        },
        errorsrate: {
          data: self.errorsData
        },
        rt_histogram: {
          data: self.rtHistogramData
        },
        rt_percentile: {
          data: self.rt99thData
        }
      };
    };

    self.getMetricValues = function(base_val, rt_val, metrics) {
      var res = {};
      _.each(metrics, function(metric) {
        switch (metric.config.type) {
          case 'volume':
            if (metric.config.agg === 'avg') {
              res[metric.name] = { value: base_val };
            } else {
              res[metric.name] = { value: base_val * 1.5 };
            }
            break;
          case 'errorsrate':
            res[metric.name] = { value: base_val / 1000 };
            break;
          case 'percentile':
            if (metric.config.percentile == 50) {
              res[metric.name] = { value: rt_val };
            } else {
              res[metric.name] = { value: rt_val * 1.5 };
            }
            break;
          case 'cardinality':
            res[metric.name] = { value: 42 };
            break;
          case 'card_volume':
            res[metric.name] = { value: base_val / 42 };
        }
      });
      return res;
    };

    self.getDimVizValues = function(values, baseval) {
      var res = [];
      _.each(values, function(name, i) {
        res.push({
          name: name,
          value: baseval  / (i+1)
        });
      });
      return res;
    };

    return {
      load: function(config) {
        self.vizResult = self.genVizData(config.dashboard.viz);
        self.metricsResult = self.getMetricValues(120000, 23500, config.dashboard.metrics);

        self.dimResult = {};
        _.each(config.dashboard.dimensions, function(dim) {

          var names = [];
          if (dim.name === 'services') {
            names = ['Service16', 'Service18', 'Service5', 'Service9',
              'Service34', 'Service52', 'Service91', 'Service3'];
          } else {
            names = [
              'java1.service-java.example.com',
              'java2.service-java.example.com',
              'java4.service-java.example.com',
              'java14.service-java.example.com',
            ];
          }

          var vizResult = {};
          _.each(dim.viz, function(viz) {
            switch (viz.config.type) {
            case 'topvolume':
              vizResult[viz.name] = {
                values: self.getDimVizValues(names, 20000)
              };
              break;
            case 'toppercentile':
              vizResult[viz.name] = {
                values: self.getDimVizValues(names, 50000)
              };
              break;
            case 'toperrors':
              vizResult[viz.name] = {
                values: self.getDimVizValues(names, 50)
              };
              break;
            }
          });

          self.dimResult[dim.name] = {
            metrics: self.getMetricValues(120000, 12000, dim.metrics),
            viz: vizResult
          };
        });


        // returns a dummy promise that resolves immediately.
        return {
          then: function(f) {
            f();
          }
        };
      },

      vizResult: function() {
        return self.vizResult;
      },

      metricsResult: function() {
        return self.metricsResult;
      },

      dimResult: function() {
        return self.dimResult;
      },

      volumeValues: function() {
        return self.volumeValues;
      },

      errorsData: function() {
        return self.errorsData;
      },

      rt50thData: function() {
        return self.rt50thData;
      },

      rt99thData: function() {
        return self.rt99thData;
      },

      rtHistogramData: function() {
        return self.rtHistogramData;
      }
    };
  });

})();
