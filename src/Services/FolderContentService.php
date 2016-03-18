<?php namespace Crip\FileManager\Services;

use Crip\Core\Contracts\ICripObject;
use Crip\Core\Helpers\FileSystem;
use Crip\FileManager\Data\File;
use Crip\FileManager\Data\Folder;
use Crip\FileManager\Exceptions\FileManagerException;
use Illuminate\Support\Collection;

/**
 * Class FolderContentService
 * @package Crip\FileManager\Services
 */
class FolderContentService implements ICripObject
{
    /**
     * @var Collection
     */
    public $content;

    /**
     * @var PathManager
     */
    private $pathManager;

    /**
     * @var string
     */
    private $path;

    /**
     * @var string
     */
    private $sys_path;

    /**
     * @param PathManager $pathManager
     */
    public function __construct(PathManager $pathManager)
    {
        $this->pathManager = $pathManager;
        $this->content = new Collection();
    }

    /**
     * @param $path
     *
     * @return array
     *
     * @throws FileManagerException
     */
    public function get($path)
    {
        $this->pathManager->goToPath($path);
        $this->path = $this->pathManager->getPath();
        $this->sys_path = $this->pathManager->sysPath();

        if (!FileSystem::exists($this->sys_path)) {
            throw new FileManagerException($this, 'err_folder_not_found');
        }

        foreach ($this->readDir() as $item_name) {
            $item_path = FileSystem::join($this->sys_path, $item_name);
            $this->readItem($item_path, $item_name);
        }

        $result = [];
        foreach ($this->content as $item) {
            $result[] = $item->toArray();
        }
        return $result;
    }

    /**
     * @return array
     */
    private function readDir()
    {
        // Exclude current, parent and thumb directories from reading
        $exclude = ['.', '..', $this->pathManager->getThumbDir(), '.gitignore'];
        if ($this->pathManager->isRoot($this->sys_path)) {
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
            ->setPath($this->pathManager)
            ->setName($item_name);

        $this->content->push($folder);
    }

    /**
     * @param $item_name
     */
    private function addFile($item_name)
    {
        $file = app(File::class)
            ->setPathManager($this->pathManager)
            ->setFromString($item_name);

        $this->content->push($file);
    }

    /**
     * Add folder to parent directory
     */
    private function addFolderBack()
    {
        $parts = FileSystem::split($this->pathManager->getPath());
        array_pop($parts);
        $patent_path = FileSystem::join($parts);
        $parent_path_manager = app(PathManager::class)->goToPath($patent_path);

        $folder = app(Folder::class)
            ->setPath($parent_path_manager)
            ->setName('..');

        $this->content->push($folder);
    }
}