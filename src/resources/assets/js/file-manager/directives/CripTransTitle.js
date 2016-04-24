(function (ng, crip) {
    'use strict';

    crip.filemanager
        .directive('cripTransTitle', cripTransTitle);

    cripTransTitle.$inject = ['$log', 'CripManagerTrans'];

    function cripTransTitle($log, Trans) {
        return {
            link: link,
            restrict: 'A'
        };

        function link(scope, element, attr, ctrl) {
            Trans.then(function(values){
                element.attr('title', values[attr.cripTransTitle]);
            });
        }
    }

})(angular, crip);