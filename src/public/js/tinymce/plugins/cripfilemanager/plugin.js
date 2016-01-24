tinymce.PluginManager.requireLangPack("cripfilemanager", "en_GB,lv,ru");
tinymce.PluginManager.add("cripfilemanager", function (editor) {
    function OpenCripFilemanager(event) {
        editor.focus(true);

        editor.windowManager.open({
            title: "Crip Filemanager",
            file: editor.settings.external_filemanager_path + '?target=tinymce',
            width: width(),
            height: height()
        }, {
            setUrl: setUrl
        })
    }

    editor.addButton("cripfilemanager", {
        icon: "browse",
        tooltip: "Insert file",
        shortcut: "Ctrl+E",
        onclick: OpenCripFilemanager
    });

    editor.addShortcut("Ctrl+E", "", OpenCripFilemanager);

    editor.addMenuItem("cripfilemanager", {
        icon: "browse",
        text: "Insert file",
        shortcut: "Ctrl+E",
        onclick: OpenCripFilemanager,
        context: "insert"
    });

    function setUrl(selected_url) {
        editor.insertContent(editor.convertURL(selected_url));
    }

    function bodyElement() {
        return document.getElementsByTagName('body')[0];
    }

    function width() {
        return (window.innerWidth ||
            document.documentElement.clientWidth ||
            bodyElement().clientWidth) - 90;
    }

    function height() {
        return (window.innerHeight ||
            document.documentElement.clientHeight ||
            bodyElement().clientHeight) - 90;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJjcmlwZmlsZW1hbmFnZXIvcGx1Z2luLmpzIl0sInNvdXJjZXNDb250ZW50IjpbInRpbnltY2UuUGx1Z2luTWFuYWdlci5yZXF1aXJlTGFuZ1BhY2soXCJjcmlwZmlsZW1hbmFnZXJcIiwgXCJlbl9HQixsdixydVwiKTtcclxudGlueW1jZS5QbHVnaW5NYW5hZ2VyLmFkZChcImNyaXBmaWxlbWFuYWdlclwiLCBmdW5jdGlvbiAoZWRpdG9yKSB7XHJcbiAgICBmdW5jdGlvbiBPcGVuQ3JpcEZpbGVtYW5hZ2VyKGV2ZW50KSB7XHJcbiAgICAgICAgZWRpdG9yLmZvY3VzKHRydWUpO1xyXG5cclxuICAgICAgICBlZGl0b3Iud2luZG93TWFuYWdlci5vcGVuKHtcclxuICAgICAgICAgICAgdGl0bGU6IFwiQ3JpcCBGaWxlbWFuYWdlclwiLFxyXG4gICAgICAgICAgICBmaWxlOiBlZGl0b3Iuc2V0dGluZ3MuZXh0ZXJuYWxfZmlsZW1hbmFnZXJfcGF0aCArICc/dGFyZ2V0PXRpbnltY2UnLFxyXG4gICAgICAgICAgICB3aWR0aDogd2lkdGgoKSxcclxuICAgICAgICAgICAgaGVpZ2h0OiBoZWlnaHQoKVxyXG4gICAgICAgIH0sIHtcclxuICAgICAgICAgICAgc2V0VXJsOiBzZXRVcmxcclxuICAgICAgICB9KVxyXG4gICAgfVxyXG5cclxuICAgIGVkaXRvci5hZGRCdXR0b24oXCJjcmlwZmlsZW1hbmFnZXJcIiwge1xyXG4gICAgICAgIGljb246IFwiYnJvd3NlXCIsXHJcbiAgICAgICAgdG9vbHRpcDogXCJJbnNlcnQgZmlsZVwiLFxyXG4gICAgICAgIHNob3J0Y3V0OiBcIkN0cmwrRVwiLFxyXG4gICAgICAgIG9uY2xpY2s6IE9wZW5DcmlwRmlsZW1hbmFnZXJcclxuICAgIH0pO1xyXG5cclxuICAgIGVkaXRvci5hZGRTaG9ydGN1dChcIkN0cmwrRVwiLCBcIlwiLCBPcGVuQ3JpcEZpbGVtYW5hZ2VyKTtcclxuXHJcbiAgICBlZGl0b3IuYWRkTWVudUl0ZW0oXCJjcmlwZmlsZW1hbmFnZXJcIiwge1xyXG4gICAgICAgIGljb246IFwiYnJvd3NlXCIsXHJcbiAgICAgICAgdGV4dDogXCJJbnNlcnQgZmlsZVwiLFxyXG4gICAgICAgIHNob3J0Y3V0OiBcIkN0cmwrRVwiLFxyXG4gICAgICAgIG9uY2xpY2s6IE9wZW5DcmlwRmlsZW1hbmFnZXIsXHJcbiAgICAgICAgY29udGV4dDogXCJpbnNlcnRcIlxyXG4gICAgfSk7XHJcblxyXG4gICAgZnVuY3Rpb24gc2V0VXJsKHNlbGVjdGVkX3VybCkge1xyXG4gICAgICAgIGVkaXRvci5pbnNlcnRDb250ZW50KGVkaXRvci5jb252ZXJ0VVJMKHNlbGVjdGVkX3VybCkpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGJvZHlFbGVtZW50KCkge1xyXG4gICAgICAgIHJldHVybiBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnYm9keScpWzBdO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHdpZHRoKCkge1xyXG4gICAgICAgIHJldHVybiAod2luZG93LmlubmVyV2lkdGggfHxcclxuICAgICAgICAgICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoIHx8XHJcbiAgICAgICAgICAgIGJvZHlFbGVtZW50KCkuY2xpZW50V2lkdGgpIC0gOTA7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaGVpZ2h0KCkge1xyXG4gICAgICAgIHJldHVybiAod2luZG93LmlubmVySGVpZ2h0IHx8XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHQgfHxcclxuICAgICAgICAgICAgYm9keUVsZW1lbnQoKS5jbGllbnRIZWlnaHQpIC0gOTA7XHJcbiAgICB9XHJcbn0pOyJdLCJmaWxlIjoiY3JpcGZpbGVtYW5hZ2VyL3BsdWdpbi5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
