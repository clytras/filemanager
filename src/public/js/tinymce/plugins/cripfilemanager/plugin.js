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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJ0aW55bWNlL3BsdWdpbnMvY3JpcGZpbGVtYW5hZ2VyL3BsdWdpbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJ0aW55bWNlLlBsdWdpbk1hbmFnZXIucmVxdWlyZUxhbmdQYWNrKFwiY3JpcGZpbGVtYW5hZ2VyXCIsIFwiZW5fR0IsbHYscnVcIik7XHJcbnRpbnltY2UuUGx1Z2luTWFuYWdlci5hZGQoXCJjcmlwZmlsZW1hbmFnZXJcIiwgZnVuY3Rpb24gKGVkaXRvcikge1xyXG4gICAgZnVuY3Rpb24gT3BlbkNyaXBGaWxlbWFuYWdlcihldmVudCkge1xyXG4gICAgICAgIGVkaXRvci5mb2N1cyh0cnVlKTtcclxuXHJcbiAgICAgICAgZWRpdG9yLndpbmRvd01hbmFnZXIub3Blbih7XHJcbiAgICAgICAgICAgIHRpdGxlOiBcIkNyaXAgRmlsZW1hbmFnZXJcIixcclxuICAgICAgICAgICAgZmlsZTogZWRpdG9yLnNldHRpbmdzLmV4dGVybmFsX2ZpbGVtYW5hZ2VyX3BhdGggKyAnP3RhcmdldD10aW55bWNlJyxcclxuICAgICAgICAgICAgd2lkdGg6IHdpZHRoKCksXHJcbiAgICAgICAgICAgIGhlaWdodDogaGVpZ2h0KClcclxuICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgIHNldFVybDogc2V0VXJsXHJcbiAgICAgICAgfSlcclxuICAgIH1cclxuXHJcbiAgICBlZGl0b3IuYWRkQnV0dG9uKFwiY3JpcGZpbGVtYW5hZ2VyXCIsIHtcclxuICAgICAgICBpY29uOiBcImJyb3dzZVwiLFxyXG4gICAgICAgIHRvb2x0aXA6IFwiSW5zZXJ0IGZpbGVcIixcclxuICAgICAgICBzaG9ydGN1dDogXCJDdHJsK0VcIixcclxuICAgICAgICBvbmNsaWNrOiBPcGVuQ3JpcEZpbGVtYW5hZ2VyXHJcbiAgICB9KTtcclxuXHJcbiAgICBlZGl0b3IuYWRkU2hvcnRjdXQoXCJDdHJsK0VcIiwgXCJcIiwgT3BlbkNyaXBGaWxlbWFuYWdlcik7XHJcblxyXG4gICAgZWRpdG9yLmFkZE1lbnVJdGVtKFwiY3JpcGZpbGVtYW5hZ2VyXCIsIHtcclxuICAgICAgICBpY29uOiBcImJyb3dzZVwiLFxyXG4gICAgICAgIHRleHQ6IFwiSW5zZXJ0IGZpbGVcIixcclxuICAgICAgICBzaG9ydGN1dDogXCJDdHJsK0VcIixcclxuICAgICAgICBvbmNsaWNrOiBPcGVuQ3JpcEZpbGVtYW5hZ2VyLFxyXG4gICAgICAgIGNvbnRleHQ6IFwiaW5zZXJ0XCJcclxuICAgIH0pO1xyXG5cclxuICAgIGZ1bmN0aW9uIHNldFVybChzZWxlY3RlZF91cmwpIHtcclxuICAgICAgICBlZGl0b3IuaW5zZXJ0Q29udGVudChlZGl0b3IuY29udmVydFVSTChzZWxlY3RlZF91cmwpKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBib2R5RWxlbWVudCgpIHtcclxuICAgICAgICByZXR1cm4gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2JvZHknKVswXTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiB3aWR0aCgpIHtcclxuICAgICAgICByZXR1cm4gKHdpbmRvdy5pbm5lcldpZHRoIHx8XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aCB8fFxyXG4gICAgICAgICAgICBib2R5RWxlbWVudCgpLmNsaWVudFdpZHRoKSAtIDkwO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGhlaWdodCgpIHtcclxuICAgICAgICByZXR1cm4gKHdpbmRvdy5pbm5lckhlaWdodCB8fFxyXG4gICAgICAgICAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0IHx8XHJcbiAgICAgICAgICAgIGJvZHlFbGVtZW50KCkuY2xpZW50SGVpZ2h0KSAtIDkwO1xyXG4gICAgfVxyXG59KTsiXSwiZmlsZSI6InRpbnltY2UvcGx1Z2lucy9jcmlwZmlsZW1hbmFnZXIvcGx1Z2luLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
