<?php namespace Crip\FileManager\Services;

use Crip\Core\Contracts\ICripObject;
use Crip\Core\Helpers\FileSystem;
use Crip\FileManager\Data\File;
use Crip\FileManager\Exceptions\FileManagerException;

/**
 * Class FileSystemManager
 * @package Crip\FileManager\Services
 */
class FileSystemManager implements ICripObject
{

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
     */
    public function __construct(UniqueNameService $uniqueName, ThumbManager $thumb)
    {
        $this->uniqueName = $uniqueName;
        $this->thumb = $thumb;
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
        $old_file_path = $old_file->getFullFilePath();
        $new_file_path = $new_file->clonePath($old_file)->getFullFilePath();

        if (!FileSystem::exists($old_file_path)) {
            throw new FileManagerException($this, 'err_file_not_found');
        }

        if ($old_file->ext !== $new_file->ext) {
            throw new FileManagerException($this, 'err_file_ext_cant_be_changed');
        }

        // if old name is the same as new one, just return existing file info
        if ($old_file_path === $new_file_path) {
            return $old_file;
        }

        if (FileSystem::exists($new_file_path)) {
            $new_file = $this->uniqueName->file($new_file);
        }

        if (rename($old_file_path, $new_file->getFullFilePath())) {
            if ($old_file->mime->service->isImage()) {
                $this->thumb->rename($old_file, $new_file);
            }

            return $new_file;
        }

        throw new FileManagerException($this, 'err_file_cant_rename');
    }

    public function deleteFile(File $file)
    {
        $path = $file->getFullFilePath();

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
}