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
      dev: {
        root: 'src/',
        port: 5062,
        ext: 'html',
        showDir: true,
        autoIndex: true,
        runInBackground: true
      },
    },
    less: {
      dev: {
        options: {
          paths: ['src/styles'],
        },
        files: {
          'src/styles/main.css': 'src/styles/main.less'
        }
      }
    },
    watch: {
      styles: {
        files: [
          'src/styles/*.less',
          'src/styles/theme/*.less'
        ],
        tasks: ['less'],
        options: {
          spawn: false
        }
      }
    }
  });

  // Load grunt plugins
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-http-server');
  grunt.loadNpmTasks('grunt-wiredep');

  // Custom tasks
  grunt.registerTask('dev', function() {
    var tasks = [
      'jshint',
      'wiredep',
      'less:dev',
      'http-server',
      'watch'
    ];

    grunt.task.run(tasks);
  });

  // Default task(s)
  grunt.registerTask('default', ['dev']);

};
