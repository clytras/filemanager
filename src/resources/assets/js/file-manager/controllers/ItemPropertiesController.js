(function (ng, crip) {
    'use strict';
    crip.filemanager
        .controller('ItemPropertiesController', ItemPropertiesController);

    ItemPropertiesController.$inject = [
        '$log', '$scope', '$mdDialog', 'CripManagerTrans', 'item'
    ];

    function ItemPropertiesController($log, $scope, $mdDialog, Trans, item) {

        // when translations is loaded, begin initialize page content
        Trans.then(activate);

        var trans = {};

        function activate(translations) {
            // add translations for global variable, to be available in all methods
            trans = translations;

            //$log.info(item);
            $scope.item = resolveItemDetails(item);
            $scope.thumb = item.thumb;
            $scope.name = item.full_name;

            $scope.close = close;
        }

        /**
         * Hide modal
         */
        function close() {
            $mdDialog.hide();
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
         * @param {string} item.updated_at
         * @param {function} item.getSize
         */
        function defaultDetails(details, item) {
            //$log.log('item_properties_modal_file_type_' + item.type);
            details.push({
                name: trans['item_properties_modal_item_type'],
                value: trans['item_properties_modal_file_type_' + item.type]
            }, {
                name: trans['item_properties_modal_name'],
                value: item.full_name
            }, {
                name: trans['item_properties_modal_date'],
                value: item.updated_at
            }, {
                name: trans['item_properties_modal_size'],
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
                    name: trans['item_properties_modal_item_dir'],
                    value: item.dir
                });
            }

            details.push({
                name: trans['item_properties_modal_item_extension'],
                value: item.extension
            });

            if (item.type === 'image' && ng.hasValue(item.thumbs)) {

                details.push({
                    name: trans['item_properties_modal_item_url'],
                    value: '<a href="{url}" target="_blank">{title}</a>'.supplant({
                        url: item.url,
                        title: trans['item_properties_modal_size_dim'].supplant(item.size)
                    })
                });

                ng.forEach(item.thumbs, function (val, size) {
                    details.push({
                        name: trans['item_properties_modal_size_url_title'].supplant({
                            size: trans['item_properties_modal_size_key_' + size]
                        }),
                        value: '<a href="{url}" target="_blank">{title}</a>'.supplant({
                            url: val.url,
                            title: trans['item_properties_modal_size_dim'].supplant(val.size)
                        })
                    });
                });
            } else {
                details.push({
                    name: trans['item_properties_modal_item_url'],
                    value: '<a href="{url}" target="_blank">{full_name}</a>'.supplant(item)
                });
            }

            return details;
        }
    }
})(angular, window.crip);