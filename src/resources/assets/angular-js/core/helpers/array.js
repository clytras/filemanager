if (!removeFromArr) {
    function removeFromArr(arr, val, key) {
        for (var i = arr.length - 1; i >= 0; i--) {
            if (typeof key === "undefined") {
                if (arr[i] == val)
                    arr.splice(i, 1);
            }
            else if (arr[i][key] == val)
                arr.splice(i, 1);
        }
    }
}

if (!isDefined) {
    function isDefined() {
        var a = arguments;

        if (a.length === 0 || typeof a[0] === 'undefined')
            return false;

        var target = a[0];
        for (var arg in a) {
            if (arg === '0')
                continue;

            if (!target.hasOwnProperty(a[arg]))
                return false;

            target = target[a[arg]];
            if (typeof target === 'undefined')
                return false;
        }

        return true;
    }
}
