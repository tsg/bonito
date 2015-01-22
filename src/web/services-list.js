(function() {
  'use strict';

  // Displays a grid of panels each representing a service.
  var app = angular.module('services-list', [
    'infinite-scroll',

    'bydimension-service',
    'config-directive'
  ]);

  /**
   * Controller for the Services Grid page.
   */
  app.controller('ServicesListCtrl',
       ['_', 'Pages', 'byDimensionProxy', '$routeParams', '$location', '$scope',
    function(_, Pages, Proxy, $routeParams, $location, $scope) {

    _.assign(Pages.activePage, Pages.getPageById('services'));
    Pages.activePage.activeSubpage = Pages.subpageById(Pages.activePage, 'overview');

    // config
    this.perRow = $routeParams.perRow || 4;
    this.panelSizeRatio = $routeParams.panelSizeRatio || 1.618;

    if ($routeParams.lnSize === "false") {
      this.useLogarithmicPlanetSize = false;
    } else {
      this.useLogarithmicPlanetSize = true;
    }

    if (this.perRow != 1 && this.perRow != 2 && this.perRow != 4 && this.perRow != 6) {
      // don't accept any number for the perRow value
      this.perRow = 4;
    }
    if (angular.element(window).width() < 768) {
      // on phones, always have one per row
      this.perRow = 1;
    }

    this.sortOrder = $routeParams.sortOrder || 'errors';



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
      if (ctrl.loaded > Proxy
                          .get(ctrl.sortOrder, ctrl.useLogarithmicPlanetSize)
                          .filter(ctrl.filterServices)
                          .length) {
        // that was all
        return false;
      }

      var toAdd = Proxy
        .get(ctrl.sortOrder, ctrl.useLogarithmicPlanetSize)
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
    };

    /**
     * (re-)renders the services list page.
     */
    this.render = function() {

      // approximately calculate the ideal width and height of a panel
      var padding = 30;
      this.panelWidth = Math.floor((angular.element(window).width() - padding) / this.perRow) - padding;
      this.panelHeight = Math.floor(this.panelWidth / this.panelSizeRatio / 1.3 );

      this.rowsPerPage = $routeParams.rowsPerPage ||
        (Math.ceil(angular.element(window).height() / (this.panelHeight + padding)));
      this.pageSize = $routeParams.pageSize || this.rowsPerPage * this.perRow;

      // initial page
      ctrl.panels = [];
      ctrl.panels = Proxy
        .get(ctrl.sortOrder, this.useLogarithmicPlanetSize)
        .filter(ctrl.filterServices)
        .slice(0, ctrl.pageSize);
      ctrl.loaded = ctrl.pageSize;
    };


    /**
     * Called when the filter is updated.
     */
    this.updateFilter = function() {
      if (ctrl.filter !== '') {
        $location.search('filter', ctrl.filter);
      } else {
        // remove the 'filter' parameter
        if ($location.$$search.filter) {
          delete $location.$$search.filter;
          $location.$$compose();
        }
      }

      ctrl.render();
    };

    this.updatePerRow = function() {
      $location.search('perRow', ctrl.perRow);
      ctrl.render();
    };

    this.updateSortOrder = function() {
      $location.search('sortOrder', ctrl.sortOrder);
      ctrl.render();
    };

    this.updateUseLogarithmicPlanetSize = function() {
      $location.search('lnSize', ctrl.useLogarithmicPlanetSize.toString());
      Proxy.recomputePlanetSizes(ctrl.useLogarithmicPlanetSize);
      ctrl.render();
    };

    // initial service load
    Proxy.load().then(function() {
      ctrl.render();
    });

  }]);
})();
