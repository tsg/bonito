module.exports = function(config){
  config.set({

    basePath : '.',

    files : [
      // bower:js
      '../src/web/bower_components/jquery/dist/jquery.js',
      '../src/web/bower_components/angular/angular.js',
      '../src/web/bower_components/angular-route/angular-route.js',
      '../src/web/bower_components/bootstrap/dist/js/bootstrap.js',
      '../src/web/bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
      '../src/web/bower_components/lodash/dist/lodash.compat.js',
      '../src/web/bower_components/angular-lodash-module/angular-lodash-module.js',
      '../src/web/bower_components/angular-mocks/angular-mocks.js',
      '../src/web/bower_components/ngInfiniteScroll/build/ng-infinite-scroll.js',
      '../src/web/bower_components/d3/d3.js',
      // endbower
      '../src/web/*.js',

      'unit/**/*.js'
    ],

    autoWatch : true,

    frameworks: ['jasmine'],

    browsers : ['Chrome', 'PhantomJS'],

    plugins : [
      'karma-chrome-launcher',
      'karma-phantomjs-launcher',
      'karma-jasmine'
    ],

    junitReporter : {
      outputFile: 'test_out/unit.xml',
      suite: 'unit'
    }

  });
};
