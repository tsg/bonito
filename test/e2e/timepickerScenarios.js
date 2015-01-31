(function() {
  'use strict';

  describe('Timepicker', function() {
    var timepicker;
    beforeEach(function() {
      browser.get('/index.html#/services/overview').then(function() {
        timepicker = element.all(by.css('.config')).get(0);
      });
    });

    it('should expand settings when clicking the time and switch tabs', function() {
      expect(timepicker.isDisplayed()).toBeFalsy();
      element(by.css('.fa-clock-o')).click().then(function() {
        expect(timepicker.isDisplayed()).toBeTruthy();
      }).then(function() {
        timepicker.element(by.linkText('Relative')).click().then(function() {
          expect(timepicker.element(by.xpath('//form[@name="relativeTime"]')).isDisplayed()).toBeTruthy();
        });
      }).then(function() {
        timepicker.element(by.linkText('Absolute')).click().then(function() {
          expect(timepicker.element(by.xpath('//form[@name="absoluteTime"]')).isDisplayed()).toBeTruthy();
        });
      }).then(function() {
        timepicker.element(by.linkText('Refresh Interval')).click().then(function() {
          expect(timepicker.element(by.linkText('10 seconds')).isDisplayed()).toBeTruthy();
        });
      });
    });

    it('should work to view Today and refresh every 5 seconds', function() {
      element(by.css('.fa-clock-o')).click().then(function() {
        timepicker.element(by.linkText('Today')).click().then(function() {
          var button = element(by.css('.fa-clock-o')).element(by.xpath('ancestor::span'));
          expect(button.getText()).toContain("Today");
        });
      }).then(function() {
        timepicker.element(by.linkText('Refresh Interval')).click().then(function() {
          timepicker.element(by.linkText('5 seconds')).click().then(function() {
            var button = element(by.css('.interval-display'));
            expect(button.getText()).toContain("5 seconds");
          });
        });
      });
    });

  });
})();
