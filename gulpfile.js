// dependencies
var gulp = require('gulp'),
    crip = require('cripweb');

// Concat, uglify and sourcemap vendor packages
crip.scripts([
    '/jquery/dist/jquery.js',
    '/bootstrap-sass/assets/javascripts/bootstrap.js',
    '/angular/angular.js',
    '/angular-file-upload/dist/angular-file-upload.min.js',
    '/angular-resource/angular-resource.js',
    '/angular-sanitize/angular-sanitize.js',
    '/angular-ui-notification/dist/angular-ui-notification.min.js',
    '/angular-bootstrap/ui-bootstrap.js',
    '/angular-bootstrap/ui-bootstrap-tpls.js',
    '/angular-contextmenu/dist/contextmenu.js',
    '/angular-loading-bar/build/loading-bar.js',
    '/angular-cookies/angular-cookies.js',
    '/crip-angular-core/build/crip-core.js'
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
    'bower_components/bootstrap-sass/assets/fonts/**/*.*',
    '../../public/vendor/crip/filemanager/fonts', 'publish-fonts');
crip.copy('src/public/js/**/*.js', '../../public/vendor/crip/filemanager/js', 'publish-js');
crip.copy('src/public/css/**/*.css', '../../public/vendor/crip/filemanager/css', 'publish-css');
crip.copy('src/public/images/*', '../../public/vendor/crip/filemanager/images', 'publish-images');
crip.copy('src/resources/views/**/*.php', '../../resources/views/vendor/crip/filemanager', 'publish-views');

gulp.task('default', function () {
    crip.gulp.start('crip-default');
    crip.watch();
});