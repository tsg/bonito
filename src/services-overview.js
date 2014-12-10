(function() {
  'use strict';

  var app = angular.module('services-overview', []);

  app.factory('ServicesProxy', function() {
    var test_data = [];
    for (var i = 1; i < 80; i++) {
      test_data.push({
        name: 'Service#' + i,
        size: i,
        errors: i % 4
      });
    }

    return {
      Data: test_data
    };
  });

  app.controller('ServicesOverviewCtrl',
      ['_', 'Pages', 'ServicesProxy', '$routeParams',
      function(_, Pages, ServicesProxy, $routeParams) {

    _.assign(Pages.activePage, Pages.getPageById('services'));
    Pages.activePage.activeSubpage = Pages.subpageById(Pages.activePage, 'overview');

    this.panels = ServicesProxy.Data;

    // config
    this.perRow = $routeParams.perRow || 4;
    this.panelSizeRatio = $routeParams.panelSizeRatio || 1.618;

    if (this.perRow != 1 && this.perRow != 2 && this.perRow != 4 && this.perRow != 6) {
      // only accept 2, 4 ot 6 elements per row
      this.perRow = 4;
    }
    if (angular.element(window).width() < 768) {
      // on phones, always have one per row
      this.perRow = 1;
    }
    this.panelClass = 'col-sm-' + (12 / this.perRow);

    // approximately calculate the ideal width and height of a panel
    var padding = 30;
    this.panelWidth = Math.floor((angular.element(window).width() - padding) / this.perRow) - padding;
    this.panelHeight = Math.floor(this.panelWidth / this.panelSizeRatio);

    // group panels into rows
    this.rows = [];
    var that = this;
    _.forEach(_.range(0, this.panels.length, this.perRow), function(idx) {
      var row = [];
      for (var i=idx; i < idx + that.perRow; i++) {
        row.push(that.panels[i]);
      }
      that.rows.push(row);
    });


  }]);
})();
