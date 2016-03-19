<?php namespace Crip\FileManager\Services;

use Crip\Core\Helpers\FileSystem;
use Crip\Core\Helpers\Str;
use Crip\FileManager\Contracts\IManagerPath;
use Crip\FileManager\Data\Icon;
use Crip\FileManager\Data\Mime;
use Symfony\Component\HttpFoundation\File\UploadedFile;

/**
 * Class FileService
 * @package Crip\FileManager\Services
 */
class FileService implements IManagerPath
{
    /**
     * @var string
     */
    private $name;
    /**
     * @var string
     */
    private $extension;
    /**
     * @var Mime
     */
    private $mime;
    /**
     * @var bool
     */
    private $is_file;
    /**
     * @var int
     */
    private $size;
    /**
     * @var string
     */
    private $sys_path;
    /**
     * @var PathManager
     */
    private $path_manager;
    /**
     * @var string
     */
    private $thumb;
    /**
     * @var Icon
     */
    private $icon;
    /**
     * @var UrlManager
     */
    private $url;
    /**
     * @var string
     */
    private $date;

    /**
     * @param Mime $mime
     * @param Icon $icon
     * @param UrlManager $url
     */
    public function __construct(Mime $mime, Icon $icon, UrlManager $url)
    {
        $this->mime = $mime;
        $this->icon = $icon;
        $this->url = $url;
    }

    /**
     * @param string $name
     */
    public function setName($name)
    {
        $this->name = Str::slug($name);
    }

    /**
     * @return string
     */
    public function getName()
    {
        return $this->name;
    }

    /**
     * @param UploadedFile $file
     * @return FileService
     */
    public function setFromUpload(UploadedFile $file)
    {
        $this->mime->set($file->getMimeType());
        $this->setName(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME));

        $this->is_file = true;
        $this->extension = $file->getClientOriginalExtension();
        $this->size = $file->getSize();
        $this->date = date('Y-m-d H:i:s');
        $this->setThumb();

        return $this;
    }

    /**
     * @param string $file_name
     * @param string $path_to_file_dir
     *
     * @return FileService
     */
    public function setFromName($file_name, $path_to_file_dir = '')
    {
        $name = basename($file_name);
        $this->is_file = str_contains($name, '.');
        $this->setName(pathinfo($name, PATHINFO_FILENAME));
        $this->extension = pathinfo($name, PATHINFO_EXTENSION);

        if ($this->is_file) {
            $dir = $path_to_file_dir;
            if ($this->path_manager && !$dir) {
                $dir = $this->path_manager->sysPath();
            }
            $full_path = FileSystem::canonical(FileSystem::join([$dir, $name]));
            if ($dir && FileSystem::exists($full_path)) {
                $this->sys_path = $dir;
                $this->mime->setByPath($full_path);
                $this->size = filesize($full_path);
                $this->date = date('Y-m-d H:i:s', filemtime($full_path));
                $this->setThumb();
            }
        }

        return $this;
    }

    /**
     * @return string
     */
    public function getExtension()
    {
        return $this->extension;
    }

    /**
     * @return Mime
     */
    public function getMime()
    {
        return $this->mime;
    }

    /**
     * @return int
     */
    public function getSize()
    {
        return $this->size;
    }

    /**
     * @return string
     */
    public function getFullName()
    {
        $ext = '';
        if ($this->extension !== null) {
            $ext = '.' . $this->extension;
        }

        return $this->name . $ext;
    }

    /**
     * @return string
     */
    public function relativePath()
    {
        if ($this->path_manager) {
            return $this->path_manager->getPath();
        }

        return '';
    }

    /**
     * @return string
     */
    public function getThumb()
    {
        return $this->thumb;
    }

    /**
     * Set thumb info for file
     */
    private function setThumb()
    {
        if ($this->mime->service->isImage()) {
            $this->thumb = $this->url->getFromName($this->getFullName());
        } else {
            $this->thumb = $this->icon->get($this->mime);
        }
    }

    /**
     * @return string
     */
    public function getDate()
    {
        return $this->date;
    }

    /**
     * Set path manager
     *
     * @param PathManager $manager
     * @return $this
     */
    public function setPathManager(PathManager $manager)
    {
        $this->path_manager = $manager;
        $this->url->setPathManager($manager);

        return $this;
    }

    /**
     * Get current path manager
     *
     * @return PathManager
     */
    public function getPathManager()
    {
        return $this->path_manager;
    }
}