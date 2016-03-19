<?php namespace Crip\FileManager\Services;

use Crip\Core\Contracts\ICripObject;
use Crip\Core\Helpers\FileSystem;
use Crip\Core\Helpers\Str;
use Crip\FileManager\Contracts\IUsePathService;
use Crip\FileManager\Exceptions\FileManagerException;
use Crip\FileManager\Traits\UsePath;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use File as LaravelFile;

/**
 * Class File
 * @package Crip\FileManager\Services
 */
class File implements ICripObject, IUsePathService
{
    use UsePath;

    /**
     * @var Mime
     */
    private $mime;

    /**
     * @var Icon
     */
    private $icon;

    /**
     * @var Url
     */
    private $url;

    /**
     * @var \Crip\FileManager\Data\File
     */
    private $file;

    /**
     * @var Thumb
     */
    private $thumb;

    /**
     * Initialize new instance of File service
     *
     * @param Mime $mime
     * @param Icon $icon
     * @param Url $url
     * @param Thumb $thumb
     */
    public function __construct(Mime $mime, Icon $icon, Url $url, Thumb $thumb)
    {
        $this->mime = $mime;
        $this->icon = $icon;
        $this->url = $url;
        $this->thumb = $thumb;
        $this->file = app(\Crip\FileManager\Data\File::class);
    }

    /**
     * Set new name for file
     *
     * @param string $name
     * @return $this
     */
    public function setName($name)
    {
        $this->file->name = Str::slug($name);
        $this->file->full_name = $this->fullName();
        if ($this->getPath()) {
            $this->updateUrl();
        }

        return $this;
    }

    /**
     * Set mime type for current file
     *
     * @param string $mime Mime type or file full path
     * @param bool $isPath
     * @return $this
     */
    public function setMime($mime, $isPath = false)
    {
        if ($isPath) {
            $this->mime->setMimeByPath($mime);
        } else {
            $this->mime->setMime($mime);
        }

        $this->file->mime = $this->mime->getFileType();
        $this->file->type = $this->mime->getMediaType();
        $this->file->mimetype = $this->mime->getMimeType();

        return $this;
    }

    /**
     * Get current file name (without extension at the end)
     *
     * @return string
     */
    public function name()
    {
        return $this->file->name;
    }

    /**
     * Get file full name
     *
     * @return string
     */
    public function fullName()
    {
        if ($this->file->extension) {
            return $this->name() . '.' . $this->file->extension;
        }

        return $this->name();
    }

    /**
     * Set file info from uploading file
     *
     * @param UploadedFile $file
     * @return $this
     */
    public function uploading(UploadedFile $file)
    {
        $this->setMime($file->getMimeType());
        $this->file->extension = $file->getClientOriginalExtension();
        $this->setName(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME));
        $this->file->bytes = $file->getSize();
        $this->file->updated_at = date('Y-m-d H:i:s');
        $this->setFileThumb(true);

        return $this;
    }

    /**
     * Set file info from existing file in file system
     *
     * @param string $name
     * @return $this
     * @throws FileManagerException
     * @throws \Crip\Core\Exceptions\BaseCripException
     */
    public function existing($name)
    {
        $this->file->extension = pathinfo($name, PATHINFO_EXTENSION);
        $this->setName(pathinfo(basename($name), PATHINFO_FILENAME));
        $file = $this->fullPath();
        if (!FileSystem::exists($file)) {
            throw new FileManagerException($this, 'err_file_info_read');
        }

        $this->setMime($file, true);
        $this->setFileThumb();
        $this->file->bytes = filesize($file);
        $this->file->updated_at = date('Y-m-d H:i:s', filemtime($file));

        return $this;
    }

    /**
     * Get file content
     *
     * @param string|null $size
     * @return string
     * @throws FileManagerException
     */
    public function content($size = null)
    {
        $file_path = $this->fullPath();
        if ($size AND array_key_exists($size, $this->thumb->getSizes())) {
            $thumb_path = $this->getPath()->thumbPath($size, $this);
            if (FileSystem::exists($thumb_path)) {
                $file_path = $thumb_path;
            }
        }

        if (FileSystem::exists($file_path)) {
            return LaravelFile::get($file_path);
        }

        throw new FileManagerException($this, 'err_file_not_found');
    }

    /**
     * Get file details object
     *
     * @return \Crip\FileManager\Data\File
     */
    public function details()
    {
        return $this->file;
    }

    /**
     * Is current file an image
     *
     * @return bool
     */
    public function isImage()
    {
        return $this->mime->isImage();
    }

    /**
     * Get file mime type
     *
     * @return string
     */
    public function mimetype()
    {
        return $this->file->mimetype;
    }

    /**
     * Get current file full path
     * @return string
     * @throws FileManagerException
     */
    public function fullPath()
    {
        return $this->getPath()->path($this);
    }

    /**
     * Get file dir path
     *
     * @return string
     * @throws FileManagerException
     */
    public function dirPath()
    {
        return $this->getPath()->path();
    }

    /**
     * Set current file thumb property
     *
     * @param bool $uploading
     * @return $this
     * @throws FileManagerException
     */
    public function setFileThumb($uploading = false)
    {
        if ($this->isImage()) {
            $this->file->thumb = $this->url->forName($this->getPath(), $this->fullName(), 'thumb');
            if (!$uploading) {
                list($width, $height) = getimagesize($this->fullPath());
                $this->file->size = [$width, $height];
                $this->file->thumbs = $this->thumb->details($this);
            }
        } else {
            $this->file->thumb = $this->icon->get($this->mime);
        }

        return $this;
    }

    /**
     * Update file when path manager is set up
     *
     * @param Path $path
     */
    protected function onPathUpdate(Path $path)
    {
        $this->file->dir = $this->url->pathToUrl($path->relativePath());
        $this->thumb->setPath($path);
    }

    /**
     * Update file url
     * @throws FileManagerException
     */
    private function updateUrl()
    {
        $this->file->url = $this->url->forName($this->getPath(), $this->fullName());
    }
}