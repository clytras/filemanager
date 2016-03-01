<?php namespace Crip\FileManager\App\Services;

use Illuminate\Foundation\Application;
use Crip\FileManager\App\Contracts\IMime;
use Crip\FileManager\App\Exceptions\FilemanagerException;
use Crip\FileManager\App\Package;

/**
 * Class Mime
 * @package Crip\Filemanager\App\Services
 */
class Mime implements IMime
{

    /**
     * @var string
     */
    public $default_icon_path = '';

    /**
     * Sets default icon path for icons
     *
     * @param $path
     */
    public function setIconPath($path)
    {
        $this->default_icon_path = $path;
    }

    /**
     * Determines is passed string image mime type
     *
     * @param string $mime
     * @return boolean
     */
    public function isImage($mime)
    {
        return substr($mime, 0, 5) == 'image';
    }

    /**
     * Depending on $mime returns icon path
     *
     * @param string $mime
     * @return string
     * @throws FilemanagerException
     */
    public function getIcon($mime = null)
    {
        // TODO: clear config path and check existence
        $icons = Package::config('icon_dir_url', $this->default_icon_path) . '/';
        if (is_null($mime)) {
            return $icons . 'dir.png';
        }

        if ($this->isImage($mime)) {
            return $icons . 'image.png';
        }

        switch ($mime) {
            case 'application/javascript':
            case 'application/json':
            case 'application/x-javascript':
            case 'text/javascript':
            case 'text/x-jquery-tmpl':
                return $icons . 'js.png';

            case 'text/php':
                throw new FilemanagerException('PHP file in uploads found!');

            case 'application/x-gzip':
            case 'application/x-rar-compressed':
            case 'application/zip':
                return $icons . 'archive.png';

            case 'text/css':
                return $icons . 'css.png';

            case 'text/plain':
                return $icons . 'txt.png';

            case 'application/xhtml+xml':
            case 'text/html':
                return $icons . 'html.png';

            case 'audio/basic':
            case 'audio/L24':
            case 'audio/mid':
            case 'audio/mp4':
            case 'audio/mpeg':
            case 'audio/ogg':
            case 'audio/vnd.rn-realaudio':
            case 'audio/vnd.wave':
            case 'audio/vorbis':
            case 'audio/webm':
            case 'audio/x-aiff':
            case 'audio/x-ms-wax':
            case 'audio/x-ms-wma':
                return $icons . 'audio.png';

            case 'video/mp4':
            case 'video/mpeg':
            case 'video/ogg':
            case 'video/quicktime':
            case 'video/webm':
            case 'video/x-flv':
            case 'video/x-ms-wmv':
                return $icons . 'video.png';

            case 'application/msword':
            case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                return $icons . 'word.png';

            case 'application/vnd.ms-excel':
            case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
                return $icons . 'excel.png';

            case 'application/vnd.ms-powerpoint':
            case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
                return $icons . 'powerpoint.png';

            default:
                return $icons . 'file.png';
        }
    }

    /**
     * Determines file type from $mime
     *
     * @param $mime
     * @return string
     */
    function filetype($mime)
    {
        if (is_null($mime)) {
            return 'dir';
        }

        if ($this->isImage($mime)) {
            return 'image';
        }

        switch ($mime) {
            case 'text/javascript':
            case 'text/x-jquery-tmpl':
            case 'text/css':
            case 'text/plain':
            case 'text/html':
            case 'application/javascript':
            case 'application/json':
            case 'application/x-javascript':
            case 'application/xhtml+xml':
            case 'application/msword':
            case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
            case 'application/vnd.ms-excel':
            case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
            case 'application/vnd.ms-powerpoint':
            case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
                return 'document';

            case 'audio/basic':
            case 'audio/L24':
            case 'audio/mid':
            case 'audio/mp4':
            case 'audio/mpeg':
            case 'audio/ogg':
            case 'audio/vnd.rn-realaudio':
            case 'audio/vnd.wave':
            case 'audio/vorbis':
            case 'audio/webm':
            case 'audio/x-aiff':
            case 'audio/x-ms-wax':
            case 'audio/x-ms-wma':
            case 'video/mp4':
            case 'video/mpeg':
            case 'video/ogg':
            case 'video/quicktime':
            case 'video/webm':
            case 'video/x-flv':
            case 'video/x-ms-wmv':
                return 'media';

            default:
                return 'file';
        }
    }

    function get($path)
    {
        return mime_content_type($path);
    }
}