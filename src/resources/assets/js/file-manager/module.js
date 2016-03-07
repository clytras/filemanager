(function (ng, crip) {
    'use strict';

    crip.filemanager = ng.module('crip.file-manager', [
        'crip.core',
        'angular-loading-bar',
        'angularFileUpload',
        'ngCookies',
        'ngResource',
        'ngSanitize',
        'ui.bootstrap',
        'ui-notification',
        'io.dennis.contextmenu'
    ])
})(angular, window.crip || (window.crip = {}));