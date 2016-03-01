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
     * @var bool
     */
    private $is_changed = false;

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

    /**
     * Sets path for icons
     *
     * @param $path
     *
     * @return $this
     */
    public function setPath($path)
    {
        $this->path = $path;

        return $this;
    }

    /**
     * @param Mime $file_mime_type
     *
     * @return string
     */
    public function get(Mime $file_mime_type)
    {
        $this->change();

        switch ($file_mime_type->fileType()) {
            case 'dir':
                return $this->result('dir');
            case 'image':
                return $this->result('img');
        }

        if ($file_mime_type->isVideo()) {
            return $this->result('video');
        }

        if ($file_mime_type->isAudio()) {
            return $this->result('audio');
        }

        switch ($file_mime_type->__toString()) {
            case 'application/javascript':
            case 'application/json':
            case 'application/x-javascript':
            case 'text/javascript':
            case 'text/x-jquery-tmpl':
                return $this->result('js');

            case 'application/x-gzip':
            case 'application/x-rar-compressed':
            case 'application/zip':
                return $this->result('zip');

            case 'text/css':
                return $this->result('css');

            case 'text/plain':
                return $this->result('txt');

            case 'application/xhtml+xml':
            case 'text/html':
                return $this->result('html');

            case 'application/msword':
            case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                return $this->result('word');

            case 'application/vnd.ms-excel':
            case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
                return $this->result('excel');

            case 'application/vnd.ms-powerpoint':
            case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
                return $this->result('pwp');

            default:
                return $this->result('any');
        }
    }

    /**
     * @param $key
     * @return string
     */
    private function result($key)
    {
        return $this->path . $this->icon_names[$key];
    }

    /**
     * Update icon names from config, if they are not yet updated
     * Set path from config if it is empty
     */
    private function change()
    {
        if (!$this->is_changed) {
            $this->icon_names = array_merge($this->icon_names, FileManager::package()->config('icons.files', []));
            $this->is_changed = true;
        }

        if (is_null($this->path)) {
            $this->setPath(FileManager::package()->config('icons.path', ''));
        }
    }
}