<?php namespace Crip\FileManager;

use Crip\Core\Contracts\ICripObject;
use Crip\Core\Support\PackageBase;
use Crip\FileManager\Services\File;
use Crip\FileManager\Services\FileSystemManager;
use Crip\FileManager\Services\FileUploader;
use Crip\FileManager\Services\Folder;
use Crip\FileManager\Services\FolderContent;
use Crip\FileManager\Services\Path;
use Symfony\Component\HttpFoundation\File\UploadedFile;

/**
 * Class FileManager
 * @package Crip\FileManager
 */
class FileManager implements ICripObject
{
    /**
     * @var PackageBase
     */
    private static $package;

    /**
     * @var Path
     */
    private $path;

    /**
     * @var File
     */
    private $file;
    /**
     * @var FileUploader
     */
    private $uploader;

    /**
     * @var Folder
     */
    private $folder;
    /**
     * @var FileSystemManager
     */
    private $sys;

    /**
     * Initialise new instance of FileManager
     *
     * @param Path $path
     * @param File $file
     * @param FileUploader $uploader
     * @param Folder $folder
     * @param FileSystemManager $sys
     */
    public function __construct(Path $path, File $file, FileUploader $uploader, Folder $folder, FileSystemManager $sys)
    {
        static::package();

        $this->path = $path;
        $this->file = $file;
        $this->uploader = $uploader;
        $this->folder = $folder;
        $this->sys = $sys;
    }

    /**
     * @return PackageBase
     */
    public static function package()
    {
        if (!self::$package) {
            self::$package = new PackageBase('cripfilemanager', __DIR__);
        }

        return self::$package;
    }

    /**
     * Change path
     *
     * @param string $path Go to the path
     * @return FileManager
     */
    public function in($path)
    {
        $this->path->updatePath($path);
        $this->file->setPath($this->path);
        $this->uploader->setPath($this->path);
        $this->folder->setPath($this->path);

        return $this;
    }

    /**
     * Get file info filesystem
     *
     * @param string $name File name to get
     * @return File
     */
    public function fileService($name)
    {
        return $this->file->existing($name);
    }

    /**
     * @param UploadedFile $uploaded_file
     *
     * @return array
     *
     * @throws FileManagerException
     */
    public function upload(UploadedFile $uploaded_file)
    {
        return $this->uploader->upload($uploaded_file);
    }

    /**
     * Rename file name
     *
     * @param string $old Existing file name
     * @param string $new File name to be renamed
     *
     * @return File New file full information
     */
    public function renameFile($old, $new)
    {
        $old_file = app(File::class)
            ->setPath($this->path)
            ->existing($old);

        return $this->sys->renameFile($old_file, $new);
    }

    /**
     * Delete file from file system
     *
     * @param string $name File name to be deleted
     * @return bool Is file deleted
     */
    public function deleteFile($name)
    {
        $file = $this->file->existing($name);

        return $this->sys->deleteFile($file);
    }

    /**
     * Create folder in file system
     *
     * @param string $folder_name The folder name to be created
     * @return array
     */
    public function createFolder($folder_name)
    {
        $folder = $this->folder->setName($folder_name);

        return (array)$this->sys->createFolder($folder)->updateDetails()->details();
    }

    /**
     * Rename folder in file system
     *
     * @param string $old_name
     * @param string $new_name
     *
     * @return Folder
     */
    public function renameFolder($old_name, $new_name)
    {
        $old_folder = $this->folder->setName($old_name);

        return $this->sys->renameFolder($old_folder, $new_name);
    }

    /**
     * Delete folder from file system
     *
     * @param string $folder_name The folder name to be deleted
     *
     * @return bool
     */
    public function deleteFolder($folder_name)
    {
        $folder = $this->folder->setName($folder_name);

        return $this->sys->deleteFolder($folder);
    }

    /**
     * @return array
     * @throws Exceptions\FileManagerException
     */
    public function content()
    {
        return app(FolderContent::class)->setPath($this->path)->get();
    }

}