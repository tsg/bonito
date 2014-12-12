/**
 * Let's you use d3 as a service from a controller.
 * Adapted from https://github.com/andresesfm/angular-underscore-module
 */
(function() {
  'use strict';
  angular.module('d3', []).factory('d3', function() {
    return window.d3; // assumes d3 has already been loaded on the page
  });
})();
