(function() {
  'use strict';

  var app = angular.module('config-directive', []);

  app.directive('config', function($compile) {
    return {
      restrict: 'E',
      templateUrl: 'config-directive.html',
      transclude: true,
      scope: {
        visible: '='
      },
      controller: function($scope) {
        var config = this;
        this.close = function() {
          $scope.visible = false;
        };
      },
      controllerAs: 'config'
    };
  });
})();
