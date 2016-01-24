<?php namespace Crip\Filemanager;

use Illuminate\Foundation\AliasLoader;
use Illuminate\Support\ServiceProvider;
use Crip\Filemanager\App\Contracts\IMime;
use Crip\Filemanager\App\Filemanager;
use Crip\Filemanager\App\Package;
use Crip\Filemanager\App\Services\Mime;
use Mcamara\LaravelLocalization\Facades\LaravelLocalization;

/**
 * Class CripFilemanagerServiceProvider
 * @package Crip\Filemanager
 */
class CripFilemanagerServiceProvider extends ServiceProvider
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
            require __DIR__ . '/App/Routes.php';
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
            return new Filemanager($app['app'], $this->app->make(IMime::class));
        });

        // merge package configuration file with the application's copy.
        $this->mergeConfigFrom(
            __DIR__ . '/config/' . Package::NAME . '.php', Package::NAME
        );

        // Shortcut so developers don't need to add an Alias in app/config/app.php
        $this->app->booting(function () {
            $loader = AliasLoader::getInstance();
            $loader->alias('FileManager', Filemanager::class);
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