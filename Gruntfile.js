module.exports = function(grunt) {

  // Project configuration
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      all: [
        'Gruntfile.js',
        'src/**/*.js'
      ]
    },
    'http-server': {
      'dev': {
        root: 'src/',
        port: 5062,
        ext: 'html',
        showDir: true,
        autoIndex: true
      }
    }
  });

  // Plugins
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-http-server');

  // Default task(s)
  grunt.registerTask('default', ['jshint']);

};
