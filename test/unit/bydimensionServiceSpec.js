(function() {
  'use strict';

  beforeEach(module('bydimension-service'));

  describe('byDimensionProxy', function() {
    var service, $httpBackend;

    beforeEach(inject(function(byDimensionProxy, _$httpBackend_) {
      service = byDimensionProxy;
      $httpBackend = _$httpBackend_;
    }));

    it('should get a simple two elements', function() {
      $httpBackend.whenGET('/api/bydimension').respond({
        "status": "ok",
        "primary": [
          {
            "name": "service0",
            "metrics": {
              "errors_rate": 0.094059736,
              "volume": 15033
            }
          },
          {
            "name": "service1",
            "metrics": {
              "errors_rate": 0.098547995,
              "volume": 14876
            }
          }]
      });

      service.load().then(function() {
        var services = service.get();
        expect(services.length).toBe(2);
      });

      $httpBackend.flush();
    });

  });

})();
