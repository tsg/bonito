(function() {
  'use strict';

  beforeEach(module('bonitoPerformanceDashboard'));
  beforeEach(module('bonitoPerfDashMocks'));

  describe('performanceDashboard controller with mocked service', function() {
    var ctrl,
      $controller,
      $rootScope;

    beforeEach(inject(function(_$controller_, _$rootScope_, byDimensionProxyMock) {
      $controller = _$controller_;
      $rootScope = _$rootScope_;
      ctrl = $controller('performanceDashboard as perfDash', {
        $scope: $rootScope
        //byDimensionProxy: byDimensionProxyMock
      });
    }));

    it('should switch to the #/dashboards/platformwide page', inject(function(Pages) {
      expect(Pages.activePage.path).toBe('dashboards');
      expect(Pages.activePage.activeSubpage.path).toBe('platformwide');
    }));

  });

  describe('perfDash template', function() {
    var $compile, $rootScope, $elem;
    beforeEach(module('templates'));
    beforeEach(inject(function(_$compile_, _$rootScope_, $templateCache) {
      $compile = _$compile_;
      $rootScope = _$rootScope_;

      $elem = angular.element($templateCache.get('perfDash.html'));
      $compile($elem)($rootScope);
      $rootScope.$digest();
    }));

    it('should should create a set of platform graphs', function() {
      var platform = $elem.find('.section-platform');
      expect(platform.find('.bnt-volume-graph').length).toBe(1);
      expect(platform.find('.bnt-errors-rate-graph').length).toBe(1);
      expect(platform.find('.bnt-responsetime-histogram').length).toBe(1);
      expect(platform.find('.bnt-responsetime-99th').length).toBe(1);
    });

    it ('should show a set of metrics on the right side', function() {
      var platform = $elem.find('.section-platform');
      expect(platform.find('table tr').length).toBeGreaterThan(3);
      var rows = platform.find('table tr');
      expect(rows[0].children.length).toBeDefined();
    });

    it('should create a set of by dimension graphs (barcharts)', function() {
      var services = $elem.find('.dimension-services');
      expect(services.find('.bnt-dimension-graph').length).toBe(3);
      expect(services.find('bonito-barchart').length).toBe(3);
    });

    it('should have a set of metrics on the left side', function() {
      var services = $elem.find('.dimension-services');
      expect(services.find('table tr').length).toBeGreaterThan(1);
      var rows = services.find('table tr');
      expect(rows[0].children.length).toBeDefined();
    });
  });

  describe('perfDash mock proxy service', function() {
    var perfDashProxyMock;
    beforeEach(inject(function(_perfDashProxyMock_) {
      perfDashProxyMock = _perfDashProxyMock_;
    }));

    it('should generate 50 points for the volume histogram', function() {
      var viz = [{
        name: 'volume'
      }];
      perfDashProxyMock.load({viz: viz}).then(function() {
        expect(perfDashProxyMock.volumeValues().length).toBe(50);
      });
    });
  });
})();
