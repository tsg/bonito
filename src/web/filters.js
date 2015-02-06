(function() {
  'use strict';

  var app = angular.module('bonitoFilters', [
    'bonitoFormatters'
  ]);

  /**
   * Print large number using prefix (k, M, G, etc.) to
   * keep their size short and to be friendlier to the poor non-robots.
   */
  app.filter('humanNumber', ['formatters', function(formatters) {
    return function(input, precision) {
      return formatters.formatNumber(input, precision);
    };
  }]);

  /**
   * Returns a class for each number prefix to allow coloring.
   */
  app.filter('humanNumberClass', ['formatters', function(formatters) {
    return function(input, precision) {
      return formatters.formatNumberClass(input);
    };
  }]);

  /**
   * Print durations (given as number of microseconds) in a friendlier way.
   */
  app.filter('humanDuration', ['formatters', function(formatters) {
    return function(input, precision) {
      return formatters.formatDuration(input, precision);
    };
  }]);

  /**
   * Returns a class for each duration prefix to allow coloring.
   */
  app.filter('humanDurationClass', ['formatters', function(formatters) {
    return function(input, precision) {
      return formatters.formatDurationClass(input);
    };
  }]);
})();
