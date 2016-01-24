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