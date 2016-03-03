<?php namespace Crip\FileManager;

use Crip\Core\Contracts\ICripObject;
use Crip\Core\Helpers\FileSystem;
use Crip\Core\Support\PackageBase;
use Crip\FileManager\Data\File;
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
     * @param ThumbManager $thumb
     * @param PathManager $path
     * @param File $file
     * @param FileUploader $uploader
     * @param FileSystemManager $fileSystem
     */
    public function __construct(
        ThumbManager $thumb,
        PathManager $path,
        File $file,
        FileUploader $uploader,
        FileSystemManager $fileSystem
    ) {
        static::package();

        $this->thumb = $thumb;
        $this->path = $path;
        $this->file = $file;
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
    public function get(PathManager $path, $file_name, $size)
    {
        $file_path = FileSystem::join([$path->fullPath(), $file_name]);
        if ($size AND array_key_exists($size, $this->thumb->getSizes())) {
            $thumb_path = FileSystem::join([$this->path->thumbPath($size), $file_name]);
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
     * @param PathManager $path
     *
     * @return array
     *
     * @throws FileManagerException
     */
    public function upload(UploadedFile $uploaded_file, PathManager $path)
    {
        return $this->uploader->upload($uploaded_file, $path);
    }

    /**
     * Rename file name
     *
     * @param PathManager $dir Path where file exists
     * @param string $old Existing file name
     * @param string $new File name to be renamed
     *
     * @return File New file full information
     */
    public function renameFile(PathManager $dir, $old, $new)
    {
        $old_file = app(File::class)->setPath($dir)->setFromString($old);
        $new_file = app(File::class)->setFromString($new);

        return $this->fileSystem->renameFile($old_file, $new_file);
    }

    /**
     * Delete file from file system
     *
     * @param PathManager $path Path to the file
     * @param string $file_name File name to be deleted
     *
     * @return bool Is file deleted
     */
    public function deleteFile(PathManager $path, $file_name)
    {
        $file = $this->file->setPath($path)->setFromString($file_name);

        return $this->fileSystem->deleteFile($file);
    }
}