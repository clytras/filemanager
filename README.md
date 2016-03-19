# Crip File Manager

This package is created to integrate filesystem managment tools i to your site. You can use it with TinyMCE editor or just stand alone popup for your input fields. Crip File Manager is based on AngularJs framework and is stand alone single page application for your file system control on server side.

## Installation

Require this package with composer:
``` cmd
composer require crip-laravel/filemanager 
```

After updating composer, add ServiceProvider to the providers array in `config/app.php`
``` php
'providers' = [
    ...
    Crip\FileManager\CripFileManagerServiceProvider::class,
    ...
],
```

Copy the package resources and views to your local folders with the publish command:
``` cmd
php artisan vendor:publish --provider="Crip\FileManager\CripFileManagerServiceProvider" 
```

As application is builded for AngularJs, and it is using same bindings as Blade engine in Laravel, you should change opening and closing tags for blade. To use default views from package, add this two rows in your application AppServiceProvider `app/Providers/AppServiceProvider.php`
``` php
Blade::setContentTags('{!', '!}');            // for variables and all things Blade
Blade::setEscapedContentTags('{!!', '!!}');   // for escaped data
```
Or add router group to hcange tags only for filemanager routes:
``` php
Route::group(['prefix' => 'filemanager'], function () {
    Blade::setContentTags('{!', '!}');
    Blade::setEscapedContentTags('{!!', '!!}');
});
``` 

Copy the package config to your local config with the publish command:
``` cmd
php artisan vendor:publish --provider="Tahq69\ScriptFileManager\ScriptFileManagerServiceProvider" --tag=config 
```

To successfuly upload files in single page application, exclude filemanager url from csrf token checkking:
``` php
class VerifyCsrfToken extends BaseVerifier
{
    /**
     * The URIs that should be excluded from CSRF verification.
     *
     * @var array
     */
    protected $except = [
        'filemanager/*', // By default in configuration base path is `filemanager/{type}/{action}`
    ];
}
```

## Configuration

`base_url` - root url path to filemanager in routes (filemanager);

`target_dir` - dir path, where store uploaded files (storage/uploads);

`thumbs_dir` - subdirectory name where store uploaded file thumbnails (thumbs);

`thumbs` - array of generated image sizes (thumb is there by default and is used for file manager displayed images). Allowed image crops:

- resize - crop image to fit width and height

- width - resize the image to a width and constrain aspect ratio (auto height)

- height - resize the image to a height and constrain aspect ratio (auto width)

`public_href` - href root path to the public resources, such as js and css (/vendor/crip/cripfilemanager)

`icons.path` - url to img directory, where is stored all icons for file manager (/vendor/crip/cripfilemanager/images/)

`icons.files` - mapping array between file mime type name and icon image ([type].png)

`mime.types` - mapping from file full mime type to type name (array)

`mime.media` - mapping metween mime type name and media type (array)

`actions` - controller actions to allocate file and directory actions

## Usage

### TinyMCE

Download and set up TinyMCE editor. Copy `plugins` folder from published resources `vendor\crip\cripfilemanager\js\tinymce` to installed TinyMCE editor root directory. Configure tinymce to enable cripfilemanager plugin in it:
``` javascript
tinymce.init({
    plugins: [
        "advlist autolink link image lists charmap print preview hr anchor pagebreak",
        "searchreplace wordcount visualblocks visualchars insertdatetime media nonbreaking",
        "table contextmenu directionality emoticons paste textcolor cripfilemanager"
    ],
    selector: "textarea",
    external_filemanager_path:"/filemanager/",
    external_plugins: { "filemanager" : "/vendor/crip/cripfilemanager/js/plugin.js"}
});
```

### Stand-alone filemanager
You can use iframe, FancyBox iframe or Lightbox iframe to open the FileManager with these paths:

Open filemanager: `/filemanager?target=callback`

Show only some type files: `/filemanager?target=callback&type=[type]`

Supported types:

- `document`

- `image`

- `media`

- `file` (show all)

To use file manager returned file url, window object should contain `window.filemanager.onSelected` callback witch will be called on file select in file manager and passes selected file relative url and all url parameters passed to iframe.


## Sample

```html
<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
    <script src="/tinymce/tinymce.min.js"></script>
    <script type="text/javascript" src="http://code.jquery.com/jquery-latest.min.js"></script>
    <link rel="stylesheet" href="fancybox/jquery.fancybox.css" type="text/css" media="screen"/>
    <script type="text/javascript" src="fancybox/jquery.fancybox.pack.js"></script>
    <script>
        tinymce.init({
            plugins: [
                "advlist autolink link image lists charmap print preview hr anchor pagebreak",
                "searchreplace wordcount visualblocks visualchars insertdatetime media nonbreaking",
                "table contextmenu directionality emoticons paste textcolor scriptfilemanager"
            ],
            selector: "textarea",
            external_filemanager_path: "/filemanager/",
            external_plugins: {"filemanager": "/vendor/tahq69/scriptfilemanager/js/plugin.js"}
        });
    </script>
    <script>
        tinymce.init({selector: 'textarea'});

        window.filemanager = {
            // will recive params.flag and params.one parameter as they are presented in href below
            onSelected: function (file_url, params) {
                console.log(file_url, params);
                if (params.flag == 'link' && params.one == 1) {
                    $('#input-id').val(file_url);
                    $.fancybox.close();
                }
            }
        };

        $(document).ready(function () {
            $(".fancybox").fancybox({
                maxWidth: 800,
                maxHeight: 600,
                fitToView: false,
                width: '70%',
                height: '70%',
                autoSize: false,
                closeClick: false,
                type: 'iframe',
                openEffect: 'none',
                closeEffect: 'none'
            });
        });
    </script>
</head>
<body>
<input type="text" id="input-id">
<a class="fancybox" href="/filemanager?target=callback&flag=link&one=1">link</a>
<textarea>Easy (and free!)</textarea>
</body>
</html>
```
