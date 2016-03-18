<?php namespace Crip\FileManager\Services;

use Crip\Core\Helpers\FileSystem;
use Crip\FileManager\Data\File;
use Crip\FileManager\Data\Folder;

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
        if (FileSystem::exists($file->getSysPath())) {
            $original_name = $file->getName();
            $file->setName($original_name . '-1');
            for ($i = 2; FileSystem::exists($file->getSysPath()); $i++) {
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
        if (FileSystem::exists($folder->getSysPath())) {
            $original_name = $folder->getName();
            $folder->setName($original_name . '-1');
            for ($i = 2; FileSystem::exists($folder->getSysPath()); $i++) {
                $folder->setName($original_name . '-' . $i);
            }
        }

        return $folder;
    }

}