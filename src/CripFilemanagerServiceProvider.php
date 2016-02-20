<?php namespace Crip\Filemanager;

use Crip\Core\Support\CripServiceProvider;
use Crip\Core\Support\PackageBase;
use Illuminate\Foundation\AliasLoader;
use Crip\Filemanager\App\Contracts\IMime;
use Crip\Filemanager\App\Filemanager;
use Crip\Filemanager\App\Services\Mime;
use Mcamara\LaravelLocalization\Facades\LaravelLocalization;

/**
 * Class CripFilemanagerServiceProvider
 * @package Crip\Filemanager
 */
class CripFilemanagerServiceProvider extends CripServiceProvider
{
    /**
     * @var PackageBase
     */
    private static $package;

    /**
     * @return PackageBase
     */
    private static function package()
    {
        if (!self::$package) {
            self::$package = new PackageBase('cripfilemanager', __DIR__);
            self::$package->publish_database = false;
        }

        return self::$package;
    }

    /**
     * Bootstrap the application events.
     *
     * @return void
     */
    public function boot()
    {
        $this->cripBoot(self::package());
    }

    /**
     * Register the service provider.
     *
     * @return void
     */
    public function register()
    {
        $this->cripRegister(self::package());

        // bind IMime upload interface as Mime service
        $this->app->bind(IMime::class, Mime::class);

        $this->app[self::package()->name] = $this->app->share(function ($app) {
            return new Filemanager($app['app'], $this->app->make(IMime::class));
        });
    }

    function aliasLoader(AliasLoader $loader)
    {
        $loader->alias('FileManager', Filemanager::class);
        $loader->alias('LaravelLocalization', LaravelLocalization::class);
    }
}