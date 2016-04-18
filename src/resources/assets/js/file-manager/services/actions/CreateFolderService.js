(function (ng, crip) {
    'use strict';

    crip.filemanager
        .service('CreateFolderService', CreateFolderService);

    CreateFolderService.$inject = [
        'Dir', 'CripManagerBreadcrumb', 'CripManagerContent', 'RenameService'
    ];

    function CreateFolderService(Dir, Breadcrumb, Content, Rename) {
        var create = {
            _createInProgress: false,
            canCreateFolder: canCreateFolder,
            createFolder: createFolder
        };

        return create;

        /**
         * Check is folder can be created
         *
         * @returns {boolean}
         */
        function canCreateFolder() {
            return !create._createInProgress
        }

        /**
         * Create new folder
         *
         * @param {string} name
         * @param {function} [callback]
         */
        function createFolder(name, callback) {
            if (!canCreateFolder())
                return false;

            create._createInProgress = true;

            Dir.create(Breadcrumb.current(), {name: name}, function (r) {
                create._createInProgress = false;

                // Notify controllers to handle UI changes
                var item = Content.add(r);
                Content.selectSingle(item);

                if (ng.isDefined(callback) && ng.isFunction(callback)) {
                    callback(item);
                }
            });
        }

    }
})(angular, window.crip);