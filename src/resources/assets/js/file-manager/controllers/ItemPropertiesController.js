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
            $scope.name = item.full_name;

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
            } else {
                return resolveFileDetails(item);
            }
        }

        /**
         * Get item default details
         *
         * @param {Array} details
         * @param {object} item
         * @param {string} item.full_name
         * @param {string} item.date
         * @param {function} item.getSize
         */
        function defaultDetails(details, item) {
            details.push({
                name: Trans('item_properties_modal_item_type'),
                value: Trans('item_properties_modal_file_type_' + item.type)
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
        }

        /**
         * Resolve folder details
         *
         * @param {object} item
         * @returns {Array}
         */
        function resolveDirDetails(item) {
            var details = [];
            defaultDetails(details, item);

            return details;
        }

        /**
         * Resolve file details
         *
         * @param {object} item
         * @returns {Array}
         */
        function resolveFileDetails(item) {
            var details = [];
            defaultDetails(details, item);

            if (item.dir !== '') {
                details.push({
                    name: Trans('item_properties_modal_item_dir'),
                    value: item.dir
                });
            }

            details.push({
                name: Trans('item_properties_modal_item_extension'),
                value: item.ext
            });

            if (item.type === 'image') {

                details.push({
                    name: Trans('item_properties_modal_item_url'),
                    value: '<a href="{url}" target="_blank">{title}</a>'.supplant({
                        url: item.url,
                        title: Trans('item_properties_modal_size_dim').supplant(item.dimensions)
                    })
                });

                ng.forEach($scope.imgSizes(), function (arr, size) {
                    details.push({
                        name: Trans('item_properties_modal_size_url_title').supplant({
                            size: Trans('item_properties_modal_size_key_' + size)
                        }),
                        value: '<a href="{url}?thumb={size}" target="_blank">{title}</a>'.supplant({
                            url: item.url,
                            size: size,
                            title: Trans('item_properties_modal_size_dim').supplant(arr)
                        })
                    });
                });
            } else {
                details.push({
                    name: Trans('item_properties_modal_item_url'),
                    value: '<a href="{url}" target="_blank">{full_name}</a>'.supplant(item)
                });
            }

            return details;
        }
    }
})(angular, window.crip);