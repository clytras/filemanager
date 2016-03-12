(function (ng, crip) {
    'use strict';

    crip.filemanager
        .service('RenameService', RenameService);

    RenameService.$inject = ['focus'];

    function RenameService(focus) {
        return {
            'extend': extend
        };

        function extend(actions) {
            ng.extend(actions, {
                canRename: canRenameItem,
                enableRename: enableRenameItem,
                rename: renameItem
            });

            /**
             * Check is the item can be renamed
             *
             * @param {boolean|object} item
             * @param {boolean} item.isDirUp
             * @returns {boolean}
             */
            function canRenameItem(item) {
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
             * @param {object} [event]
             * @returns {boolean}
             */
            function enableRenameItem(item, event) {
                if (!actions.canRenameItem(item))
                    return false;

                // if event is presented, stop it propagation
                if (ng.isDefined(event) && ng.isDefined(event.stopPropagation)) {
                    event.stopPropagation();
                }

                item.rename = true;
                focus('#{identifier} input[name="name"]'.supplant(item));

                return true;
            }

            /**
             * Rename item
             *
             * @param {boolean|object} item
             * @param {function} item.update
             * @returns {boolean}
             */
            function renameItem(item) {
                if (!actions.canRenameItem(item))
                    return false;

                return item.update();
            }
        }
    }
})(angular, window.crip);