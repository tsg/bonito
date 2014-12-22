(function() {
  'use strict';

  // Displays a grid of panels each representing a service.
  var app = angular.module('services-list', [
    'infinite-scroll',

    'config-directive'
  ]);

  /**
   * Test service for services.
   */
  app.factory('ServicesProxy', function() {
    var test_data = [];

    this.generateData = function(min, max) {
      var end = +(new Date());
      var start = end - 120 * 1000;
      var data = [];
      for (var t = start; t < end; t+= 1000) {
        data.push({
          'ts': new Date(t),
          'value': _.random(min, max)
        });
      }
      return data;
    };

    for (var i = 0; i < 81; i++) {
      test_data.push({
        name: 'Service' + i,
        size: _.random(100*(1 << i), 100*(1 << (i+1))),
        errors: _.random(0, i),
        values: this.generateData(100*(1 << i), 100*(1 << (i+1)))
      });
    }

    return {
      Data: test_data
    };
  });

  /**
   * Controller for the Services Grid page.
   */
  app.controller('ServicesListCtrl',
       ['_', 'Pages', 'ServicesProxy', '$routeParams', '$location', '$scope',
    function(_, Pages, ServicesProxy, $routeParams, $location, $scope) {

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


    this.filter = $routeParams.filter || '';

    var ctrl = this;

    /**
     * Returns true if the service name matches the regexp from the
     * quick filter box.
     */
    this.filterServices = function(service) {
      var re = new RegExp(ctrl.filter, 'i');
      if (re.test(service.name)) {
        return true;
      } else {
        return false;
      }
    };

    /**
     * Loads the next "page" of panels.
     */
    this.loadMore = function() {
      if (ctrl.loaded > ServicesProxy.Data.length) {
        // that was all
        return false;
      }

      var toAdd = ServicesProxy.Data
        .filter(ctrl.filterServices)
        .slice(ctrl.loaded, ctrl.loaded + ctrl.pageSize);

      _.forEach(toAdd, function(panel) {
        if (_.isObject(panel)) {
          ctrl.panels.push(panel);
        } else {
          return false;
        }
      });

      ctrl.loaded += ctrl.pageSize;
    };

    this.configToggle = function() {
      this.configVisible = !this.configVisible;
      console.log("configVisible = ", this.configVisible);
    };


    // initial page
    this.panels = ServicesProxy.Data
      .filter(this.filterServices)
      .slice(0, this.pageSize);
    this.loaded = this.pageSize;

    // set a watcher on the quick filter
    $scope.$watch('app.filter', function() {
      if (ctrl.filter !== '') {
        $location.search('filter', ctrl.filter);
      } else {
        // remove the 'filter' parameter
        if ($location.$$search.filter) {
          delete $location.$$search.filter;
          $location.$$compose();
        }
      }

      // reload first page
      ctrl.panels = [];
      ctrl.panels = ServicesProxy.Data
        .filter(ctrl.filterServices)
        .slice(0, ctrl.pageSize);
      ctrl.loaded = ctrl.pageSize;
    });

  }]);
})();
