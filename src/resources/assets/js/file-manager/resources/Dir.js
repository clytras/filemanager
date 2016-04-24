(function (crip) {
    'use strict';

    crip.filemanager
        .service('Dir', Dir);

    Dir.$inject = [
        '$resource', 'CripManagerSettings'
    ];

    function Dir($resource, Settings) {
        return $resource(Settings.dirUrl(':dir/:name'), {
            dir: '@dir',
            name: '@name'
        }, {
            'create': {url: Settings.dirUrl(':dir/:name', 'create'), method: 'POST'},
            'deleteDir': {url: Settings.dirUrl(':dir', 'delete'), method: 'GET'},
            'deleteFile': {url: Settings.fileUrl(':dir/:name', 'delete'), method: 'GET'},
            'renameDir': {url: Settings.dirUrl(':dir', 'rename'), method: 'GET'},
            'renameFile': {url: Settings.fileUrl(':dir', 'rename'), method: 'GET'}
        });
    }
})(window.crip || (window.crip = {}));