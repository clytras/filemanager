// dependencies
var gulp = require('gulp'),
    crip = require('cripweb');

// Concat, uglify and sourcemap vendor packages
crip.scripts([
    '/jquery/dist/jquery.js',
    '/angular/angular.js',
    '/angular-resource/angular-resource.js',
    '/angular-sanitize/angular-sanitize.js',
    '/angular-cookies/angular-cookies.js',
    '/angular-animate/angular-animate.js',
    '/angular-aria/angular-aria.min.js',
    '/angular-loading-bar/build/loading-bar.js',
    '/ng-file-upload-shim/ng-file-upload-shim.min.js',
    '/ng-file-upload/ng-file-upload.js',
    '/angular-material/angular-material.min.js',
    '/crip-angular-core/build/crip-core.js',
    '/crip-transparent-progressbar/build/transparent-progressbar.js'
], 'vendor', 'scripts-core', 'bower_components', './src/public/js');

// Concat, uglify and sourcemap application code
crip.scripts([
    '**/*module.js',
    '**/*.js'
], 'file-manager', 'scripts-app', 'src/resources/assets/js/file-manager', './src/public/js');

// Copy and minify scripts, whitch cant be concated
crip.scripts(
    ['tinymce/plugin.js'], null,
    'scripts-copy-plugin',
    'src/resources/assets/js',
    './src/public/js');
crip.scripts(
    ['tinymce/plugins/**/*.js'], null,
    'scripts-copy-tinymce',
    'src/resources/assets/js',
    './src/public/js/tinymce/plugins');

// Compile sass in to css
crip.sass(
    'src/resources/assets/sass/app.scss',
    'src/resources/assets/sass/**/*.scss',
    'compile-sass',
    'file-manager',
    'src/public/css');

crip.copy(
    'bower_components/bootstrap-sass/assets/fonts/**/*.*',
    'src/public/fonts', 'fonts');
crip.copy(
    'src/resources/assets/images/*',
    'src/public/images', 'images');
crip.copy(
    'src/resources/templates/*',
    'src/public/templates', 'templates');

crip.copy(
    'bower_components/bootstrap-sass/assets/fonts/**/*.*',
    '../../public/vendor/crip/cripfilemanager/fonts', 'publish-fonts');
crip.copy('src/public/js/**/*.js', '../../public/vendor/crip/cripfilemanager/js', 'publish-js');
crip.copy('src/public/css/**/*.css', '../../public/vendor/crip/cripfilemanager/css', 'publish-css');
crip.copy('src/public/images/*', '../../public/vendor/crip/cripfilemanager/images', 'publish-images');
crip.copy('src/public/templates/*', '../../public/vendor/crip/cripfilemanager/templates', 'publish-templates');
crip.copy('src/resources/views/**/*.php', '../../resources/views/vendor/cripfilemanager', 'publish-views');

gulp.task('default', function () {
    crip.gulp.start('crip-default');
    crip.watch();
});