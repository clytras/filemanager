(function (ng, crip) {
    'use strict';

    crip.filemanager = ng.module('crip.file-manager', [
        'crip.core',
        'angular-loading-bar',
        'ngFileUpload',
        'ngCookies',
        'ngResource',
        'ngSanitize',
        'ngMaterial'
    ])
})(angular, window.crip || (window.crip = {}));