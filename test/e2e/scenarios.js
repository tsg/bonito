(function() {
  'use strict';

  describe('Bonito App', function() {
    it('should redirect index.html to index.html#/services/overview', function() {
      browser.get('/index.html');
      browser.getLocationAbsUrl().then(function(url) {
        expect(url.split('#')[1]).toBe('/services/overview');
      });
    });

    it('clicking Settings should go to Settings', function() {
      element(by.css('#bonito-navbar a[href*="#settings"]')).click();

      browser.getLocationAbsUrl().then(function(url) {
        expect(url.split('#')[1]).toBe('/settings');
      });
    });

    it('clicking Services should go to settings/overview', function() {
      element(by.css('#bonito-navbar a[href*="#services"]')).click();

      browser.getLocationAbsUrl().then(function(url) {
        expect(url.split('#')[1]).toBe('/services/overview');
      });
    });

    it('clicking Map should go to settings/overview', function() {
      element(by.css('#bonito-subnav a[href*="#services/map"]')).click();

      browser.getLocationAbsUrl().then(function(url) {
        expect(url.split('#')[1]).toBe('/services/map');
      });
    });

  });
})();
