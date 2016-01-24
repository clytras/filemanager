<?php
/**
 * Created by PhpStorm.
 * User: IGO-PC
 * Date: 9/29/2015
 * Time: 7:16 AM
 */

namespace Tahq69\ScriptFileManager\Script;

/**
 * Class Package
 * @package Tahq69\ScriptFileManager\Script
 */
class Package
{
    const NAME = 'cripfilemanager';
    const PUBLIC_PATH = 'cripfilemanager';
    const TRANS = 'cripfilemanager::app.';
    const VIEW = 'cripfilemanager::';
    const URL_REGEXP = '[a-zA-Z0-9.\-\/\(\)\_ ]+';

    /**
     * @return string
     */
    public static function public_path()
    {
        return public_path(self::public_url());
    }

    /**
     * Relative url to public package folder
     *
     * @return string
     */
    public static function public_url()
    {
        return '/vendor/tahq69/' . self::NAME . '/';
    }

    /**
     * Translate the given package message.
     *
     * @param  string $id
     * @param  array $parameters
     * @param  string $domain
     * @param  string $locale
     * @return string
     */
    public static function trans($id, $parameters = [], $domain = 'messages', $locale = null)
    {
        return trans(self::NAME . '::app.' . $id, $parameters, $domain, $locale);
    }

    /**
     * Get the evaluated view contents for the given package view.
     *
     * @param  string $view
     * @param  array $data
     * @param  array $mergeData
     * @return \Illuminate\View\View
     */
    public static function view($view = null, $data = [], $mergeData = [])
    {
        if ($view) {
            $view = self::incView($view);
        }

        return view($view, $data, $mergeData);
    }

    /**
     * Get path for package view include
     *
     * @param $view
     * @return string
     */
    public static function incView($view) {
        return self::NAME . '::' . $view;
    }

    /**
     * Get / set the specified configuration value.
     *
     * If an array is passed as the key, we will assume you want to set an array of values.
     *
     * @param  array|string $key
     * @param  mixed $default
     * @return mixed
     */
    public static function config($key, $default = null)
    {
        $key = self::NAME . '.' . $key;

        return config($key, $default);
    }
}