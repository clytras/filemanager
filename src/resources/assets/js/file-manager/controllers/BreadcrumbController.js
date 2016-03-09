(function (ng, crip) {
    'use strict';

    crip.filemanager
        .controller('BreadcrumbController', BreadcrumbController);

    BreadcrumbController.$inject = [
        '$log', '$scope'
    ];

    function BreadcrumbController($log, $scope) {
        activate();

        function activate() {
            $scope.breadcrumb = [];
        }

        // watch RootController folder.manager property
        $scope.$watch('folder.manager', onManagerChange);

        /**
         * Update breadcrumb array when manager property is changed
         *
         * @param {object} val
         * @param {string} val.dir
         * @param {string} val.name
         */
        function onManagerChange(val) {
            var string_value = val.dir,
                breadcrumb = [];

            if (val.name !== '' && val.name !== null) {
                string_value += '/' + val.name;
            }


            ng.forEach(string_value.split('\/'), function (v, k) {
                if (v !== '' && v !== null) {

                    // create current dir from previous item, if it exists
                    var dir = '';
                    if(breadcrumb.length > 0) {
                        // if only one previous item, use it`s name
                        if(breadcrumb.length === 1) {
                            dir = breadcrumb[0].name;
                        }
                        // other way, concat prev dir with name
                        else {
                            dir = '{dir}/{name}'.supplant(breadcrumb[breadcrumb.length - 1]);
                        }
                    }

                    breadcrumb.push({name: v, dir: dir, isActive: false});
                }
            });

            // mark last item as active, this will help mark item as active
            if (breadcrumb.length > 0) {
                breadcrumb[breadcrumb.length - 1].isActive = true;
            }

            $scope.breadcrumb = breadcrumb;
            //$log.info($scope.breadcrumb);
        }
    }
})(angular, window.crip || (window.crip = {}));