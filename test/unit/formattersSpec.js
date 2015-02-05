(function() {
  'use strict';
    describe('Formatters service', function() {
      var formatters;
      beforeEach(module('bonitoFormatters'));
      beforeEach(inject(function(_formatters_) {
        formatters = _formatters_;
      }));

      describe('trimString', function() {
        it('shouldn\'t trim hello to five characters', function() {
          expect(formatters.trimString('hello', 5)).toEqual('hello');
        });

        it('shouldn trim hello to four characters', function() {
          expect(formatters.trimString('hello', 4)).toEqual('h...');
        });

        it('should trim a long string to 20 characters', function() {
          expect(formatters.trimString('java2.service-java.example.com', 20))
            .toEqual('java2.service-jav...');
        });
      });


    });


})();
