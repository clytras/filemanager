(function (ng, crip) {
    'use strict';

    crip.filemanager
        .service('CripManagerReturnFile', ReturnFile);

    ReturnFile.$inject = ['$log', 'CripManagerSettings'];

    function ReturnFile($log, Settings) {
        return function (item, img_size) {
            $log.debug(item, img_size);
            var url = item.url;

            if (hasThumb(item, img_size)) {
                url = item.thumbs[img_size].url;
            }

            if (Settings.isTarget('tinyMCE')) {
                selectForTinyMce(url);
                return;
            }

            if (Settings.isTarget('callback')) {
                selectForCallback(url);
            }
        };

        /**
         * Determine thumb existence in item
         *
         * @param {Object} item
         * @param {String} [thumb_size]
         * @returns {boolean}
         */
        function hasThumb(item, thumb_size) {
            // only img mime has thumbs
            if (item.mime !== 'img')
                return false;

            // check is thumb_size is provided
            if (typeof thumb_size !== 'string')
                return false;

            // if size exists for item, return true
            return ng.isDefined(item.thumbs[thumb_size])
        }

        /**
         * Select file for tinyMCE
         *
         * @param {String} url
         */
        function selectForTinyMce(url) {
            if (!top.tinymce)
                throw new Error('tinyMCE is selected as target, but `window.top` does not contain it!');

            var wManager = top.tinymce.activeEditor.windowManager;

            if (top.tinymce.majorVersion < 4) {
                var editor_id = wManager.params.mce_window_id;

                wManager.params.setUrl(url);
                wManager.close(editor_id);
            } else {
                wManager.getParams().setUrl(url);
                wManager.close();
            }
        }

        /**
         * Select url for user callback
         *
         * @param {String} url
         */
        function selectForCallback(url) {
            var userCallback = Settings.params.callback,
                callback = ng.noop;

            if (userCallback)
                callback = window[userCallback] || parent[userCallback] || top[userCallback];
            else
                callback = cripFileManager || parent.cripFileManager || top.cripFileManager;

            if (typeof callback !== 'function')
                throw new Error('callback method for file select not found!');

            callback(url, Settings.params);
        }
    }
})(angular, window.crip);