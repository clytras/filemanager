<?php

if (!function_exists('icon')) {


    /**
     * Get Crip FileManager icon href
     *
     * @param $name
     * @return string
     */
    function icon($name)
    {
        return config('cripfilemanager.public_href') . sprintf('/images/%s.png', $name);
    }
}