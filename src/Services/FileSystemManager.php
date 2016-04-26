<?php namespace Crip\FileManager\Services;

use Crip\Core\Contracts\ICripObject;
use Crip\Core\Helpers\FileSystem;
use Crip\FileManager\Contracts\IUsePathService;
use Crip\FileManager\Exceptions\FileManagerException;
use Crip\FileManager\Traits\UsePath;

/**
 * Class FileSystemManager
 * @package Crip\FileManager\Services
 */
class FileSystemManager implements ICripObject, IUsePathService
{
    use UsePath;

    /**
     * @var FolderContent
     */
    public $folder;

    /**
     * @var UniqueNameService
     */
    private $uniqueName;

    /**
     * @var Thumb
     */
    private $thumb;

    /**
     * @param UniqueNameService $uniqueName
     * @param Thumb $thumb
     * @param FolderContent $folder
     */
    public function __construct(UniqueNameService $uniqueName, Thumb $thumb, FolderContent $folder)
    {
        $this->uniqueName = $uniqueName;
        $this->thumb = $thumb;
        $this->folder = $folder;
    }

    /**
     * @param File $file
     * @param string $name
     *
     * @return File
     *
     * @throws FileManagerException
     */
    public function renameFile(File $file, $name)
    {
        $name = pathinfo(basename($name), PATHINFO_FILENAME);
        $new_file = app(File::class)
            ->setPath($file->getPath())
            ->existing($file->fullName())
            ->setName($name);
        $new_file->setName($name);

        $old_file_path = $file->fullPath();
        $new_file_path = $new_file->fullPath();

        if (!FileSystem::exists($old_file_path)) {
            throw new FileManagerException($this, 'err_file_not_found');
        }

        // if old name is the same as new one, just return existing file info
        if ($old_file_path === $new_file_path) {
            return $file->details();
        }

        if (FileSystem::exists($new_file_path)) {
            $new_file = $this->uniqueName->file($new_file);
        }

        if (rename($old_file_path, $new_file->fullPath())) {
            if ($file->isImage()) {
                $this->thumb->rename($file, $new_file);
            }

            return $file->setName($new_file->name())->setFileThumb()->details();
        }

        throw new FileManagerException($this, 'err_file_cant_rename');
    }

    /**
     * @param File $file
     *
     * @return bool
     *
     * @throws FileManagerException
     */
    public function deleteFile(File $file)
    {
        $path = $file->fullPath();

        if (!FileSystem::exists($path)) {
            throw new FileManagerException($this, 'err_file_not_found');
        }

        if(!Perms::canDelete($path)) {
            throw new FileManagerException($this, 'err_file_delete_perm');
        }

        if (FileSystem::delete($path)) {
            if ($file->isImage()) {
                $this->thumb->delete($file);
            }

            return true;
        }

        return false;
    }

    /**
     * @param Folder $folder
     * @return Folder
     * @throws FileManagerException
     */
    public function createFolder(Folder $folder)
    {
        if (FileSystem::exists($folder->fullPath())) {
            $this->uniqueName->folder($folder);
        }

        // TODO: add this list to config
        if (in_array($folder->name(), ['create', 'delete', 'rename', 'null'])) {
            throw new FileManagerException($this, 'err_folder_this_name_cant_be_used');
        }
        FileSystem::mkdir($folder->fullPath(), 777, true);

        return $folder;
    }

    /**
     * @param Folder $folder
     * @param string $name
     * @return Folder
     * @throws FileManagerException
     */
    public function renameFolder(Folder $folder, $name)
    {
        $old_folder_path = $folder->fullPath();
        $new_folder = app(Folder::class)
            ->setPath($folder->getPath())
            ->setName($name);

        $new_folder_path = $new_folder->fullPath();

        if (!FileSystem::exists($old_folder_path)) {
            throw new FileManagerException($this, 'err_folder_not_found');
        }

        // if old name is the same as new one, just return existing folder info
        if ($old_folder_path === $new_folder_path) {
            return $folder;
        }

        if (FileSystem::exists($new_folder_path)) {
            $new = $this->uniqueName->folder($new_folder);
        }

        if (rename($old_folder_path, $new_folder->fullPath())) {
            return $new_folder->updateDetails()->details();
        }

        throw new FileManagerException($this, 'err_folder_cant_rename');
    }

    /**
     * @param Folder $folder
     *
     * @return bool
     *
     * @throws FileManagerException
     */
    public function deleteFolder(Folder $folder)
    {
        $path = $folder->fullPath();

        if (!FileSystem::exists($path)) {
            throw new FileManagerException($this, 'err_folder_not_found');
        }

        if(!Perms::canDelete($path)) {
            throw new FileManagerException($this, 'err_folder_delete_perm');
        }

        return FileSystem::deleteDirectory($path);
    }

    /**
     * Update file when path manager is set up
     *
     * @param Path $path
     */
    protected function onPathUpdate(Path $path)
    {
        $this->thumb->setPath($path);
    }
}