<?php namespace Crip\FileManager\Services;

use Crip\Core\Contracts\ICripObject;
use Crip\Core\Helpers\FileSystem;
use Crip\FileManager\Contracts\IUsePathService;
use Crip\FileManager\Exceptions\FileManagerException;
use Crip\FileManager\Traits\UsePath;
use Illuminate\Support\Collection;

/**
 * Class FolderContent
 * @package Crip\FileManager\Services
 */
class FolderContent implements ICripObject, IUsePathService
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
     * Initialise new instance of FolderContent
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

        $this->readDir()->map(function ($item_name) {
            $this->content->push($this->readItem($item_name));
        });

        return $this->content->toArray();
    }

    /**
     * @return Collection
     */
    private function readDir()
    {
        // Exclude current, parent and thumb directories from reading
        $exclude = collect(['.', '..', $this->getPath()->thumbDirName(), '.gitignore']);
        if ($this->getPath()->isRoot($this->sys_path)) {
            // Root folder can't contain folders with file manger router keywords
            // they can't be created, but user can create them manually in file system
            $exclude = $exclude->merge(['create', 'delete', 'rename', 'null']);
        } else {
            $this->addFolderBack();
        }

        return collect(scandir($this->sys_path))->diff($exclude);
    }

    /**
     * @param string $item_name
     * @return \Crip\FileManager\Data\File|\Crip\FileManager\Data\Folder
     */
    private function readItem($item_name)
    {
        $item_path = FileSystem::join($this->sys_path, $item_name);
        if (is_dir($item_path)) {
            return $this->readAsFolder($item_name);
        } else {
            return $this->readAsFile($item_name);
        }
    }

    /**
     * @param $item_name
     * @return \Crip\FileManager\Data\Folder
     */
    private function readAsFolder($item_name)
    {
        return app(Folder::class)
            ->setPath($this->getPath())
            ->setName($item_name)
            ->updateDetails()
            ->details();
    }

    /**
     * @param $item_name
     * @return \Crip\FileManager\Data\File
     */
    private function readAsFile($item_name)
    {
        return app(File::class)
            ->setPath($this->getPath())
            ->existing($item_name)
            ->details();
    }

    /**
     * Add folder to parent directory
     */
    private function addFolderBack()
    {
        $parts = collect(FileSystem::split($this->getPath()->relativePath()));
        $parts->pop();
        $patent_path = app(Path::class)->change($parts->implode(DIRECTORY_SEPARATOR));

        $folder = app(Folder::class)
            ->setPath($patent_path)
            ->setName('..')
            ->updateDetails();

        $this->content->push($folder->details());
    }
}