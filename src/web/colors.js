(function() {
  'use strict';

  // TODO: ideally generate this from variable.less


  var module = angular.module('bonitoColors', []);
  module.factory('colors', function() {
    return {
      '@brand-primary': '#2C3E50',
      '@brand-success': '#18BC9C',
      '@brand-info': '#3498DB',
      '@brand-warning': '#F39C12',
      '@brand-danger': '#E74C3C'
    };
  });
})();
