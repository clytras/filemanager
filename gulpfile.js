// dependencies
var gulp = require('gulp'),
    cripweb = require('cripweb')(gulp, 'settings.json');

cripweb(function (crip) {
    // Concat, uglify and sourcemap vendor packages
    crip.scripts('vendor', [
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
        '/crip-angular-material/dist/angular-material.js',
        '/crip-angular-core/build/crip-core.js',
        '/crip-transparent-progressbar/build/transparent-progressbar.js'
    ], true, 'bower_components');

    // Concat, uglify and sourcemap application code
    crip.scripts('file-manager', ['**/*module.js', '**/*.js'], true, 'src/resources/assets/js/file-manager');

    // Copy and minify scripts, whitch cant be concated
    crip.scripts('plugin', 'src/resources/assets/js/tinymce/plugin.js', false)
        .scripts('tinymce', 'src/resources/assets/js/tinymce/plugins/**/*.js',
        crip.config.get('js.output') + '/tinymce/plugins', false);

    // Compile sass in to css
    crip.sass('compile',
        'app.scss',
        './src/public/css',
        'file-manager',
        '**/*.scss');

    var publishOutput = function (dir) {
        return '../../public/vendor/crip/cripfilemanager/' + (dir)
    };

    crip.copy('fonts', 'assets/fonts/**/*.*', 'src/public/fonts', 'bower_components/bootstrap-sass')
        .copy('images', 'assets/images/*', 'src/public/images', 'src/resources')
        .copy('templates', 'templates/*', 'src/public/templates', 'src/resources')
        .copy('publish-fonts', 'fonts/**/*.*', publishOutput('fonts'))
        .copy('publish-scripts', 'js/**/*.js', publishOutput('js'))
        .copy('publish-css', 'css/**/*.css', publishOutput('css'))
        .copy('publish-images', 'images/*', publishOutput('images'))
        .copy('publish-templates', 'templates/*', publishOutput('templates'))
        .copy('publish-views', 'views/**/*.php', '../../resources/views/vendor/cripfilemanager', 'src/resources/');
});