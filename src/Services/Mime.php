<?php namespace Crip\FileManager\Services;

/**
 * Class Mime
 * @package Crip\FileManager\Services
 */
class Mime
{
    /**
     * @var string
     */
    protected $mime;

    /**
     * @var array
     */
    protected $document_mimes = [
        'text/javascript',
        'text/x-jquery-tmpl',
        'text/css',
        'text/plain',
        'text/html',
        'application/javascript',
        'application/json',
        'application/x-javascript',
        'application/xhtml+xml',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ];

    /**
     * @param string $mime
     */
    public function __construct($mime)
    {
        $this->setMime($mime);
    }

    /**
     * @return string
     */
    public function __toString()
    {
        return $this->mime;
    }

    /**
     * Get mime type name
     * dir, image, media, document or file
     *
     * @return string
     */
    public function fileType()
    {
        if (is_null($this->mime)) {
            return 'dir';
        }

        if ($this->isImage()) {
            return 'image';
        }

        if ($this->isMedia()) {
            return 'media';
        }

        if ($this->isDocument()) {
            return 'document';
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
        return substr($this->mime, 0, 5) == 'image';
    }

    /**
     * Is mime of media file
     *
     * @return bool
     */
    public function isMedia()
    {
        return $this->isAudio() || $this->isVideo();
    }

    /**
     * Is mime of audio file
     *
     * @return bool
     */
    public function isAudio()
    {
        return substr($this->mime, 0, 5) == 'audio';
    }

    /**
     * Is mime of video file
     *
     * @return bool
     */
    public function isVideo()
    {
        return substr($this->mime, 0, 5) == 'video';
    }

    /**
     * Is mime of document
     *
     * @return bool
     */
    public function isDocument()
    {
        return in_array($this->mime, $this->document_mimes);
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
}