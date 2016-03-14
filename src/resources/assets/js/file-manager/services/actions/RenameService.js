(function (ng, crip) {
    'use strict';

    crip.filemanager
        .service('RenameService', RenameService);

    function RenameService() {
        return {
            canRename: canRename,
            enableRename: enableRename,
            rename: rename
        };


        /**
         * Check is the item can be renamed
         *
         * @param {boolean|object} item
         * @param {boolean} item.isDirUp
         * @returns {boolean}
         */
        function canRename(item) {
            if (!item)
                return false;

            return !item.isDirUp;
        }

        /**
         * Enable item rename
         *
         * @param {boolean|object} item
         * @param {string} item.identifier
         * @param {boolean} item.rename
         * @returns {boolean}
         */
        function enableRename(item) {
            if (!canRename(item))
                return false;

            return (item.rename = true);
        }

        /**
         * Rename item
         *
         * @param {boolean|object} item
         * @param {function} item.update
         * @returns {boolean}
         */
        function rename(item) {
            if (!canRename(item))
                return false;

            return item.update();
        }

    }
})(angular, window.crip);