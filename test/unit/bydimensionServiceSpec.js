(function() {
  'use strict';

  beforeEach(module('bydimension-service'));

  describe('byDimensionProxy test with two services', function() {
    var service, $httpBackend;

    beforeEach(inject(function(byDimensionProxy, _$httpBackend_) {
      service = byDimensionProxy;
      $httpBackend = _$httpBackend_;

      $httpBackend.whenPOST('/api/bydimension').respond({
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
    }));

    it('should get a simple two elements', function() {
      service.load().then(function() {
        var services = service.get();
        expect(services.length).toBe(2);
      });
      $httpBackend.flush();
    });

    it('should work to sort by volume', function() {
      service.load().then(function() {
        var services = service.get('volume');
        expect(services.length).toBe(2);
        expect(services[0].name).toBe('service0');
        expect(services[1].name).toBe('service1');
      });
      $httpBackend.flush();
    });

    it('should work to sort by errors', function() {
      service.load().then(function() {
        var services = service.get('errors');
        expect(services.length).toBe(2);
        expect(services[0].name).toBe('service1');
        expect(services[1].name).toBe('service0');
      });
      $httpBackend.flush();
    });

    it('should work to sort alphabetically', function() {
      service.load().then(function() {
        var services = service.get('alpha');
        expect(services.length).toBe(2);
        expect(services[0].name).toBe('service0');
        expect(services[1].name).toBe('service1');
      });
      $httpBackend.flush();
    });

  });

})();
