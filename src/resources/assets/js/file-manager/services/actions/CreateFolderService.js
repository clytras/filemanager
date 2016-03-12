(function (ng, crip) {
    'use strict';

    crip.filemanager
        .service('CreateFolderService', CreateFolderService);

    CreateFolderService.$inject = ['$rootScope', 'Dir', 'Breadcrumb'];

    function CreateFolderService($rootScope, Dir, Breadcrumb) {
        return {
            'extend': extend
        };

        /**
         * Add crete dir functionality for actions object
         * (RenameService should be applied before this)
         *
         * @param {object} actions
         * @param {function} actions.enableRename
         */
        function extend(actions) {
            ng.extend(actions, {
                _createInProgress: false,
                canCreateFolder: canCreateFolder,
                createFolder: createFolder
            });

            /**
             * Check is folder can be created
             *
             * @returns {boolean}
             */
            function canCreateFolder() {
                return !actions._createInProgress
            }

            /**
             * Create new folder
             *
             * @param {string} name
             */
            function createFolder(name) {
                actions._createInProgress = true;

                Dir.create(Breadcrumb.current(), {name: name}, function (response) {
                    actions._createInProgress = false;

                    // Notify controllers to handle UI changes
                    $rootScope.fireBroadcast('folder-item-add', [response]);
                    $rootScope.fireBroadcast('folder-item-select', [response]);

                    actions.enableRename(response);
                });
            }
        }
    }
})(angular, window.crip);