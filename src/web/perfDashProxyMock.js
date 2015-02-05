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

    self.genData = function() {
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

    };

    return {
      load: function() {
        self.genData();

        // returns a dummy promise that resolves immediately.
        return {
          then: function(f) {
            f();
          }
        };
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
