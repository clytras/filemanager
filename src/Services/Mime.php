<?php namespace Crip\FileManager\Services;

use Crip\Core\Contracts\ICripObject;
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
    protected $mime;

    /**
     * @var array
     */
    protected $mimes = [
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
            "/^application\/vnd\.ms\-powerpoint",
            "/^application\/vnd\.openxmlformats\-officedocument\.presentationml*/"
        ],
        'html' => [
            "/^application\/xhtml\+xml/",
            "/^text\/html/"
        ],
        'word' => [
            "/^application\/msword",
            "/^application\/vnd\.openxmlformats\-officedocument\.wordprocessingml*/"
        ],
        'excel' => [
            "/^application\/vnd.ms-excel",
            "/^application\/vnd\.openxmlformats\-officedocument\.spreadsheetml*/"
        ],
        'audio' => [
            "/^audio\/*"
        ],
        'video' => [
            "/^video\/*"
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
    protected $media_mapping = [
        'dir' => ['dir'],
        'image' => ['img'],
        'media' => ['audio', 'video'],
        'document' => ['excel', 'word', 'pwp', 'html', 'txt', 'js']
    ];

    /**
     * @param string $path
     * @param string $mime
     */
    public function __construct($path, $mime = null)
    {
        if ($mime !== null) {
            $this->setMime($mime);
        } else {
            $this->setMime(mime_content_type($path));
        }

        $this->setFromConfig($this->mimes, 'mime.types');
        $this->setFromConfig($this->media_mapping, 'mime.media');
    }

    /**
     * @return string
     */
    public function __toString()
    {
        return $this->mime;
    }

    /**
     * Get file type from mime (if empty mime - 'dir', if not found - 'file')
     * dir, js, css, txt, img, zip, pwp, html, word, audio, video, excel or file
     *
     * @return string
     */
    public function fileType()
    {
        if (!$this->mime) {
            return 'dir';
        }

        foreach ($this->mimes as $mime => $mime_values) {
            foreach ($mime_values as $mime_value) {
                if (preg_match($mime_value, $this->mime)) {
                    return $mime;
                }
            }
        }

        return 'file';
    }

    /**
     * Get mime type name
     * dir, image, media, document or file
     *
     * @return string
     */
    public function mediaType()
    {
        $file_type = $this->fileType();
        foreach ($this->media_mapping as $media => $map) {
            if (in_array($file_type, $map)) {
                return $media;
            }
        }

        return 'file';
    }

    /**
     * Is mime of image
     *
     * @return bool
     */
    public function isImage()
    {
        foreach ($this->mimes['img'] as $img_reg) {
            if (preg_match($img_reg, $this->mime)) {
                return true;
            }
        }

        return false;
    }

    /**
     * @param $mime
     *
     * @return $this
     */
    protected function setMime($mime)
    {
        $this->mime = $mime;

        return $this;
    }

    /**
     * @param array $target
     * @param string $key
     */
    protected function setFromConfig(&$target, $key)
    {
        $target = array_merge_recursive($target, FileManager::package()->config($key, []));
    }
}