(function() {
  'use strict';

  beforeEach(module('bonitoApp'));

  describe('ServicesOverviewCtrl', function() {
    var ctrl;

    beforeEach(inject(function($controller) {
      ctrl = $controller("ServicesOverviewCtrl as app", {
        $scope: {},
        $routeParams: {
          pageSize: 16,
          rowsPerPage: 4
        }
      });
    }));

    it('should switch to the #/services/overview page', inject(function(Pages) {
      expect(Pages.activePage.path).toBe('services');
      expect(Pages.activePage.activeSubpage.path).toBe('overview');
    }));

    it('should have 4 per row by default', function() {
      expect(ctrl.perRow).toBe(4);
    });

    it('shouled have a pageSize of 16', function() {
      expect(ctrl.pageSize).toBe(16);
      expect(ctrl.rowsPerPage).toBe(4);
    });

    it('should have loaded 16 elemenets', function() {
      expect(ctrl.panels.length).toBe(16);
    });

    it('should load another 16 elements when called', function() {
      expect(ctrl.panels.length).toBe(16);
      ctrl.loadMore();
      expect(ctrl.panels.length).toBe(32);
      ctrl.loadMore();
      expect(ctrl.panels.length).toBe(48);
    });

    it('shouldn\'t load more than 81 panels', function() {
      _.forEach(_.range(10), function() {
        ctrl.loadMore();
      });
      expect(ctrl.panels.length).toBe(81);
    });

  });

})();
