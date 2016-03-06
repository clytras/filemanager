(function (ng, crip) {
    'use strict';

    crip.fileM
        .controller('BaseController', BaseController);

    BaseController.$inject = [
        '$log', '$scope', '$cookies', 'Notification', 'DirService', 'Dir'
    ];

    function BaseController($log, $scope, $cookies, Notification, DirService, Dir) {
        //$log.log('BaseController controller <- started');

        activate();

        function activate() {
            $scope.isDir = isDir;
            $scope.isDirUp = isDirUp;

            // only for sub-controller usage
            $scope._error = _error;
            $scope._warning = _warning;
            $scope._success = _success;

            $scope.manager = {
                path: '/'
            };

            // TODO: add caching and load last opened dir for $scope.folder.items
            Dir.query(onInitialDirLoaded);
        }

        /**
         * Check is passed item is folder
         *
         * @param item
         * @returns {*|boolean}
         */
        function isDir(item) {
            return item && ng.isDefined(item.mime) && item.mime === 'dir';
        }

        /**
         * Check is passed item is dir to go up
         * @param item
         * @returns {*|boolean|boolean}
         */
        function isDirUp(item) {
            return isDir(item) && item.name == '..';
        }

        function __resolveMessage(response) {
            var notification = false;

            if (ng.isDefined(response.notification))
                notification = response.notification;

            if (ng.isDefined(response.data) && ng.isDefined(response.data.notification))
                notification = response.data.notification;

            if (notification)
                return {hasMessage: true, message: notification};

            //$log.error('Cant get user friendly message from response', {response: response});
            return {hasMessage: false};
        }

        function _error(response) {
            $scope.fireBroadcast('_error');
            var handler = __resolveMessage(response);
            if (handler.hasMessage)
                Notification.error({message: handler.message});
        }

        function _warning(response) {
            $scope.fireBroadcast('_warning');
            var handler = __resolveMessage(response);
            if (handler.hasMessage)
                Notification.error({message: handler.message});
        }

        function _success(response) {
            var handler = __resolveMessage(response);
            if (handler.hasMessage)
                Notification.success({message: handler.message});
        }

        /**
         * Initial dir load for folder and tree
         *
         * @param response
         */
        function onInitialDirLoaded(response) {
            //$log.log('BaseController -> onInitialDirLoaded', {response: response});

            DirService.extend(response);

            $scope.fireBroadcast('tree-changed', response.dirs());
            $scope.fireBroadcast('folder-changed', response.items());

            //$log.log('FolderCache', {path: $cookies.get('path')});
            //if (!($cookies.get('path') === '/' || typeof $cookies.get('path') === 'undefined')) {
            //    $scope.fireBroadcast('change-folder', {path: $cookies.get('path')});
            //}
        }
    }
})(angular, window.crip || (window.crip = {}));