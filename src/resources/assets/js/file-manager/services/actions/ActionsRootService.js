(function (ng, crip) {
    'use strict';

    crip.filemanager
        .service('ActionsRootService', ActionsRootService);

    ActionsRootService.$inject = ['DeleteService', 'RenameService', 'CreateFolderService'];

    function ActionsRootService(DeleteService, RenameService, CreateFolderService) {
        return {
            'extend': extend
        };

        function extend($scope) {
            var actions = {};

            DeleteService.extend(actions);
            RenameService.extend(actions);
            CreateFolderService.extend(actions);

            ng.extend($scope, {
                actions: actions
            });
        }
    }
})(angular, window.crip || (window.crip = {}));