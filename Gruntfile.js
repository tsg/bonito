module.exports = function(grunt) {

  // Project configuration
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      options: {
        ignores: ['src/web/bower_components/**/*.js']
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
        root: 'src/web',
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
          paths: ['src/web/styles'],
        },
        files: {
          'src/web/styles/main.css': 'src/web/styles/main.less'
        }
      }
    },
    watch: {
      styles: {
        files: [
          'src/web/styles/*.less',
          'src/web/styles/theme/*.less'
        ],
        tasks: ['less'],
        options: {
          spawn: false
        }
      },
      gotest: {
        files: [
          "src/bonitosrv/**/*.go"
        ],
        tasks: ['gotestonce'],
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
      },
      phantom: {
        configFile: 'test/karma.conf.js',
        browsers: ['PhantomJS'],
        singleRun: true
      }
    },
    protractor: {
      dev: {
        options: {
          configFile: 'test/protractor-conf.js'
        }
      }
    },
    shell: {
      gotest: {
        command: 'ginkgo -r',
        options: {
          execOptions: {
            cwd: 'src/bonitosrv'
          }
        }
      },
      gofmt: {
        command: 'go fmt ./...',
        options: {
          execOptions: {
            cwd: 'src/bonitosrv'
          }
        }
      },
      govet: {
        command: 'go vet ./...',
        options: {
          execOptions: {
            cwd: 'src/bonitosrv'
          }
        }
      }
    },
    githooks: {
      all: {
        'pre-commit': 'jshint shell:gofmt shell:govet test'
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
  grunt.loadNpmTasks('grunt-protractor-runner');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-githooks');

  /** Custom tasks */
  grunt.registerTask('dev', 'Run sever for JS only development', function() {
    var tasks = [
      'jshint',
      'wiredep',
      'less:dev',
      'http-server',
      'watch:styles'
    ];

    grunt.task.run(tasks);
  });

  grunt.registerTask('gotest', 'Run Bonitosrv unit tests', function(once) {
    grunt.task.run('gotestonce');
    if (once !== 'once') {
      grunt.task.run('watch:gotest');
    }
  });

  grunt.registerTask('gotestonce', 'Run Bonitosrv unit tests once', ['shell:gotest']);

  // Run unit tests
  grunt.registerTask('test', function() {
    grunt.task.run([
      'karma:phantom',
      'gotestonce'
    ]);
  });

  // Default task(s)
  grunt.registerTask('default', ['dev']);

};
