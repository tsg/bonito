(function() {
  'use strict';

  var app = angular.module('services-overview', [
    'infinite-scroll'
  ]);

  app.factory('ServicesProxy', function() {
    var test_data = [];
    for (var i = 0; i < 81; i++) {
      test_data.push({
        name: 'Service#' + i,
        size: _.random(1000*(1 << i), 1000*(1 << (i+1))),
        errors: _.random(0, i)
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

    // approximately calculate the ideal width and height of a panel
    var padding = 30;
    this.panelWidth = Math.floor((angular.element(window).width() - padding) / this.perRow) - padding;
    this.panelHeight = Math.floor(this.panelWidth / this.panelSizeRatio);

    this.rowsPerPage = $routeParams.rowsPerPage ||
      (Math.ceil(angular.element(window).height() / (this.panelHeight + padding)));
    this.pageSize = $routeParams.pageSize || this.rowsPerPage * this.perRow;

    // initial page
    this.panels = ServicesProxy.Data.slice(0, this.pageSize);
    this.loaded = this.pageSize;

    var ctrl = this;
    this.loadMore = function() {
      if (ctrl.loaded > ServicesProxy.Data.length) {
        // that was all
        return false;
      }

      var toAdd = ServicesProxy.Data.slice(ctrl.loaded, ctrl.loaded + ctrl.pageSize);

      _.forEach(toAdd, function(panel) {
        if (_.isObject(panel)) {
          ctrl.panels.push(panel);
        } else {
          return false;
        }
      });

      ctrl.loaded += ctrl.pageSize;
    };

  }]);
})();
