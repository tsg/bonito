(function() {
  'use strict';

  beforeEach(module('bonitoApp'));
  beforeEach(module('services-test'));

  describe('ServicesListCtrl with mocked service', function() {
    var ctrl,
      $controller,
      $rootScope;

    beforeEach(inject(function(_$controller_, _$rootScope_, byDimensionProxyMock) {
      $controller = _$controller_;
      $rootScope = _$rootScope_;
      ctrl = $controller("ServicesListCtrl as app", {
        $scope: $rootScope,
        $routeParams: {
          pageSize: 16,
          rowsPerPage: 4
        },
        byDimensionProxy: byDimensionProxyMock
      });
    }));

    it('should switch to the #/services/overview page', inject(function(Pages) {
      expect(Pages.activePage.path).toBe('services');
      expect(Pages.activePage.activeSubpage.path).toBe('overview');
    }));

    it('should have 4 or 1 per row by default', function() {
      if (angular.element(window).width() < 768) {
        expect(ctrl.perRow).toBe(1);
      } else {
        expect(ctrl.perRow).toBe(4);
      }
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

    it('should load only one panel when called with a filter', inject(function(byDimensionProxyMock) {
      ctrl = $controller("ServicesListCtrl as app", {
        $scope: $rootScope,
        byDimensionProxy: byDimensionProxyMock,
        $routeParams: {
          pageSize: 16,
          rowsPerPage: 4,
          filter: 'Service31',
        }
      });

      expect(ctrl.panels.length).toBe(1);
    }));


    it('should accept a regexp', inject(function(byDimensionProxyMock) {
      ctrl = $controller("ServicesListCtrl as app", {
        $scope: $rootScope,
        byDimensionProxy: byDimensionProxyMock,
        $routeParams: {
          pageSize: 16,
          rowsPerPage: 4,
          filter: 'Service31|Service53'
        }
      });

      expect(ctrl.panels.length).toBe(2);
    }));

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

  describe('ServicesListCtrl with the real service', function() {
    var ctrl,
      $controller,
      $rootScope,
      $httpBackend;

    beforeEach(inject(function(_$controller_, _$rootScope_, _$httpBackend_) {
      $controller = _$controller_;
      $rootScope = _$rootScope_;
      $httpBackend = _$httpBackend_;
      ctrl = $controller("ServicesListCtrl as app", {
        $scope: $rootScope,
        $routeParams: {
          pageSize: 16,
          rowsPerPage: 4
        }
      });

      $httpBackend.whenPOST('/api/bydimension').respond({
        "status": "ok",
        "primary": [
          {
            "name": "service0",
            "metrics": {
              "errors_rate": 0.094059736,
              "rt_50.0p": 504.65,
              "rt_95.0p": 955.9,
              "rt_99.0p": 991,
              "rt_99.5p": 995,
              "rt_avg": 505.20667,
              "rt_max": 999,
              "secondary_count": 2,
              "volume": 15033
            }
          },
          {
            "name": "service1",
            "metrics": {
              "errors_rate": 0.098547995,
              "rt_50.0p": 510.74854,
              "rt_95.0p": 954.105,
              "rt_99.0p": 991.01,
              "rt_99.5p": 994.005,
              "rt_avg": 508.77567,
              "rt_max": 999,
              "secondary_count": 2,
              "volume": 14876
            }
          },
          {
            "name": "service10",
            "metrics": {
              "errors_rate": 0.098547996,
              "rt_50.0p": 518.1325,
              "rt_95.0p": 952.1719,
              "rt_99.0p": 991,
              "rt_99.5p": 997,
              "rt_avg": 509.529,
              "rt_max": 999,
              "secondary_count": 2,
              "volume": 15071
            }
          },
          {
            "name": "service11",
            "metrics": {
              "errors_rate": 0.09087876,
              "rt_50.0p": 521.67975,
              "rt_95.0p": 958.1375,
              "rt_99.0p": 988.01,
              "rt_99.5p": 993,
              "rt_avg": 510.22534,
              "rt_max": 999,
              "secondary_count": 2,
              "volume": 14987
            }
          }
        ]
      });
      $httpBackend.flush();
    }));

    it('should switch to the #/services/overview page', inject(function(Pages) {
      expect(Pages.activePage.path).toBe('services');
      expect(Pages.activePage.activeSubpage.path).toBe('overview');
    }));

    it('should have a pageSize of 16', function() {
      expect(ctrl.pageSize).toBe(16);
      expect(ctrl.rowsPerPage).toBe(4);
    });

    it('should display 4 panels', function() {
      expect(ctrl.panels.length).toBe(4);
    });

    it('should display one panel when filtered', function() {
      $rootScope.app.filter = 'service0$';
      $rootScope.app.updateFilter();
      expect(ctrl.panels.length).toBe(1);

      expect(ctrl.panels[0].name).toBe('service0');
    });

    it('should be sorted by errors by default', function() {
      expect(ctrl.panels.length).toBe(4);

      expect(_.pluck(ctrl.panels, "name")).toEqual(['service10', 'service1',
        'service0', 'service11']);
    });

    it('should work to sort by volume', function() {
      $rootScope.app.sortOrder = 'volume';
      $rootScope.app.updateSortOrder();
      expect(ctrl.panels.length).toBe(4);

      expect(_.pluck(ctrl.panels, "name")).toEqual(['service10', 'service0',
        'service11', 'service1']);
    });

    it('should work to sort alphabetically', function() {
      $rootScope.app.sortOrder = 'alpha';
      $rootScope.app.updateSortOrder();
      expect(ctrl.panels.length).toBe(4);

      expect(_.pluck(ctrl.panels, "name")).toEqual(['service0', 'service1',
        'service10', 'service11']);
    });

    it('all panels should have a size_rel value', function() {
      expect(_.every(ctrl.panels, 'size_rel')).toBe(true);
    });

    it('all panels should have a volumne value', function() {
      expect(_.every(ctrl.panels, function(d) { return _.isNumber(d.metrics.volume);}))
        .toBe(true);
    });

  });

})();
