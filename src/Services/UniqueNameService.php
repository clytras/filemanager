<?php namespace Crip\FileManager\Services;

use Crip\Core\Helpers\FileSystem;
use Crip\FileManager\Data\File;

/**
 * Class UniqueNameService
 * @package Crip\FileManager\Services
 */
class UniqueNameService
{

    /**
     * @param File $file
     *
     * @return File
     */
    public function file(File $file)
    {
        if (FileSystem::exists($file->getFullFilePath())) {
            $original_name = $file->name;
            $file->setName($file->name . '-1');
            for ($i = 2; FileSystem::exists($file->getFullFilePath()); $i++) {
                $file->setName($original_name . '-' . $i);
            }
        }

        return $file;
    }

}