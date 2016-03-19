<?php namespace Crip\FileManager\Services;

use Crip\Core\Helpers\FileSystem;

/**
 * Class UniqueNameService
 * @package Crip\FileManager\Services
 */
class UniqueNameService
{

    /**
     * Set unique name for file
     *
     * @param File $file
     * @return File
     */
    public function file(File $file)
    {
        if (FileSystem::exists($file->fullPath())) {
            $original_name = $file->name();
            $file->setName($original_name . '-1');
            for ($i = 2; FileSystem::exists($file->fullPath()); $i++) {
                $file->setName($original_name . '-' . $i);
            }
        }

        return $file;
    }

    /**
     * Set unique name for folder
     *
     * @param Folder $folder
     * @return Folder
     */
    public function folder(Folder $folder)
    {
        if (FileSystem::exists($folder->fullPath())) {
            $original_name = $folder->name();
            $folder->setName($original_name . '-1');
            for ($i = 2; FileSystem::exists($folder->fullPath()); $i++) {
                $folder->setName($original_name . '-' . $i);
            }
        }

        return $folder;
    }

}