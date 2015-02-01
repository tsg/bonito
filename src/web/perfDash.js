(function() {
  'use strict';

  // Displays a detailed performance dashboard.
  var module = angular.module('bonitoPerformanceDashboard', [
    'bonitoPerfDashMocks'
  ]);

  module.controller('performanceDashboard',
    ['_', 'Pages', 'perfDashProxyMock',
  function(_, Pages, Proxy) {
    _.assign(Pages.activePage, Pages.getPageById('dashboards'));
    Pages.activePage.activeSubpage = Pages.subpageById(Pages.activePage, 'platformwide');

    var self = this;

  }]);

})();
