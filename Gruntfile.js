/*global module:false*/
module.exports = function (grunt) {
  'use strict';

  require('load-grunt-tasks')(grunt);

  grunt.registerTask('default', [
    'clean:dist',
    'less',
    'autoprefixer',
    'requirejs',
    'uglify',
    'processhtml'
  ]);

  grunt.registerTask('serve', function () {
    grunt.task.run([
      'clean:dist',
      'connect:livereload',
      'watch'
    ]);
  });

  var config = {
    pkg: grunt.file.readJSON('package.json'),
    bowerDir: 'bower_components',
    clean: {
      dist: 'dist/',
      release: 'release/'
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      source: {
        src: ['Gruntfile.js', 'widget/**/*.js']
      },
      spec: {
        options: {
          jshintrc: 'test/.jshintrc'
        },
        src: ['test/spec/*.spec.js']
      }
    },
    less: {
      development: {
        options: {
          paths: ['examples/css/']
        },
        files: {
          'examples/css/main.css': 'examples/css/main.less'
        }
      }
    },
    cssmin: {
      dist: {
        files: {
          'dist/examples/css/main.min.css': [
            'dist/css/{,*/}*.css'
          ]
        }
      }
    },
    // Add vendor prefixed styles
    autoprefixer: {
      options: {
        browsers: ['> 1%']
      },
      dist: {
        files: [
          {
            expand: true,
            cwd: 'examples',
            src: 'css/{,*/}*.css',
            dest: 'examples'
          }
        ]
      }
    },
    'gh-pages': {
      options: {
        base: '.',
        repo: '<%= pkg.repository.url %>',
        branch: 'gh-pages',
        message: 'update static files'
      },
      src: ['**/*', '!node_modules/**']
    },
    // Watchers and live-reload for LESS files.
    watch: {
      options: {
        cwd: 'examples/'
      },
      js: {
        files: ['widget/{,*/}*.js'],
        options: {
          livereload: true
        }
      },
      css: {
        files: ['css/{,*/}*.less'],
        tasks: ['less', 'autoprefixer']
      },
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: [
          'index.html',
          'widget/{,*/}*.html',
          'css/{,*/}*.css'
        ]
      }
    },
    // The actual grunt server settings
    connect: {
      options: {
        port: 8010,
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: 'localhost',
        livereload: 35729
      },
      livereload: {
        options: {
          open: true,
          base: [
            './'
          ]
        }
      },
      test: {
        options: {
          port: 9001,
          base: [
            'test',
            './'
          ]
        }
      },
      dist: {
        options: {
          base: 'dist/'
        }
      }
    },
    requirejs: {
      dist: {
        options: {
          baseUrl: 'bower_components',
          mainConfigFile: 'examples/main.js',
          out: 'example.js',
          name: 'example',
          findNestedDependencies: true,
          wrapShim: true,
          skipDirOptimize: true,
          skipModuleInsertion: true,
          optimize: 'none',
          optimizeCss: 'none'
        }
      }
    },
    processhtml: {
      dist: {
        files: {
          'index.html': 'examples/index.html'
        }
      }
    },
    uglify: {
      dist: {
        files: {
          'example.js': 'example.js'
        }
      }
    }
  };

  // Project configuration.
  grunt.initConfig(config);
};
