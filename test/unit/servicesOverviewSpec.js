(function() {
  'use strict';

  beforeEach(module('bonitoApp'));

  describe('servicesOverviewCtrl', function() {
    var ctrl;

    beforeEach(inject(function($controller) {
      ctrl = $controller("ServicesOverviewCtrl as app", {$scope: {}});
    }));

    it('should switch to the #/services/overview page', inject(function(Pages) {
      expect(Pages.activePage.path).toBe('services');
      expect(Pages.activePage.activeSubpage.path).toBe('overview');
    }));

    it('should have 4 per row by default', function() {
      expect(ctrl.perRow).toBe(4);
    });

    it('should group the panels into rows', function() {
      expect(ctrl.rows.length).toBe(20);
    });

    it('should have panel class col-md-3', function() {
      expect(ctrl.panelClass).toBe('col-sm-3');
    });
  });

})();
