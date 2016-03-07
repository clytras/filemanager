<?php namespace Crip\FileManager;

use Crip\Core\Contracts\ICripObject;
use Crip\Core\Helpers\FileSystem;
use Crip\Core\Support\PackageBase;
use Crip\FileManager\Data\File;
use Crip\FileManager\Data\Folder;
use Crip\FileManager\Exceptions\FileManagerException;
use Crip\FileManager\Services\FileSystemManager;
use Crip\FileManager\Services\FileUploader;
use Crip\FileManager\Services\PathManager;
use Crip\FileManager\Services\ThumbManager;
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
     * @var ThumbManager
     */
    private $thumb;

    /**
     * @var PathManager
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
     * @var FileSystemManager
     */

    private $fileSystem;

    /**
     * @var Folder
     */
    private $folder;

    /**
     * @param ThumbManager $thumb
     * @param PathManager $path
     * @param File $file
     * @param Folder $folder
     * @param FileUploader $uploader
     * @param FileSystemManager $fileSystem
     */
    public function __construct(
        ThumbManager $thumb,
        PathManager $path,
        File $file,
        Folder $folder,
        FileUploader $uploader,
        FileSystemManager $fileSystem
    ) {
        static::package();

        $this->thumb = $thumb;
        $this->path = $path;
        $this->file = $file;
        $this->folder = $folder;
        $this->uploader = $uploader;
        $this->fileSystem = $fileSystem;
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
     *
     * @return FileManager
     */
    public function in($path)
    {
        $this->path->goToPath($path);

        return $this;
    }

    /**
     * Get file from filesystem corresponding size
     *
     * @param PathManager $path The path where file is located
     * @param string $file_name File name to get
     * @param string $size The thumb size
     *
     * @return File
     *
     * @throws FileManagerException
     */
    public function get($file_name, $size)
    {
        $file_path = FileSystem::join([$this->path->sysPath(), $file_name]);
        if ($size AND array_key_exists($size, $this->thumb->getSizes())) {
            $thumb_path = FileSystem::join([$this->path->getThumbSysPath($size), $file_name]);
            if (FileSystem::exists($thumb_path)) {
                $file_path = $thumb_path;
            }
        }

        if (FileSystem::exists($file_path)) {
            return $this->file->set($file_path);
        }

        throw new FileManagerException($this, 'err_file_not_found');
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
        return $this->uploader->upload($uploaded_file, $this->path);
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
        $old_file = app(File::class)->setPath($this->path)->setFromString($old);
        $new_file = app(File::class)->setFromString($new);

        return $this->fileSystem->renameFile($old_file, $new_file);
    }

    /**
     * Delete file from file system
     *
     * @param string $file_name File name to be deleted
     *
     * @return bool Is file deleted
     */
    public function deleteFile($file_name)
    {
        $file = $this->file->setPath($this->path)->setFromString($file_name);

        return $this->fileSystem->deleteFile($file);
    }

    /**
     * Create folder in file system
     *
     * @param string $folder_name The folder name to be created
     *
     * @return Folder
     */
    public function createFolder($folder_name)
    {
        $folder = $this->folder->setPath($this->path)->setName($folder_name);

        return $this->fileSystem->createFolder($folder);
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
        $old_folder = app(Folder::class)->setPath($this->path)->setName($old_name);
        $new_folder = app(Folder::class)->setName($new_name);

        return $this->fileSystem->renameFolder($old_folder, $new_folder);
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
        $folder = $this->folder->setPath($this->path)->setName($folder_name);

        return $this->fileSystem->deleteFolder($folder);
    }
}