<?php namespace Crip\FileManager\Services;

use Crip\Core\Contracts\ICripObject;
use Crip\Core\Helpers\FileSystem;
use Crip\FileManager\FileManager;

/**
 * Class Mime
 * @package Crip\FileManager\Services
 */
class Mime implements ICripObject
{

    /**
     * @var string
     */
    private $mime = '';

    /**
     * @var array
     */
    private $mimes = [
        'js' => [
            "/^application\/javascript/",
            "/^application\/json/",
            "/^application\/x\-javascript/",
            "/^text\/javascript/",
        ],
        'css' => [
            "/^text\/css/",
        ],
        'txt' => [
            "/^text\/plain/"
        ],
        'zip' => [
            "/^application\/x\-gzip/",
            "/^application\/x\-rar\-compressed/",
            "/^application\/x\-7z\-compressed/",
            "/^application\/zip/",
        ],
        'pwp' => [
            "/^application\/vnd\.ms\-powerpoint/",
            "/^application\/vnd\.openxmlformats\-officedocument\.presentationml*/"
        ],
        'html' => [
            "/^application\/xhtml\+xml/",
            "/^text\/html/"
        ],
        'word' => [
            "/^application\/msword/",
            "/^application\/vnd\.openxmlformats\-officedocument\.wordprocessingml*/"
        ],
        'excel' => [
            "/^application\/vnd.ms-excel/",
            "/^application\/vnd\.openxmlformats\-officedocument\.spreadsheetml*/"
        ],
        'audio' => [
            "/^audio\/*/"
        ],
        'video' => [
            "/^video\/*/"
        ],
        'img' => [
            "/^image\/*/"
        ]
    ];

    /**
     * Not included file types will be a 'file' media type
     *
     * @var array
     */
    private $media_mapping = [
        'dir' => ['dir'],
        'image' => ['img'],
        'media' => ['audio', 'video'],
        'document' => ['excel', 'word', 'pwp', 'html', 'txt', 'js']
    ];

    /**
     * Initialise new instance of Mime service
     */
    public function __construct()
    {
        $pck = FileManager::package();
        $pck->mergeWithConfig($this->mimes, 'mime.types');
        $pck->mergeWithConfig($this->media_mapping, 'mime.media');
    }

    /**
     * Set mime type
     *
     * @param $mime
     * @return $this
     */
    public function setMime($mime)
    {
        $this->mime = $mime;

        return $this;
    }

    /**
     * Set mime from file full path
     *
     * @param string $path
     * @return MimeService
     * @throws \Illuminate\Contracts\Filesystem\FileNotFoundException
     */
    public function setMimeByPath($path)
    {
        return $this->setMime(FileSystem::getMimeType($path));
    }

    /**
     * Get the file mime type
     *
     * @return string
     */
    public function getMimeType()
    {
        return $this->mime;
    }

    /**
     * Get file type from mime (if empty mime - 'dir', default - 'file')
     * dir, js, css, txt, img, zip, pwp, html, word, audio, video, excel or file
     *
     * @return string
     */
    public function getFileType()
    {
        if (!$this->mime || $this->mime === 'directory' || $this->mime === 'dir') {
            return 'dir';
        }

        foreach ($this->mimes as $mime => $mime_values) {
            $key = collect($mime_values)->search(function ($mime_value) {
                return preg_match($mime_value, $this->mime);
            });

            if ($key) {
                return $key;
            }
        }

        return 'file';
    }

    /**
     * Get mime media type name
     * dir, image, media, document or file
     *
     * @return string
     */
    public function getMediaType()
    {
        $media = collect($this->media_mapping)->search(function ($map) {
            return in_array($this->getFileType(), $map);
        });

        return $media ?: 'file';
    }

    /**
     * Is mime of image
     *
     * @return bool
     */
    public function isImage()
    {
        return collect($this->mimes['img'])->search(function ($image_regex) {
            return preg_match($image_regex, $this->mime);
        }) !== false;
    }
}