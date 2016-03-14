(function (ng, crip) {
    'use strict';

    crip.filemanager
        .service('CripManagerActions', Actions);

    Actions.$inject = [
        'CreateFolderService', 'DeleteService', 'RenameService'
    ];

    function Actions(CreateFolder, Delete, Rename) {
        var scope = {};
        ng.extend(scope, CreateFolder, Delete, Rename);

        return scope;
    }
})(angular, window.crip);