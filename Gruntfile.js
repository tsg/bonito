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
          async: true
        }
      },
      gotest: {
        files: [
          "src/bonitosrv/**/*.go"
        ],
        tasks: ['gotestonce']
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
      },
      gendata: {
        command: 'go run src/bonitosrv/gentestdata/gen.go'
      },
      gin : {
        command: 'gin --port 5063',
        options: {
          execOptions: {
            cwd: 'src/bonitosrv',
            maxBuffer: Infinity
          }
        }
      }
    },
    githooks: {
      all: {
        'pre-commit': 'precommit'
      }
    },
    concurrent: {
      devserver: {
        tasks: [
          'watch:styles',
          'shell:gin'
        ],
        options: {
          logConcurrentOutput: true
        }
      }
    }
  });

  // Load grunt plugins
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-wiredep');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-protractor-runner');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-contrib-githooks');
  grunt.loadNpmTasks('grunt-concurrent');

  /** Custom tasks */
  grunt.registerTask('dev', 'Run development server', function() {
    var tasks = [
      'jshint',
      'wiredep',
      'less:dev',
      'gentestdata',
      'concurrent:devserver'
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
  grunt.registerTask('gentestdata', 'Generate test data in ES', ['shell:gendata']);

  // Run unit tests
  grunt.registerTask('test', function() {
    grunt.task.run([
      'karma:phantom',
      'gotestonce'
    ]);
  });

  grunt.registerTask('e2e', 'Run end-to-end tests', [
    'gentestdata',
    'protractor:dev'
  ]);

  grunt.registerTask('precommit', 'Run the pre-commit tasks', [
    'jshint',
    'shell:gofmt',
    'shell:govet',
    'test'
  ]);

  // Default task(s)
  grunt.registerTask('default', ['dev']);

};
