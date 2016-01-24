(function (ng, $) {
    'use strict';

    ng
        .module('file.manager')
        .service('Settings', Settings);

    Settings.$inject = [];

    function Settings() {
        var $settings = $('#settings'), params = false;

        return {
            isTarget: isTarget,
            getType: getType,
            getThumbSize: getThumbSize,
            getParams: getParams
        };

        function isTarget(curr_target) {
            return getParams().target.toLowerCase() === curr_target.toLowerCase();
        }

        function getType() {
            return (getParams().type ? params.type.toLowerCase() : false) || 'file';
        }

        function getThumbSize(sizeKey) {
            var sizes = ng.fromJson($settings.data('sizes').replace(/\'/g, '"'));

            return sizes[sizeKey];
        }

        function getParams() {
            if (!params) {
                var dataParams = $settings.data('params');
                // if params is empty array, it already converted to empty array
                if (dataParams.length === 0)
                    return {};

                params = strFromJson(dataParams);
            }
            return params;
        }
    }

    function fixSerializableStr(str) {
        return str.replace(/\'/g, '"');
    }

    function strFromJson(str) {
        return ng.fromJson(fixSerializableStr(str));
    }
})(angular, jQuery);