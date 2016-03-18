<?php namespace Crip\FileManager\Services;

use Crip\Core\Contracts\ICripObject;
use Crip\Core\Helpers\FileSystem;
use Crip\FileManager\FileManager;

/**
 * Class MimeService
 * @package Crip\FileManager\Services
 */
class MimeService implements ICripObject
{
    /**
     * @var string
     */
    private $mime;

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

    public function __construct()
    {
        $pck = FileManager::package();
        $pck->mergeWithConfig($this->mimes, 'mime.types');
        $pck->mergeWithConfig($this->media_mapping, 'mime.media');
    }

    /**
     * @param $mime
     *
     * @return $this
     */
    public function setMime($mime)
    {
        $this->mime = $mime;

        return $this;
    }

    /**
     * @param string $path
     *
     * @return MimeService
     *
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
     * Get file type from mime (if empty mime - 'dir', if not found - 'file')
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
    public function getMediaType()
    {
        $file_type = $this->getFileType();
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

}