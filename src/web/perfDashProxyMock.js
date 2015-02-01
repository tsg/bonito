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
      }
    };
  });

})();
