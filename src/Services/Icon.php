<?php namespace Crip\FileManager\Services;

use Crip\FileManager\FileManager;

/**
 * Class Icon
 * @package Crip\FileManager\Services
 */
class Icon
{
    /**
     * @var string
     */
    public $path;

    /**
     * @var array
     */
    protected $icon_names = [
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
        $this->icon_names = array_merge($this->icon_names, FileManager::package()->config('icons.files', []));
        $this->path = FileManager::package()->config('icons.path', '');
    }

    /**
     * @param Mime $file_mime_type
     *
     * @return string
     */
    public function get(Mime $file_mime_type)
    {
        return $this->result($file_mime_type->fileType());
    }

    /**
     * @param $key
     * @return string
     */
    private function result($key)
    {
        return $this->path . $this->icon_names[$key];
    }
}