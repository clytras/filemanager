tinymce.PluginManager.add("filemanager", function (editor) {
    function CripFileBrowser(field_name, url, type, win) {
        var get_params = "?target=tinymce&type=" + type;

        editor.windowManager.open({
            file: editor.settings.external_filemanager_path + get_params,
            title: "Crip Filemanager",
            width: width(),
            height: height()
        }, {
            setUrl: setUrl
        });

        function setUrl(selected_url) {
            var input = win.document.getElementById(field_name);
            if (input.value = editor.convertURL(selected_url), "createEvent" in document) {
                var event = document.createEvent("HTMLEvents");
                event.initEvent("change", !1, !0);
                input.dispatchEvent(event)
            }
            else
                input.fireEvent("onchange")
        }
    }

    function bodyElement() {
        return document.getElementsByTagName('body')[0]
    }

    function width() {
        return (window.innerWidth ||
            document.documentElement.clientWidth ||
            bodyElement().clientWidth) - 90
    }

    function height() {
        return (window.innerHeight ||
            document.documentElement.clientHeight ||
            bodyElement().clientHeight) - 90
    }

    return tinymce.activeEditor.settings.file_browser_callback = CripFileBrowser
});