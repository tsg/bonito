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

    describe('Services filtering', function() {
      beforeEach(function() {
        browser.get('/index.html#/services/overview?perRow=4');
      });

      it('should get for panels per row when requested', function() {
        expect(element.all(by.css('.bpanel')).count()).toBeGreaterThan(10);
      });

      it('should filter out everything when entering garbage', function() {
        element(by.model('app.filter')).sendKeys('Nada');
        expect(element.all(by.css('.bpanel')).count()).toBe(0);
      });

      it('should get only one panel when entering a particular filter', function() {
        element(by.model('app.filter')).sendKeys('^Service31$');
        expect(element.all(by.css('.bpanel')).count()).toBe(1);
      });

      it('should get two one panels when filtering with an or', function() {
        element(by.model('app.filter')).sendKeys('e31$|e2$');
        expect(element.all(by.css('.bpanel')).count()).toBe(2);
      });

      it('should update the location bar', function() {
        element(by.model('app.filter')).sendKeys('Test');
        browser.getLocationAbsUrl().then(function(url) {
          expect(url.split('#')[1]).toContain('filter=Test');
        });
      });

      it('should clear the location bar when removing the filter', function() {
        element(by.model('app.filter')).sendKeys('Test');
        browser.getLocationAbsUrl().then(function(url) {
          expect(url.split('#')[1]).toContain('filter=Test');

          element(by.model('app.filter')).clear().then(function() {
            browser.getLocationAbsUrl().then(function(url) {
              expect(url.split('#')[1]).toNotContain('filter=');
            });
          });
        });
      });

    });

  });
})();
