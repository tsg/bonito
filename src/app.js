(function() {
  'use strict';

  var app = angular.module('bonitoApp', [
    'ui.bootstrap',
    'ngRoute',
    'lodash',

    'navbar-directive'
  ]);

  app.factory('Pages', ['_', function(_) {
    var pages = [{
      name: 'Dashboards',
      path: 'dashboards'
    }, {
      name: 'Discover',
      path: 'discover'
    }, {
      name: 'Services',
      path: 'services'
    }, {
      name: 'Anomalies',
      path: 'anomalies'
    }, {
      name: 'Settings',
      path: 'settings'
    }];

    return {

      activePage: {
        path: pages[0].path
      },

      getPages: function() {
        return pages;
      },

      getPageById: function(path) {
        var to_return = null;
        _.forEach(pages, function(page) {
          if (page.path === path) {
            to_return = page;
            return false;
          }
        });
        return to_return;
      }
    };

  }]);

  app.controller('BonitoAppCtrl', ['Pages', function(Pages) {
    this.pages = Pages.getPages();

    // the activePage reference is shared between controllers
    this.activePage = Pages.activePage;
  }]);

  app.controller('ServicesCtrl', ['Pages', function(Pages) {
    Pages.activePage.path = Pages.getPageById('services').path;
  }]);

  app.controller('SettingsCtrl', ['Pages', function(Pages) {
    Pages.activePage.path = Pages.getPageById('settings').path;
  }]);

  app.config(['$routeProvider', function($routeProvider) {
    $routeProvider.
      when('/services', {
        templateUrl: 'services.html',
        controller: 'ServicesCtrl'
      }).
      when('/settings', {
        templateUrl: 'settings.html',
        controller: 'SettingsCtrl'
      }).
      otherwise({
        redirectTo: '/services'
      });
  }]);
})();
