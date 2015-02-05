(function() {
  'use strict';

  var module = angular.module('bonitoPanel', []);
  module.directive('bonitoPanel', function() {
    return {
      restrict: 'E',
      templateUrl: 'panel.html',
      transclude: true,
      scope: {
        title: '=panelTitle'
      }
    };
  });
})();
