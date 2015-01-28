(function() {
  'use strict';

  var module = angular.module('bonitoTimefilter', []);

  module.factory('timefilter', ['_', function(_) {
    var timeDefaults = {
      from: 'now-1h',
      to: 'now'
    };

    var service = this;

    service.time = timeDefaults;

    return {
      get: function() {
        return service.time;
      },

      set: function(time) {
        service.time = time;
      }
    };
  }]);

})();
