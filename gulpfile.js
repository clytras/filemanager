// dependencies
var gulp = require('gulp'),
    cripweb = require('cripweb');

// Concat, uglify and sourcemap vendor packages
cripweb.scripts([
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
    '/angular-cookies/angular-cookies.js'
], 'core', 'scripts-core', 'bower_components', './src/public/js');

// Concat, uglify and sourcemap application code
cripweb.scripts([
    'angular-js/**/*module.js',
    'angular-js/app.js',
    'angular-js/**/*.js'
], 'app', 'scripts-app', 'src/resources/assets', './src/public/js');

// Copy and minify scripts, whitch cant be concated
cripweb.scripts(['**/*.js'], null, 'scripts-copy', 'src/resources/assets/js', './src/public/js');

// Compile sass in to css
cripweb.sass(
    'src/resources/assets/sass/app.scss',
    'src/resources/assets/sass/**/*.scss',
    'compile-sass',
    false,
    'src/public/css');

// Copy fonts
cripweb.copy('bower_components/bootstrap-sass/assets/fonts/**/*.*', 'src/public/fonts', 'fonts');

cripweb.copy('src/public/js/**/*.js', '../boilerplate/public/vendor/tahq69/cripfilemanager/js', 'publish-js');

cripweb.copy('src/public/css/**/*.css', '../boilerplate/public/vendor/tahq69/cripfilemanager/css', 'publish-css');

cripweb.copy('src/resources/views/**/*.php', '../boilerplate/resources/views/vendor/cripfilemanager', 'publish-views');

gulp.task('default', function () {
    cripweb.gulp.start('crip-default');
    cripweb.watch();
});