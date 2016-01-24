// A simple templating method for replacing placeholders enclosed in curly braces.
if (!String.prototype.supplant) {
    String.prototype.supplant = function (o) {
        return this.replace(/{([^{}]*)}/g,
            function (a, b) {
                var r = o[b];
                return typeof r === 'string' || typeof r === 'number' ? r : a;
            }
        );
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJzdHJpbmcuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQSBzaW1wbGUgdGVtcGxhdGluZyBtZXRob2QgZm9yIHJlcGxhY2luZyBwbGFjZWhvbGRlcnMgZW5jbG9zZWQgaW4gY3VybHkgYnJhY2VzLlxyXG5pZiAoIVN0cmluZy5wcm90b3R5cGUuc3VwcGxhbnQpIHtcclxuICAgIFN0cmluZy5wcm90b3R5cGUuc3VwcGxhbnQgPSBmdW5jdGlvbiAobykge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnJlcGxhY2UoL3soW157fV0qKX0vZyxcclxuICAgICAgICAgICAgZnVuY3Rpb24gKGEsIGIpIHtcclxuICAgICAgICAgICAgICAgIHZhciByID0gb1tiXTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0eXBlb2YgciA9PT0gJ3N0cmluZycgfHwgdHlwZW9mIHIgPT09ICdudW1iZXInID8gciA6IGE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICApO1xyXG4gICAgfTtcclxufSJdLCJmaWxlIjoic3RyaW5nLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
