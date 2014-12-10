(function() {
  'use strict';

  var app = angular.module('bonitoApp', [
    'ui.bootstrap',
    'ngRoute',
    'lodash',

    'services-overview',
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
      path: 'services',
      subPages: [{
        name: 'Overview',
        path: 'overview'
      }, {
        name: 'Map',
        path: 'map'
      }]
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
        var idx = _.findIndex(pages, function(page) {
          return page.path === path;
        });
        return pages[idx];
      },

      subpageById: function(page, path) {
        var idx = _.findIndex(page.subPages, function(subpage) {
          return subpage.path === path;
        });
        return page.subPages[idx];
      }
    };

  }]);

  app.controller('ServicesMapCtrl', ['Pages', '_', function(Pages, _) {
    _.assign(Pages.activePage, Pages.getPageById('services'));
    Pages.activePage.activeSubpage = Pages.subpageById(Pages.activePage, 'map');
  }]);


  app.controller('SettingsCtrl', ['Pages', '_', function(Pages, _) {
    _.assign(Pages.activePage, Pages.getPageById('settings'));
    Pages.activePage.subPages = [];
  }]);

  app.config(['$routeProvider', function($routeProvider) {
    $routeProvider.
      when('/services/overview', {
        templateUrl: 'servicesOverview.html',
        controller: 'ServicesOverviewCtrl'
      }).
      when('/services/map', {
        templateUrl: 'servicesMap.html',
        controller: 'ServicesMapCtrl'
      }).
      when('/services', {
        redirectTo: '/services/overview'
      }).
      when('/settings', {
        templateUrl: 'settings.html',
        controller: 'SettingsCtrl'
      }).
      otherwise({
        redirectTo: '/services/overview'
      });
  }]);
})();
