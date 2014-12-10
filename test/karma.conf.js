module.exports = function(config){
  config.set({

    basePath : '.',

    files : [
      // bower:js
      '../src/bower_components/jquery/dist/jquery.js',
      '../src/bower_components/angular/angular.js',
      '../src/bower_components/angular-route/angular-route.js',
      '../src/bower_components/bootstrap/dist/js/bootstrap.js',
      '../src/bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
      '../src/bower_components/lodash/dist/lodash.compat.js',
      '../src/bower_components/angular-lodash-module/angular-lodash-module.js',
      '../src/bower_components/angular-mocks/angular-mocks.js',
      // endbower
      '../src/*.js',

      'unit/**/*.js'
    ],

    autoWatch : true,

    frameworks: ['jasmine'],

    browsers : ['Chrome'],

    plugins : [
      'karma-chrome-launcher',
      'karma-jasmine'
    ],

    junitReporter : {
      outputFile: 'test_out/unit.xml',
      suite: 'unit'
    }

  });
};
