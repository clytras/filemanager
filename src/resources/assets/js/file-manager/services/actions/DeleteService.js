(function (ng, crip) {
    'use strict';

    crip.filemanager
        .service('DeleteService', DeleteService);

    function DeleteService() {
        return {
            canDelete: canDelete,
            delete: deleteItem
        };

        /**
         * Check are the item deletable
         *
         * @param {boolean|object} item
         * @param {boolean} item.isDirUp
         * @returns {boolean}
         */
        function canDelete(item) {
            if (!item)
                return false;

            return !item.isDirUp;
        }

        /**
         * Delete item
         *
         * @param {object} item
         * @param {object} [event]
         * @returns {boolean}
         */
        function deleteItem(item) {
            if (!canDelete(item))
                return false;

            return item.delete();
        }
    }
})(angular, window.crip || (window.crip = {}));