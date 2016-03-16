(function (ng, crip) {
    'use strict';
    crip.filemanager
        .controller('ItemPropertiesController', ItemPropertiesController);

    ItemPropertiesController.$inject = [
        '$log', '$scope', '$uibModalInstance', 'CripManagerTrans', 'item'
    ];

    function ItemPropertiesController($log, $scope, $uibModalInstance, Trans, item) {
        activate();

        function activate() {
            $log.info(item);
            $scope.item = resolveItemDetails(item);
            $scope.thumb = item.thumb;

            $scope.close = close;
        }

        /**
         * Hide modal
         */
        function close() {
            $uibModalInstance.close();
        }

        /**
         * Resolve item details
         *
         * @param {object} item
         * @returns {Array}
         */
        function resolveItemDetails(item) {
            if (item.isDir) {
                return resolveDirDetails(item);
            }
        }

        /**
         * Resolve folder details
         *
         * @param {object} item
         * @returns {Array}
         */
        function resolveDirDetails(item) {
            var details = [];

            details.push({
                name: Trans('item_properties_modal_item_type'),
                value: Trans('item_properties_modal_folder')
            }, {
                name: Trans('item_properties_modal_name'),
                value: item.full_name
            }, {
                name: Trans('item_properties_modal_date'),
                value: item.date
            }, {
                name: Trans('item_properties_modal_size'),
                value: item.getSize()
            });

            return details;
        }
    }
})(angular, window.crip);