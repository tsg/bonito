(function() {
  'use strict';

  beforeEach(module('bonitoApp'));

  describe('ServicesListCtrl', function() {
    var ctrl,
      $controller,
      $rootScope;

    beforeEach(inject(function(_$controller_, _$rootScope_) {
      $controller = _$controller_;
      $rootScope = _$rootScope_;
      ctrl = $controller("ServicesListCtrl as app", {
        $scope: $rootScope,
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

    it('should have a pageSize of 16', function() {
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

    it('should load only one panel when called with a filter', function() {
      ctrl = $controller("ServicesListCtrl as app", {
        $scope: $rootScope,
        $routeParams: {
          pageSize: 16,
          rowsPerPage: 4,
          filter: 'Service31'
        }
      });

      expect(ctrl.panels.length).toBe(1);
    });


    it('should accept a regexp', function() {
      ctrl = $controller("ServicesListCtrl as app", {
        $scope: $rootScope,
        $routeParams: {
          pageSize: 16,
          rowsPerPage: 4,
          filter: 'Service31|Service53'
        }
      });

      expect(ctrl.panels.length).toBe(2);
    });

    it('should filter panels when entering something in the search box', function() {
      $rootScope.app.filter = 'Hello';
      $rootScope.app.updateFilter();
      expect(ctrl.panels.length).toBe(0);
    });

    it('should filter with regex', function() {
      $rootScope.app.filter = 'Service2$|Service3$';
      $rootScope.app.updateFilter();
      expect(ctrl.panels.length).toBe(2);
    });

  });

})();
