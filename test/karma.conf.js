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
      '../src/web/bower_components/moment/moment.js',
      '../src/web/bower_components/angular-hotkeys/build/hotkeys.min.js',
      '../src/web/bower_components/angular-keyboard/keyboard.min.js',
      // endbower
      '../src/web/*.js',
      '../src/web/timepicker/timepicker.js',
      '../src/web/timepicker/quick_ranges.js',
      '../src/web/timepicker/refresh_intervals.js',

      'unit/**/*.js',

      '../src/web/**/*.html'
    ],

    // templates pre-processor
    preprocessors: {
      '../src/web/**/*.html': ['ng-html2js']
    },

    ngHtml2JsPreprocessor: {
      stripPrefix: '.*/src/web/',
      moduleName: 'templates'
    },

    autoWatch : true,

    frameworks: ['jasmine'],

    browsers : ['Chrome', 'PhantomJS'],

    plugins : [
      'karma-chrome-launcher',
      'karma-phantomjs-launcher',
      'karma-jasmine',
      'karma-ng-html2js-preprocessor'
    ],

    junitReporter : {
      outputFile: 'test_out/unit.xml',
      suite: 'unit'
    }

  });
};
