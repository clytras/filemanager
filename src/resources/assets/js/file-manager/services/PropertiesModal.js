(function (ng, crip) {
    'use strict';

    crip.filemanager
        .service('CripPropertiesModal', PropertiesModal);

    PropertiesModal.$inject = ['$mdDialog', 'CripManagerSettings', 'CripManagerContent'];

    function PropertiesModal($mdDialog, Settings, Content) {
        return {
            open: open
        };

        /**
         * Open item properties modal
         *
         * @param {object} item
         * @param {string} item.identifier
         * @returns {boolean}
         */
        function open(item) {
            if(!Content.hasProperties(item)) {
                return false;
            }

            $mdDialog.show({
                clickOutsideToClose: true,
                openFrom: '#' + item.identifier,
                closeTo: '#' + item.identifier,
                templateUrl: Settings.templatePath('item-properties-modal'),
                controller: 'ItemPropertiesController',
                locals: {
                    item: item
                }
            });
        }
    }

})(angular, window.crip);