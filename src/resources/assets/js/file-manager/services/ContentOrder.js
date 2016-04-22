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
         * @returns {string|number}
         */
        function orderBy(item) {
            var result = -Number.MAX_VALUE / 2;
            if (typeof item[order.field] === 'number') {
                if (item.isDir) {
                    if (!item.isDirUp)
                        result += item[order.field] + 1;

                    // for reverse sort, dirs should not change position
                    if (order.isReverse) {
                        result *= -1;
                        if (item.isDirUp)
                            result += Number.MAX_VALUE / 2;
                    }

                } else
                    result = item[order.field];
            } else {
                if (order.isReverse)
                    result = '1 {field}';
                else
                    result = 'z {field}';

                if (item.isDir) {
                    // dir up should be on first place
                    if (item.isDirUp) {
                        if (order.isReverse)
                            result = 'zzz';
                        else
                            result = '0 0';
                    }
                    else {
                        if (order.isReverse)
                            result = 'z {field}';
                        else
                            result = '1 {field}';
                    }
                }
                result = result.supplant({field: item[order.field]});
            }

            //$log.info(result);
            return result;
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