(function() {
  'use strict';

  describe('Services page', function() {
    describe('Services filtering', function() {
      beforeEach(function() {
        browser.get('/index.html#/services/overview?perRow=4');
      });

      it('should get four panels per row when requested', function() {
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

    describe('Services perRow settings', function() {
      beforeEach(function() {
        browser.get('/index.html#/services/overview');
      });

      var expectPanelsPerRowToBe = function(expected) {
        browser.driver.manage().window().getSize().then(function(browserSize) {
            element.all(by.css('.bpanel')).get(0).getSize().then(function(size) {
              expect(Math.floor(browserSize.width / (size.width + 30))).toBe(expected);
          });
        });
      };

      it('should get four panels per row by default', function() {
        expectPanelsPerRowToBe(4);
      });

      it('should expand settings when clicking the cog', function() {
        var config = element.all(by.css('.config')).get(1);
        expect(config.isDisplayed()).toBeFalsy();
        element(by.css('.fa-cog')).click().then(function() {
          expect(config.isDisplayed()).toBeTruthy();
        });
      });

      it('should change the width of the panels when selecting perRow=2', function() {
        element(by.css('.fa-cog')).click().then(function() {
          element(by.xpath('//input[@ng-model="app.perRow" and @value="2"]')).click().then(function() {
            expectPanelsPerRowToBe(2);
          });
        });
      });

      it('should change the width of the panels when selecting perRow=1', function() {
        element(by.css('.fa-cog')).click().then(function() {
          element(by.xpath('//input[@ng-model="app.perRow" and @value="1"]')).click().then(function() {
            expectPanelsPerRowToBe(1);
          });
        });
      });

      it('should change the width of the panels when selecting perRow=6', function() {
        element(by.css('.fa-cog')).click().then(function() {
          element(by.xpath('//input[@ng-model="app.perRow" and @value="6"]')).click().then(function() {
            expectPanelsPerRowToBe(6);
          });
        });
      });

    });

    describe('Services perRow settings', function() {
      beforeEach(function() {
        browser.get('/index.html#/services/overview');
      });

      it ('should update the location bar', function() {
        element(by.css('.fa-cog')).click().then(function() {
          element(by.xpath('//input[@ng-model="app.sortOrder" and @value="volume"]')).click().then(function() {

            browser.getLocationAbsUrl().then(function(url) {
              expect(url.split('#')[1]).toContain('sortOrder=volume');
            });

          });
        });
      });


      it ('should sort by errors by default', function() {
        element(by.css('.fa-cog')).click().then(function() {
          expect(element(by.css('input[name="sortOrder"]:checked')).getAttribute('value')).toBe('errors');
        });
      });

      it ('should route based on the location URL', function() {
        browser.get('/index.html#/services/overview?sortOrder=alpha').then(function() {
          element(by.css('.fa-cog')).click().then(function() {
            expect(element(by.css('input[name="sortOrder"]:checked')).getAttribute('value')).toBe('alpha');
          });
        });
      });

    });

    describe('Services lnSize setting', function() {
      beforeEach(function() {
        browser.get('/index.html#/services/overview?sortOrder=volume');
      });

      it ('should update the location bar', function() {
        element(by.css('.fa-cog')).click().then(function() {
          element(by.xpath('//input[@ng-model="app.useLogarithmicPlanetSize"]')).click().then(function() {

            browser.getLocationAbsUrl().then(function(url) {
              expect(url.split('#')[1]).toContain('lnSize=false');

              // and once more
              element(by.xpath('//input[@ng-model="app.useLogarithmicPlanetSize"]')).click().then(function() {
                browser.getLocationAbsUrl().then(function(url) {
                  expect(url.split('#')[1]).toContain('lnSize=true');
                });
              });

            });

          });
        });
      });

      it ('should change the size of the planet in an svg graph', function() {
        // get the size of the 3rd planet
        element.all(by.css('.bpanel')).get(2)
          .element(by.css('.planet circle')).getAttribute('r').then(function(r1) {

          expect(r1).toBeGreaterThan(0);

          // change logarithmic setting
          element(by.css('.fa-cog')).click().then(function() {
            element(by.xpath('//input[@ng-model="app.useLogarithmicPlanetSize"]'))
            .click().then(function() {
              // get the new size of the 3rd planet
              element.all(by.css('.bpanel')).get(2)
                .element(by.css('.planet circle')).getAttribute('r').then(function(r2) {

                  expect(r2).toBeGreaterThan(0);
                  expect(r2).toBeLessThan(r1);
              });
            });
          });
        });
      });
    });


  });
})();
