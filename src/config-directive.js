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
          console.log("close called");
          $scope.visible = false;
        };
      },
      controllerAs: 'config'
    };
  });
})();
