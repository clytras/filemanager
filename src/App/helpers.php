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
        return sprintf('%s/images/%s.png', config('cripfilemanager.public_href'), $name);
    }
}