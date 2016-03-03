<?php namespace Crip\FileManager\Services;

use Crip\Core\Contracts\ICripObject;
use Crip\Core\Exceptions\BadConfigurationException;
use Crip\FileManager\Data\Mime;
use Crip\FileManager\FileManager;

/**
 * Class IconService
 * @package Crip\FileManager\Services
 */
class IconService implements ICripObject
{

    /**
     * @var string
     */
    private $path;

    /**
     * @var \Crip\Core\Support\PackageBase
     */
    private $pck;

    /**
     * @var array
     */
    private $icon_names = [
        'js' => 'js.png',
        'dir' => 'dir.png',
        'css' => 'css.png',
        'txt' => 'txt.png',
        'any' => 'file.png',
        'img' => 'image.png',
        'zip' => 'archive.png',
        'pwp' => 'powerpoint.png',
        'html' => 'html.png',
        'word' => 'word.png',
        'audio' => 'audio.png',
        'video' => 'video.png',
        'excel' => 'excel.png',
    ];

    public function __construct()
    {
        $this->pck = FileManager::package();
        $this->path = $this->pck->config('icons.path', '');

        $this->pck->mergeWithConfig($this->icon_names, 'icons.files');
    }

    /**
     * @param Mime $mime
     * @return string
     *
     * @throws BadConfigurationException
     */
    public function get(Mime $mime)
    {
        return $this->result($mime->service->getFileType());
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

        return $this->path . $this->icon_names[$key];
    }
}