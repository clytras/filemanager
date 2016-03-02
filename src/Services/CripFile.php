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
}