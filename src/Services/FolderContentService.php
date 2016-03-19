<?php namespace Crip\FileManager\Services;

use Crip\Core\Contracts\ICripObject;
use Crip\Core\Helpers\FileSystem;
use Crip\FileManager\Contracts\IUsePathService;
use Crip\FileManager\Exceptions\FileManagerException;
use Crip\FileManager\Traits\UsePath;
use Illuminate\Support\Collection;

/**
 * Class FolderContentService
 * @package Crip\FileManager\Services
 */
class FolderContentService implements ICripObject, IUsePathService
{
    use UsePath;

    /**
     * @var Collection
     */
    public $content;

    /**
     * @var string
     */
    private $sys_path;

    /**
     * Initialise new instance of FolderContentService
     */
    public function __construct()
    {
        $this->content = new Collection();
    }

    /**
     * @param $path
     *
     * @return array
     *
     * @throws FileManagerException
     */
    public function get()
    {
        $this->sys_path = $this->getPath()->path();

        if (!FileSystem::exists($this->sys_path)) {
            throw new FileManagerException($this, 'err_folder_not_found');
        }

        foreach ($this->readDir() as $item_name) {
            $item_path = FileSystem::join($this->sys_path, $item_name);
            $this->readItem($item_path, $item_name);
        }

        return $this->content->toArray();
    }

    /**
     * @return array
     */
    private function readDir()
    {
        // Exclude current, parent and thumb directories from reading
        $exclude = ['.', '..', $this->getPath()->thumbDirName(), '.gitignore'];
        if ($this->getPath()->isRoot($this->sys_path)) {
            // Root folder can't contain folders with file manger router keywords
            // they can't be created, but user can create them manually in file system
            $exclude = array_merge($exclude, ['create', 'delete', 'rename', 'null']);
        } else {
            $this->addFolderBack();
        }

        return array_diff(scandir($this->sys_path), $exclude);
    }

    /**
     * @param $item_path
     * @param $item_name
     */
    private function readItem($item_path, $item_name)
    {
        if (is_dir($item_path)) {
            $this->addFolder($item_name);
        } else {
            $this->addFile($item_name);
        }
    }

    /**
     * @param $item_name
     */
    private function addFolder($item_name)
    {
        $folder = app(Folder::class)
            ->setPath($this->getPath())
            ->setName($item_name)
            ->updateDetails();

        $this->content->push($folder->details());
    }

    /**
     * @param $item_name
     */
    private function addFile($item_name)
    {
        $file = app(File::class)
            ->setPath($this->getPath())
            ->existing($item_name);

        $this->content->push($file->details());
    }

    /**
     * Add folder to parent directory
     */
    private function addFolderBack()
    {
        $parts = FileSystem::split($this->getPath()->relativePath());
        array_pop($parts);
        $patent_path = FileSystem::join($parts);
        $parent_path_manager = app(Path::class)->change($patent_path);

        $folder = app(Folder::class)
            ->setPath($parent_path_manager)
            ->setName('..')
            ->updateDetails();

        $this->content->push($folder->details());
    }
}