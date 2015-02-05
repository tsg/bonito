(function() {
  'use strict';

  describe('bonitoViz barchart directive', function() {
    var $compile, $scope, $elem;

    beforeEach(module('bonitoViz'));

    beforeEach(inject(function(_$compile_, _$rootScope_, testdata) {
      $compile = _$compile_;
      $scope = _$rootScope_;

      $scope.data = testdata.getLogNormal({
        samples: 100,
        max: 100,
        median: 30,
        points: 10
      });

      $elem = $compile(
        '<bonito-histogram ' +
            'data="data" height="height" ' +
            'ylabel="Burritos" ' +
            'datatype="duration">' +
        '</bonito-histogram>')($scope);
      $scope.$digest();
    }));

    it('should contain an svg element containing a histogram', function() {
      expect($elem.find('svg').length).toBe(1);
      expect($elem.find('.bonito-histogram').length).toBe(1);
    });

    it('should contain 10 bars', function() {
      expect($elem.find('g.bar').length).toBe(10);
    });

    it('should have a label on the y axis', function() {
      expect($elem.find('g.y.axis text.label').text()).toEqual('Burritos');
    });
  });
})();



