(function (ng, crip) {
    'use strict';

    crip.filemanager
        .directive('cripTransAlt', cripTransAlt);

    cripTransAlt.$inject = ['$log', 'CripManagerTrans'];

    function cripTransAlt($log, Trans) {
        return {
            link: link,
            restrict: 'A'
        };

        function link(scope, element, attr, ctrl) {
            Trans.then(function(values){
                element.attr('alt', values[attr.cripTransAlt]);
            });
        }
    }

})(angular, crip);