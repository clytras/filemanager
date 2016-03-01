<?php namespace Crip\FileManager\Services;

use Crip\Core\Contracts\ICripObject;
use Crip\Core\Helpers\Str;
use Crip\FileManager\Exceptions\FileException;
use Symfony\Component\HttpFoundation\File\UploadedFile;

/**
 * Class FileInfo
 * @package Crip\FileManager\Services
 */
class CripFile implements ICripObject
{
    /**
     * @var bool
     */
    public $is_file = false;
    /**
     * @var string
     */
    public $name;
    /**
     * @var string
     */
    public $original_name;
    /**
     * @var string
     */
    public $extension;
    /**
     * @var Mime
     */
    public $mime;
    /**
     * @var int
     */
    public $size = 0;

    public function fullName()
    {
        $ext = '';
        if ($this->extension !== null) {
            $ext = '.' . $this->extension;
        }
        return $this->name . $ext;
    }

    /**
     * @param string $name
     */
    public function setName($name)
    {
        $this->name = Str::slug($name);
    }

    /**
     * @param UploadedFile $file
     *
     * @return CripFile
     */
    public function readFromFile(UploadedFile $file)
    {
        $name = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $this->setName($name);
        $this->is_file = true;
        $this->extension = $file->getClientOriginalExtension();
        $this->mime = new Mime(null, $file->getMimeType());
        $this->size = $file->getSize();

        return $this;
    }

    /**
     * @param string $name
     * @param string $path
     * @param string $type
     *
     * @return CripFile
     *
     * @throws FileException
     */
    public function readFromString($name, $path = null, $type = null)
    {
        $name = basename($name);
        $this->is_file = str_contains($name, '.');
        if ($this->is_file && $type !== 'dir') {
            $file_name = pathinfo($name, PATHINFO_FILENAME);
            $this->extension = pathinfo($name, PATHINFO_EXTENSION);
            $this->name = Str::slug($file_name);
            $full_path = self::canonical($path) . DIRECTORY_SEPARATOR . $name;
            if ($path && self::exists($full_path)) {
                $this->mime = new Mime($full_path);
            }
        } else {
            $this->name = Str::slug($name);
        }

        return $this;
    }

    public function radFromDb($id)
    {
        // TODO: implement file info in DB
    }

    /**
     * Splits the file system path.
     *
     * @param string $path The path to split.
     *
     * @return array The split path.
     */
    public static function split($path)
    {
        return preg_split('/[\\\\\/]+/', $path);
    }

    /**
     * Joins a split file system path.
     *
     * @param array $path The split path.
     *
     * @return string The joined path.
     */
    public static function join(array $path)
    {
        return join(DIRECTORY_SEPARATOR, $path);
    }

    /**
     * Canonicalizes the file system path. Always remove slash from the end.
     *
     * @param string $path The path to canoncalize.
     *
     * @return string The canoncalized path.
     */
    public static function canonical($path)
    {
        $path = self::split($path);
        $canon = [];
        foreach ($path as $segment) {
            if ($segment === '..') {
                array_pop($canon);
            } elseif ($segment !== '.') {
                $canon[] = $segment;
            }
        }

        if ($canon[count($canon) - 1] === '') {
            array_pop($canon);
        }

        return self::join($canon);
    }

    /**
     * Determine if a file or directory exists.
     *
     * @param  string $path
     * @return bool
     */
    public static function exists($path)
    {
        return file_exists($path);
    }

    /**
     * Create a directory.
     *
     * @param  string $path
     * @param  int $mode
     * @param  bool $recursive
     * @param  bool $force
     * @return bool
     */
    public static function mkdir($path, $mode = 0755, $recursive = false, $force = false)
    {
        if (!self::exists($path)) {
            if ($force) {
                return @mkdir($path, $mode, $recursive);
            }

            return mkdir($path, $mode, $recursive);
        }

        return true;
    }

    /**
     * Get the file type of a given file.
     *
     * @param  string $path
     * @return string
     */
    public static function type($path)
    {
        return filetype($path);
    }

}