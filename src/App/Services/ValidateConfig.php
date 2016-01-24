<?php namespace Crip\Filemanager\App\Services;

use Crip\Filemanager\App\Package;

/**
 * Class ValidateConfig
 * @package Crip\Filemanager\App\Services
 */
class ValidateConfig
{
    public static $errors = [];

    public static function isValid()
    {
        $config = Package::config('base_url');
        if (preg_match('/[^\w.-]/', $config)) {
            static::$errors[] = Package::trans('validation_error_url');
        }

        $config = Package::config('target_dir');

        $config = Package::config('thumbs_dir');
        if (strpos($config, '/') !== false) {
            static::$errors[] = Package::trans('validation_error_dir');
        }

        $config = Package::config('thumbs');
        if (!is_array($config)) {
            static::$errors[] = Package::trans('validation_error_thumbs');
        } else {
            foreach ($config as $size => $values) {
                if (!$size) {
                    static::$errors[] = Package::trans('validation_error_thumbs_key');
                }

                if (count($values) !== 3) {
                    static::$errors[] = Package::trans('validation_error_thumbs_configs');
                } else {
                    if ($values[0] < 1 || $values[1] < 1) {
                        static::$errors[] = Package::trans('validation_error_thumbs_sizes');
                    }

                    if (!in_array($values[2], ['resize', 'width', 'height'])) {
                        static::$errors[] = Package::trans('validation_error_thumbs_crop');
                    }
                }
            }
        }

        return count(static::$errors) === 0;
    }
}