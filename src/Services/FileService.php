<?php namespace Crip\FileManager\Services;

use Crip\Core\Helpers\FileSystem;
use Crip\Core\Helpers\Str;
use Crip\FileManager\Data\Mime;
use Symfony\Component\HttpFoundation\File\UploadedFile;

/**
 * Class FileService
 * @package Crip\FileManager\Services
 */
class FileService
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
     * @param Mime $mime
     */
    public function __construct(Mime $mime)
    {
        $this->mime = $mime;
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

        return $this;
    }

    /**
     * @param string $file_name
     * @param string $path_to_file_dir
     * @param string $type
     *
     * @return FileService
     */
    public function setFromName($file_name, $path_to_file_dir = '', $type = null)
    {
        $name = basename($file_name);
        $this->is_file = str_contains($name, '.');
        $this->setName(pathinfo($name, PATHINFO_FILENAME));
        $this->extension = pathinfo($name, PATHINFO_EXTENSION);

        if ($this->is_file && $type !== 'dir') {
            $dir = $path_to_file_dir;
            if($this->path_manager && !$dir) {
                $dir = $this->path_manager->fullPath();
            }
            $full_path = FileSystem::join([$dir, $name]);
            if ($dir && FileSystem::exists($full_path)) {
                $this->sys_path = $dir;
                $this->mime->setByPath($full_path);
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
     * @param PathManager $path
     *
     * @return FileService
     */
    public function setPath(PathManager $path)
    {
        $this->path_manager = $path;

        return $this;
    }

    /**
     * @return string
     */
    public function relativePath()
    {
        if($this->path_manager) {
            return $this->path_manager->relativePath();
        }

        return '';
    }
}