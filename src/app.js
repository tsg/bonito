(function() {
  'use strict';

  var app = angular.module('bonitoApp', ['ui.bootstrap']);

  app.controller('BonitoAppCtrl', function() {
    this.pages = [{
      name: 'Services',
      path: 'services'
    }];

    this.activePage = this.pages[0];
    this.isCollapsed = false;
  });
})();
