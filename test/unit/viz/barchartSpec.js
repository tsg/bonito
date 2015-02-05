(function() {
  'use strict';

  describe('bonitoViz barchart directive', function() {
    var $compile, $scope, $elem;

    beforeEach(module('bonitoViz'));

    beforeEach(inject(function(_$compile_, _$rootScope_) {
      $compile = _$compile_;
      $scope = _$rootScope_;

      $scope.data = [{
          name: 'Service16',
          value: 34000
        }, {
          name: 'Service5',
          value: 20300
        }, {
          name: 'Service18',
          value: 25000
        }, {
          name: 'Service34',
          value: 9600
        }, {
          name: 'Service9',
          value: 19700
        }];

      $elem = $compile('<bonito-barchart data="data" height="200"></bonito-barchart>')($scope);
      $scope.$digest();
    }));

    it('should contain an svg element containing a barchart', function() {
      expect($elem.find('svg').length).toBe(1);
      expect($elem.find('.bonito-barchart').length).toBe(1);
    });

    it('should contain five bars with labels', function() {
      expect($elem.find('rect.bar').length).toBe(5);
      expect($elem.find('g.x.axis text').length).toBe(5);
    });

    it('bars should be sorted by height', function() {
      expect($elem.find('g.x.axis text')
        .map(function() {return $(this).text();})
        .get()
      ).toEqual(
        ['Service16', 'Service18', 'Service5', 'Service9', 'Service34']);
    });

    it('should have yaxis labels in iso format', function() {
      expect($elem.find('g.y.axis text')
        .map(function() {return $(this).text();})
        .get()
      ).toEqual(
        ['0', '5k', '10k', '15k', '20k', '25k', '30k']);
    });
  });
})();
