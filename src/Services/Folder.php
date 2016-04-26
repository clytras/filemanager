<?php namespace Crip\FileManager\Services;

use Crip\Core\Contracts\ICripObject;
use Crip\Core\Helpers\FileSystem;
use Crip\Core\Helpers\Str;
use Crip\FileManager\Contracts\IUsePathService;
use Crip\FileManager\Exceptions\FileManagerException;
use Crip\FileManager\Traits\UsePath;
use Crip\FileManager\Data\Folder as FolderDto;

/**
 * Class Folder
 * @package Crip\FileManager\Services
 */
class Folder implements ICripObject, IUsePathService
{
    use UsePath;

    /**
     * @var Url
     */
    private $url;

    /**
     * @var FolderDto
     */
    private $folder;

    /**
     * Initialise new instance of Folder service
     *
     * @param Url $url
     * @param FolderDto $folder
     * @param Mime $mime
     * @param Icon $icon
     */
    public function __construct(Url $url, FolderDto $folder, Mime $mime, Icon $icon)
    {
        $this->url = $url;
        $this->folder = $folder;
        $this->folder->thumb = $icon->get($mime->setMime('dir'));
    }

    /**
     * Set folder name
     *
     * @param $name
     * @return $this
     */
    public function setName($name)
    {
        if ($name !== '..') {
            $this->folder->name = Str::slug($name);
            $this->folder->full_name = $this->folder->name;
        } else {
            $this->folder->name = null;
            $this->folder->full_name = '..';
        }

        return $this;
    }

    /**
     * Get folder name
     *
     * @return string
     */
    public function name()
    {
        return $this->folder->name;
    }

    /**
     * Get current folder full path
     *
     * @return string
     * @throws FileManagerException
     */
    public function path()
    {
        return FileSystem::join($this->getPath()->relativePath(), $this->name());
    }

    /**
     * Get current folder system path
     *
     * @return string
     * @throws FileManagerException
     */
    public function fullPath()
    {
        return FileSystem::join($this->getPath()->path(), $this->name());
    }

    /**
     * Update folder details (use if name is changed)
     *
     * @returns $this
     * @throws FileManagerException
     */
    public function updateDetails()
    {
        $this->folder->dir = $this->url->pathToUrl($this->getPath()->relativePath());
        $this->folder->url = $this->url->forFolder($this->getPath(), $this->name());
        $this->folder->updated_at = date('Y-m-d H:i:s', stat($this->fullPath())['mtime']);
        $this->folder->bytes = FileSystem::dirSize($this->fullPath(), [$this->getPath()->thumbDirName()]);

        return $this;
    }

    /**
     * Get folder details object
     *
     * @return FolderDto
     */
    public function details()
    {
        $this->folder->readPermsFromPath($this->fullPath());

        return $this->folder;
    }

    /**
     * Update file when path manager is set up
     *
     * @param Path $path
     */
    protected function onPathUpdate(Path $path)
    {
        $this->updateDetails();
    }
}