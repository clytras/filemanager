<?php namespace Crip\FileManager\Services;

use Crip\Core\Contracts\ICripObject;
use Crip\Core\Exceptions\BadConfigurationException;
use Crip\FileManager\FileManager;

/**
 * Class Icon
 * @package Crip\FileManager\Services
 */
class Icon implements ICripObject
{

    /**
     * @var string
     */
    private $url = '';

    /**
     * @var array
     */
    private $icon_names = [
        'js' => 'js.png',
        'dir' => 'dir.png',
        'css' => 'css.png',
        'txt' => 'txt.png',
        'img' => 'image.png',
        'zip' => 'archive.png',
        'pwp' => 'powerpoint.png',
        'file' => 'file.png',
        'html' => 'html.png',
        'word' => 'word.png',
        'audio' => 'audio.png',
        'video' => 'video.png',
        'excel' => 'excel.png',
    ];

    /**
     * Initialise new instance of Icon service
     */
    public function __construct()
    {
        $pck = FileManager::package();
        $this->url = $pck->config('icons.url', '');
        $pck->mergeWithConfig($this->icon_names, 'icons.files', [], false);
    }

    /**
     * @param Mime $mime
     * @return string
     *
     * @throws BadConfigurationException
     */
    public function get(Mime $mime)
    {
        return $this->result($mime->getFileType());
    }

    /**
     * @param string $key
     * @return string
     *
     * @throws BadConfigurationException
     */
    private function result($key)
    {
        if (!isset($this->icon_names[$key])) {
            $message = sprintf('Configuration file is missing for `%s` file type in `icons.files` array', $key);
            throw new BadConfigurationException($this, $message);
        }

        return $this->url . $this->icon_names[$key];
    }
}