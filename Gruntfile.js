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
      },
      karma: {
        src: ['test/karma.conf.js'],
        fileTypes: {
          js: {
            block: /(([\s\t]*)\/\/\s*bower:*(\S*))(\n|\r|.)*?(\/\/\s*endbower)/gi,
            detect: { js: /'(.*\.js)'/gi },
            replace: { js: '\'{{filePath}}\',' }
          }
        }
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
    },
    karma: {
      dev: {
        configFile: 'test/karma.conf.js',
      },
      once: {
        configFile: 'test/karma.conf.js',
        singleRun: true
      }
    }
  });

  // Load grunt plugins
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-http-server');
  grunt.loadNpmTasks('grunt-wiredep');
  grunt.loadNpmTasks('grunt-karma');

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

  grunt.registerTask('test', function() {
    grunt.task.run([
      'karma:once'
    ]);
  });

  // Default task(s)
  grunt.registerTask('default', ['dev']);

};
