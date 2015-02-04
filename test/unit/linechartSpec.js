(function() {
  'use strict';

  describe('Directive: bonito-linechart', function() {
    var $compile,
      $scope;

    beforeEach(module('bonitoViz'));

    beforeEach(inject(function(_$compile_, _$rootScope_) {
      $compile = _$compile_;
      $scope = _$rootScope_;

      $scope.data = [{
        ts: new Date(1),
        value: 1
      }, {
        ts: new Date(2),
        value: 2
      }, {
        ts: new Date(3),
        value: 3
      }, {
        ts: new Date(4),
        value: 4
      }];
    }));

    it('adds an svg element', function() {
      var el = $compile('<bonito-linechart data="data" width="200" height="100"></bonito-linechart>')($scope);
      $scope.$digest();
      expect(el.children().length).toBe(1);
      expect((el.children()[0]).tagName).toBe('svg');
    });

    it('contains a line path', function() {
      var el = $compile('<bonito-linechart data="data" width="200" height="100"></bonito-linechart>')($scope);
      $scope.$digest();
      expect(el.find('path.line')).toBeDefined();
    });

    it('contains axis', function() {
      var el = $compile('<bonito-linechart data="data" width="200" height="100"></bonito-linechart>')($scope);
      $scope.$digest();
      expect(el.find('g.axis').length).toBe(2);
    });

    it('should print the right label on the y axis', function() {
      var el = $compile('<bonito-linechart data="data" ylabel="burritos" height="100"></bonito-linechart>')($scope);
      $scope.$digest();
      expect(el.find('g.y.axis text.label').text()).toEqual('burritos');
    });
  });
})();
