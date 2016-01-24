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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJwbHVnaW4uanMiXSwic291cmNlc0NvbnRlbnQiOlsidGlueW1jZS5QbHVnaW5NYW5hZ2VyLmFkZChcImZpbGVtYW5hZ2VyXCIsIGZ1bmN0aW9uIChlZGl0b3IpIHtcclxuICAgIGZ1bmN0aW9uIENyaXBGaWxlQnJvd3NlcihmaWVsZF9uYW1lLCB1cmwsIHR5cGUsIHdpbikge1xyXG4gICAgICAgIHZhciBnZXRfcGFyYW1zID0gXCI/dGFyZ2V0PXRpbnltY2UmdHlwZT1cIiArIHR5cGU7XHJcblxyXG4gICAgICAgIGVkaXRvci53aW5kb3dNYW5hZ2VyLm9wZW4oe1xyXG4gICAgICAgICAgICBmaWxlOiBlZGl0b3Iuc2V0dGluZ3MuZXh0ZXJuYWxfZmlsZW1hbmFnZXJfcGF0aCArIGdldF9wYXJhbXMsXHJcbiAgICAgICAgICAgIHRpdGxlOiBcIkNyaXAgRmlsZW1hbmFnZXJcIixcclxuICAgICAgICAgICAgd2lkdGg6IHdpZHRoKCksXHJcbiAgICAgICAgICAgIGhlaWdodDogaGVpZ2h0KClcclxuICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgIHNldFVybDogc2V0VXJsXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNldFVybChzZWxlY3RlZF91cmwpIHtcclxuICAgICAgICAgICAgdmFyIGlucHV0ID0gd2luLmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGZpZWxkX25hbWUpO1xyXG4gICAgICAgICAgICBpZiAoaW5wdXQudmFsdWUgPSBlZGl0b3IuY29udmVydFVSTChzZWxlY3RlZF91cmwpLCBcImNyZWF0ZUV2ZW50XCIgaW4gZG9jdW1lbnQpIHtcclxuICAgICAgICAgICAgICAgIHZhciBldmVudCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KFwiSFRNTEV2ZW50c1wiKTtcclxuICAgICAgICAgICAgICAgIGV2ZW50LmluaXRFdmVudChcImNoYW5nZVwiLCAhMSwgITApO1xyXG4gICAgICAgICAgICAgICAgaW5wdXQuZGlzcGF0Y2hFdmVudChldmVudClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICBpbnB1dC5maXJlRXZlbnQoXCJvbmNoYW5nZVwiKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBib2R5RWxlbWVudCgpIHtcclxuICAgICAgICByZXR1cm4gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2JvZHknKVswXVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHdpZHRoKCkge1xyXG4gICAgICAgIHJldHVybiAod2luZG93LmlubmVyV2lkdGggfHxcclxuICAgICAgICAgICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoIHx8XHJcbiAgICAgICAgICAgIGJvZHlFbGVtZW50KCkuY2xpZW50V2lkdGgpIC0gOTBcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBoZWlnaHQoKSB7XHJcbiAgICAgICAgcmV0dXJuICh3aW5kb3cuaW5uZXJIZWlnaHQgfHxcclxuICAgICAgICAgICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodCB8fFxyXG4gICAgICAgICAgICBib2R5RWxlbWVudCgpLmNsaWVudEhlaWdodCkgLSA5MFxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0aW55bWNlLmFjdGl2ZUVkaXRvci5zZXR0aW5ncy5maWxlX2Jyb3dzZXJfY2FsbGJhY2sgPSBDcmlwRmlsZUJyb3dzZXJcclxufSk7Il0sImZpbGUiOiJwbHVnaW4uanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
