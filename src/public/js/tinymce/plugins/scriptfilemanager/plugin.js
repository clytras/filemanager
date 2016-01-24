tinymce.PluginManager.add("scriptfilemanager", function (editor) {
    function OpenCripFileManager(event) {
        editor.focus(true);

        editor.windowManager.open({
            title: 'Crip Filemanager',
            file: editor.settings.external_filemanager_path + '?target=tinymce',
            width: width(),
            height: height()
        }, {
            setUrl: setUrl
        })
    }

    editor.addButton("scriptfilemanager", {
        icon: false,
        text: 'My button',
        tooltip: "Insert file",
        shortcut: "Ctrl+E",
        onclick: OpenCripFileManager
    });

    editor.addShortcut("Ctrl+E", "", OpenCripFileManager);

    editor.addMenuItem("scriptfilemanager", {
        icon: "browse",
        text: "Insert file",
        shortcut: "Ctrl+E",
        onclick: OpenCripFileManager,
        context: "insert"
    });

    function setUrl(selected_url) {
        editor.insertContent(editor.convertURL(selected_url));
    }

    function bodyElement() {
        return document.getElementsByTagName('body')[0];
    }

    function width() {
        return (window.innerWidth || document.documentElement.clientWidth || bodyElement().clientWidth) - 90;
    }

    function height() {
        return (window.innerHeight || document.documentElement.clientHeight || bodyElement().clientHeight) - 90;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJ0aW55bWNlL3BsdWdpbnMvc2NyaXB0ZmlsZW1hbmFnZXIvcGx1Z2luLmpzIl0sInNvdXJjZXNDb250ZW50IjpbInRpbnltY2UuUGx1Z2luTWFuYWdlci5hZGQoXCJzY3JpcHRmaWxlbWFuYWdlclwiLCBmdW5jdGlvbiAoZWRpdG9yKSB7XHJcbiAgICBmdW5jdGlvbiBPcGVuQ3JpcEZpbGVNYW5hZ2VyKGV2ZW50KSB7XHJcbiAgICAgICAgZWRpdG9yLmZvY3VzKHRydWUpO1xyXG5cclxuICAgICAgICBlZGl0b3Iud2luZG93TWFuYWdlci5vcGVuKHtcclxuICAgICAgICAgICAgdGl0bGU6ICdDcmlwIEZpbGVtYW5hZ2VyJyxcclxuICAgICAgICAgICAgZmlsZTogZWRpdG9yLnNldHRpbmdzLmV4dGVybmFsX2ZpbGVtYW5hZ2VyX3BhdGggKyAnP3RhcmdldD10aW55bWNlJyxcclxuICAgICAgICAgICAgd2lkdGg6IHdpZHRoKCksXHJcbiAgICAgICAgICAgIGhlaWdodDogaGVpZ2h0KClcclxuICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgIHNldFVybDogc2V0VXJsXHJcbiAgICAgICAgfSlcclxuICAgIH1cclxuXHJcbiAgICBlZGl0b3IuYWRkQnV0dG9uKFwic2NyaXB0ZmlsZW1hbmFnZXJcIiwge1xyXG4gICAgICAgIGljb246IGZhbHNlLFxyXG4gICAgICAgIHRleHQ6ICdNeSBidXR0b24nLFxyXG4gICAgICAgIHRvb2x0aXA6IFwiSW5zZXJ0IGZpbGVcIixcclxuICAgICAgICBzaG9ydGN1dDogXCJDdHJsK0VcIixcclxuICAgICAgICBvbmNsaWNrOiBPcGVuQ3JpcEZpbGVNYW5hZ2VyXHJcbiAgICB9KTtcclxuXHJcbiAgICBlZGl0b3IuYWRkU2hvcnRjdXQoXCJDdHJsK0VcIiwgXCJcIiwgT3BlbkNyaXBGaWxlTWFuYWdlcik7XHJcblxyXG4gICAgZWRpdG9yLmFkZE1lbnVJdGVtKFwic2NyaXB0ZmlsZW1hbmFnZXJcIiwge1xyXG4gICAgICAgIGljb246IFwiYnJvd3NlXCIsXHJcbiAgICAgICAgdGV4dDogXCJJbnNlcnQgZmlsZVwiLFxyXG4gICAgICAgIHNob3J0Y3V0OiBcIkN0cmwrRVwiLFxyXG4gICAgICAgIG9uY2xpY2s6IE9wZW5DcmlwRmlsZU1hbmFnZXIsXHJcbiAgICAgICAgY29udGV4dDogXCJpbnNlcnRcIlxyXG4gICAgfSk7XHJcblxyXG4gICAgZnVuY3Rpb24gc2V0VXJsKHNlbGVjdGVkX3VybCkge1xyXG4gICAgICAgIGVkaXRvci5pbnNlcnRDb250ZW50KGVkaXRvci5jb252ZXJ0VVJMKHNlbGVjdGVkX3VybCkpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGJvZHlFbGVtZW50KCkge1xyXG4gICAgICAgIHJldHVybiBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnYm9keScpWzBdO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHdpZHRoKCkge1xyXG4gICAgICAgIHJldHVybiAod2luZG93LmlubmVyV2lkdGggfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoIHx8IGJvZHlFbGVtZW50KCkuY2xpZW50V2lkdGgpIC0gOTA7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaGVpZ2h0KCkge1xyXG4gICAgICAgIHJldHVybiAod2luZG93LmlubmVySGVpZ2h0IHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHQgfHwgYm9keUVsZW1lbnQoKS5jbGllbnRIZWlnaHQpIC0gOTA7XHJcbiAgICB9XHJcbn0pOyJdLCJmaWxlIjoidGlueW1jZS9wbHVnaW5zL3NjcmlwdGZpbGVtYW5hZ2VyL3BsdWdpbi5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
