(function (ng, crip) {
    'use strict';

    crip.filemanager
        .service('CripManagerContentOrder', ContentOrder);

    ContentOrder.$inject = ['$log'];

    function ContentOrder($log) {
        var order = {
            by: orderBy,
            isBy: isBy,
            set: setField,
            field: 'full_name',
            isReverse: false,

            full_name: true,
            bytes: false,
            updated_at: false
        };

        var allowed = ['full_name', 'bytes', 'updated_at'];

        return order;

        /**
         *
         * @param item
         * @returns {string}
         */
        function orderBy(item) {
            var text = 'z {field}';
            if (item.isDir) {
                // dir up should be on first place
                if (item.isDirUp)
                    return -1;
                text = '0 {field}';
            }

            //$log.info($scope.order.field, text.supplant({field: item[$scope.order.field]}), item);
            return text.supplant({field: item[order.field]});
        }

        /**
         * Is current order by field
         *
         * @param {string} field
         * @returns {boolean}
         */
        function isBy(field) {
            if (allowed.indexOf(field) !== -1)
                return !!order[field];

            return false;
        }

        /**
         * Set field as currently sortable
         *
         * @param {string} field
         */
        function setField(field) {
            if (allowed.indexOf(field) !== -1) {
                for (var p in allowed) {
                    if (allowed.hasOwnProperty(p) && allowed[p] != field)
                        order[allowed[p]] = false;
                }

                order.field = field;

                if (!order[field])
                    order[field] = true;
                else
                    order.isReverse = !order.isReverse;
            }
        }
    }
})(angular, window.crip);