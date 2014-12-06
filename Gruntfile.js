module.exports = function(grunt) {

  // Project configuration
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      options: {
        ignores: ['src/bower_components/**/*.js']
      },
      all: [
        'Gruntfile.js',
        'src/**/*.js'
      ]
    },
    wiredep: {
      target: {
        src: [
          './**/*.html'
        ],
        dependencies: true,
        devDependencies: true
      }
    },
    'http-server': {
      'dev': {
        root: 'src/',
        port: 5062,
        ext: 'html',
        showDir: true,
        autoIndex: true
      },
    }
  });

  // Plugins
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-http-server');
  grunt.loadNpmTasks('grunt-wiredep');

  // Default task(s)
  grunt.registerTask('default', ['jshint']);

};
