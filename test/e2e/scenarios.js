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
      element(by.css('a[href*="#settings"]')).click();

      browser.getLocationAbsUrl().then(function(url) {
        expect(url.split('#')[1]).toBe('/settings');
      });
    });
  });
})();
