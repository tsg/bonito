(function() {
  'use strict';

  describe('Pages service', function() {

    var Pages;

    beforeEach(module('bonitoApp'));

    beforeEach(inject(['Pages', function(_Pages_) {
      Pages = _Pages_;
    }]));

    it('should exist', function() {
      expect(Pages).toBeDefined();
    });

    it('should contain data for the Services page', function() {
      var page = Pages.getPageById('services');
      expect(page.path).toEqual('services');
      expect(page.name).toEqual('Services');
      expect(page.subPages.length).toEqual(2);
    });

    it('should contain data for the Settings page', function() {
      var page = Pages.getPageById('settings');
      expect(page.path).toEqual('settings');
      expect(page.name).toEqual('Settings');
      expect(page.subPages).toBeUndefined();
    });

    it('should find subPage in services', function() {
      var servicesPage = Pages.getPageById('services');
      expect(servicesPage).toBeDefined();
      var subpage = Pages.subpageById(servicesPage, 'overview');
      expect(subpage.name).toEqual('Overview');
    });

  });
})();
