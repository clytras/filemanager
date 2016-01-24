<?php namespace Tahq69\ScriptFileManager;

use Illuminate\Foundation\AliasLoader;
use Illuminate\Support\ServiceProvider;
use Tahq69\ScriptFileManager\Script\Contracts\IMime;
use Tahq69\ScriptFileManager\Script\Contracts\IUpload;
use Tahq69\ScriptFileManager\Script\FileManager;
use Tahq69\ScriptFileManager\Script\Package;
use Tahq69\ScriptFileManager\Script\Services\Mime;
use Tahq69\ScriptFileManager\Script\Services\Upload;
use Mcamara\LaravelLocalization\Facades\LaravelLocalization;

/**
 * Class ScriptFileManagerServiceProvider
 * @package Tahq69\ScriptFileManager
 */
class ScriptFileManagerServiceProvider extends ServiceProvider
{
    /**
     * Indicates if loading of the provider is deferred.
     *
     * @var bool
     */
    protected $defer = false;

    /**
     * Bootstrap the application events.
     *
     * @return void
     */
    public function boot()
    {
        // init package translations
        $this->loadTranslationsFrom(__DIR__ . '/resources/lang', Package::NAME);
        // init package views
        $this->loadViewsFrom(__DIR__ . '/resources/views', Package::NAME);

        // init router (should be initialised after loadViewsFrom if is using views)
        if (!$this->app->routesAreCached()) {
            require __DIR__ . '/Script/Routes.php';
        }

        // This will allow users of your package to easily override your default configuration options after publishing
        // php artisan vendor:publish --provider="Tahq69\ScriptFileManager\ScriptFileManagerServiceProvider"
        $this->publishes([
            __DIR__ . '/public' => Package::public_path(),
            __DIR__ . '/resources/views' => base_path('resources/views/vendor/' . Package::NAME),
        ]);

        // php artisan vendor:publish --provider="Tahq69\ScriptFileManager\ScriptFileManagerServiceProvider" --tag=config
        $this->publishes([
            __DIR__ . '/config/' . Package::NAME . '.php' => config_path(Package::NAME . '.php'),
        ], 'config');
    }

    /**
     * Register the service provider.
     *
     * @return void
     */
    public function register()
    {
        // bind IMime upload interface as Mime service
        $this->app->bind(IMime::class, Mime::class);

        $this->app[Package::NAME] = $this->app->share(function ($app) {
            return new FileManager($app['app'], $this->app->make(IMime::class));
        });

        // merge package configuration file with the application's copy.
        $this->mergeConfigFrom(
            __DIR__ . '/config/' . Package::NAME . '.php', Package::NAME
        );

        // Shortcut so developers don't need to add an Alias in app/config/app.php
        $this->app->booting(function () {
            $loader = AliasLoader::getInstance();
            $loader->alias('FileManager', FileManager::class);
            $loader->alias('LaravelLocalization', LaravelLocalization::class);
        });

    }

    /**
     * Get the services provided by the provider.
     *
     * @return array
     */
    public function provides()
    {
        return array(Package::NAME);
    }
}