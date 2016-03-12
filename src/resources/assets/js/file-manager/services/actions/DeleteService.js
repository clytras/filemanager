(function (ng, crip) {
    'use strict';

    crip.filemanager
        .service('DeleteService', DeleteService);

    DeleteService.$inject = ['$rootScope'];

    function DeleteService($rootScope) {
        return {
            'extend': extend
        };

        function extend(actions) {
            ng.extend(actions, {
                canDelete: canDeleteItem,
                delete: deleteItem
            });

            /**
             * Check are the item deletable
             *
             * @param {boolean|object} item
             * @param {boolean} item.isDirUp
             * @returns {boolean}
             */
            function canDeleteItem(item) {
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
            function deleteItem(item, event) {
                if (!actions.canDeleteItem(item))
                    return false;

                // if event is presented, stop it propagation
                if (ng.isDefined(event) && ng.isDefined(event.stopPropagation)) {
                    event.stopPropagation();
                }

                // Notify controllers to handle UI changes
                $rootScope.fireBroadcast('folder-item-remove', [item]);

                return item.delete();
            }
        }
    }
})(angular, window.crip || (window.crip = {}));