<!DOCTYPE html>
<html lang="{!! App::getLocale() !!}" ng-app="app">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>{!! FileManager::trans('title') !!}</title>
    <link href="{!! FileManager::assets('css/app.css') !!}" rel="stylesheet">
</head>
<body>
<div>
    <div class="container-fluid">
        <div class="row">
            <div class="col-md-12">
                @foreach($errors as $error)
                    <div class="alert alert-danger" role="alert">{!! $error !!}</div>
                @endforeach
            </div>
        </div>
    </div>
</div>

</body>
</html>