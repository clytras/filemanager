<?php namespace Crip\FileManager\Services;

use Crip\Core\Contracts\ICripObject;
use Crip\Core\Helpers\FileSystem;
use Crip\FileManager\Data\File;
use Crip\FileManager\Data\Folder;
use Crip\FileManager\Exceptions\FileManagerException;
use Illuminate\Support\Collection;

/**
 * Class FileSystemManager
 * @package Crip\FileManager\Services
 */
class FileSystemManager implements ICripObject
{

    /**
     * @var FolderContentService
     */
    public $folder;

    /**
     * @var UniqueNameService
     */
    private $uniqueName;

    /**
     * @var ThumbManager
     */
    private $thumb;


    /**
     * @param UniqueNameService $uniqueName
     * @param ThumbManager $thumb
     * @param FolderContentService $folder
     */
    public function __construct(UniqueNameService $uniqueName, ThumbManager $thumb, FolderContentService $folder)
    {
        $this->uniqueName = $uniqueName;
        $this->thumb = $thumb;
        $this->folder = $folder;
    }

    /**
     * @param File $old_file
     * @param File $new_file
     *
     * @return File
     *
     * @throws FileManagerException
     */
    public function renameFile(File $old_file, File $new_file)
    {
        $old_file_path = $old_file->getSysPath();
        $new_file_path = $new_file->clonePath($old_file)->getSysPath();

        if (!FileSystem::exists($old_file_path)) {
            throw new FileManagerException($this, 'err_file_not_found');
        }

        // if old name is the same as new one, just return existing file info
        if ($old_file_path === $new_file_path) {
            return $old_file;
        }

        if ($old_file->ext !== $new_file->ext) {
            throw new FileManagerException($this, 'err_file_ext_cant_be_changed');
        }

        if (FileSystem::exists($new_file_path)) {
            $new_file = $this->uniqueName->file($new_file);
        }

        if (rename($old_file_path, $new_file->getSysPath())) {
            if ($old_file->mime->service->isImage()) {
                $this->thumb->rename($old_file, $new_file);
            }

            return $old_file->setName($new_file->getName());
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
        $path = $file->getSysPath();

        if (!FileSystem::exists($path)) {
            throw new FileManagerException($this, 'err_file_not_found');
        }

        if (FileSystem::delete($path)) {
            if ($file->mime->service->isImage()) {
                $this->thumb->delete($file);
            }

            return true;
        }

        return false;
    }

    /**
     * @param Folder $folder
     *
     * @return Folder
     */
    public function createFolder(Folder $folder)
    {
        if (FileSystem::exists($folder->getSysPath())) {
            $this->uniqueName->folder($folder);
        }
        // TODO: deny create folders in root folder with router keywords
        FileSystem::mkdir($folder->getSysPath(), 777, true);

        return $folder;
    }

    /**
     * @param Folder $old
     * @param Folder $new
     *
     * @return Folder
     *
     * @throws FileManagerException
     */
    public function renameFolder(Folder $old, Folder $new)
    {
        $old_folder_path = $old->getSysPath();
        $new_folder_path = $new->setPathFrom($old)->getSysPath();

        if (!FileSystem::exists($old_folder_path)) {
            throw new FileManagerException($this, 'err_folder_not_found');
        }

        // if old name is the same as new one, just return existing folder info
        if ($old_folder_path === $new_folder_path) {
            return $old;
        }

        if (FileSystem::exists($new_folder_path)) {
            $new = $this->uniqueName->folder($new);
        }

        if (rename($old_folder_path, $new->getSysPath())) {
            return $new;
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
        $path = $folder->getSysPath();

        if (!FileSystem::exists($path)) {
            throw new FileManagerException($this, 'err_folder_not_found');
        }

        return FileSystem::deleteDirectory($path);
    }
}