var gulp = require('gulp');
var path = require('path');
var fs = require('fs');
var mkdirp = require('mkdirp');
var _package = require('./package.json')

var buildSource = [
  './**',
  '!./node_modules/**',
  '!./node_modules/',
  '!./src/**/*.test.js',
  '!./build/**',
  '!./build/',
];

var manifest = {
  'version': _package.version,
  'name': 'VK Manager',
  'manifest_version': 2,

  'default_locale': 'pt_BR',
  'description': _package.description,
  'homepage_url': 'https://github.com/knoxzin1/vk-manager',

  'icons': {
    '48': 'images/icon_48.png',
    '128': 'images/icon_128.png'
  },
  'options_ui': {
    'chrome_style': true,
    'page': 'src/options.html'
  },
  'background': {
    'scripts': [
      'src/api.js',
      'src/background.js'
    ],
    'persistent': true
  },
  'content_scripts': [
    {
      'matches': ['*://vk.com/*'],
      'js': ['src/contentScript.js'],
      'run_at': 'document_end'
    }
  ],
  'web_accessible_resources': ['src/pageScript.js'],
  'permissions': ['activeTab', 'notifications', 'tabs', 'contextMenus', 'storage', '*://vk.com/*', '*://*.vk.com/*'],
};

gulp.task('build:chrome', ['build:chrome:manifest'], function() {
  return gulp.src(buildSource)
    .pipe(gulp.dest('./build/chrome'));
});

gulp.task('watch:chrome', function() {
  return gulp.watch(buildSource, ['build:chrome']);
});

gulp.task('build:chrome:manifest', function(callback) {

  mkdirp('./build/chrome/', function() {
    var chromeManifest = manifest;

    chromeManifest.key = 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAssvXLlOjudWEp22GcBJgtdwJ62xP5vp3Uwy9v1XqLtoS5UFtaTGD5DFdQSHsPyrRNfdxzAjxrP98Q8/sk7Ys6a14MYuN6f839rHis3G+L5zduccmr714OUUARAS8AOBQb74PamAzdhXymG1qpad7saTsvqakclkb+AjVbs2hkhSOvxuNI63X1KAN7rki/w6yhv5GoBvLwkJQpPmjfMIXisOmsbElM8njRTv3+6F5EszqxTFJn2fRt7ucB10tRH7MUXNlbmMwYnvQDJkY6lb0rAMV/N0wsvX6kluakYWeQozNjNO2ayD9tQ7/CVMAc/DQXQeqWlcl39AXK3hQz0ePLQIDAQAB';

    fs.writeFile(
      './build/chrome/manifest.json',
      JSON.stringify(chromeManifest, null, '  '),
      {},
      callback
    );
  });
});

gulp.task('build:firefox', ['build:firefox:manifest'], function() {
  return gulp.src(buildSource)
    .pipe(gulp.dest('./build/firefox'));
});

gulp.task('watch:firefox', function() {
  return gulp.watch(buildSource, ['build:firefox']);
});

gulp.task('build:firefox:manifest', function(callback) {

  mkdirp('./build/firefox/', function() {
    var firefoxManifest = manifest;

    firefoxManifest.applications = {
      gecko: {
        id: 'extension@vk.manager',
      },
    };

    fs.writeFile(
      './build/firefox/manifest.json',
      JSON.stringify(firefoxManifest, null, '  '),
      {},
      callback
    );
  });
});
