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

    it('should should create a set of graphs', function() {
      expect($elem.find('.bnt-rpm-graph').length).toBe(1);
      expect($elem.find('.bnt-errors-rate-graph').length).toBe(1);
      expect($elem.find('.bnt-responsetimes-graph').length).toBe(1);
    });
  });

  describe('perfDash mock proxy service', function() {
    var perfDashProxyMock;
    beforeEach(inject(function(_perfDashProxyMock_) {
      perfDashProxyMock = _perfDashProxyMock_;
    }));

    it('should generate 50 points for the volume histogram', function() {
      perfDashProxyMock.load().then(function() {
        expect(perfDashProxyMock.volumeValues().length).toBe(50);
      });
    });
  });
})();
