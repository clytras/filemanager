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
    '/angular-cookies/angular-cookies.js',
    '/crip-angular-core/build/crip-core.js'
], 'core', 'scripts-core', 'bower_components', './src/public/js');

// Concat, uglify and sourcemap application code
cripweb.scripts([
    '**/*module.js',
    'app.js',
    'filemanager/**/*.js'
], 'app', 'scripts-app', 'src/resources/assets/js', './src/public/js');

// Copy and minify scripts, whitch cant be concated
cripweb.scripts(['tinymce/plugin.js'], null, 'scripts-copy-plugin', 'src/resources/assets/js', './src/public/js');
cripweb.scripts(['tinymce/plugins/**/*.js'], null, 'scripts-copy-tinymce', 'src/resources/assets/js', './src/public/js/tinymce/plugins');

// Compile sass in to css
cripweb.sass(
    'src/resources/assets/sass/app.scss',
    'src/resources/assets/sass/**/*.scss',
    'compile-sass',
    false,
    'src/public/css');

// Copy fonts
cripweb.copy('bower_components/bootstrap-sass/assets/fonts/**/*.*', 'src/public/fonts', 'fonts');
cripweb.copy('bower_components/bootstrap-sass/assets/fonts/**/*.*', '../../public/vendor/crip/filemanager/fonts', 'publish-fonts');
cripweb.copy('src/public/js/**/*.js', '../../public/vendor/crip/filemanager/js', 'publish-js');
cripweb.copy('src/public/css/**/*.css', '../../public/vendor/crip/filemanager/css', 'publish-css');
cripweb.copy('src/public/*.png', '../../public/vendor/crip/filemanager', 'publish-images');
cripweb.copy('src/resources/views/**/*.php', '../../resources/views/vendor/crip/filemanager', 'publish-views');

gulp.task('default', function () {
    cripweb.gulp.start('crip-default');
    cripweb.watch();
});