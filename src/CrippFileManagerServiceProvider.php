<?php namespace Crip\FileManager;

use Crip\Core\Support\CripServiceProvider;
use Crip\Core\Support\PackageBase;
use Illuminate\Foundation\AliasLoader;
use Crip\FileManager\App\Contracts\IMime;
use Crip\FileManager\App\Filemanager;
use Crip\FileManager\App\Services\Mime;
use Mcamara\LaravelLocalization\Facades\LaravelLocalization;

/**
 * Class CripFileManagerServiceProvider
 * @package Crip\Filemanager
 */
class CripFileManagerServiceProvider extends CripServiceProvider
{
    /**
     * @var PackageBase
     */
    private static $package;

    /**
     * php artisan vendor:publish --provider="Crip\FileManager\CripFileManagerServiceProvider"
     *
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
        require_once __DIR__ . '/App/helpers.php';
    }

    /**
     * Register the service provider.
     *
     * @return void
     */
    public function register()
    {
        $this->cripRegister(self::package());
    }

    /**
     * @param AliasLoader $loader
     */
    function aliasLoader(AliasLoader $loader)
    {
    }
}