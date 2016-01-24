<?php namespace Crip\Filemanager\App;

use File;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Crip\Filemanager\App\Exceptions\FilemanagerException;

/**
 * Class FileManagerInfo
 * @package Tahq69\ScriptFileManager\Script
 */
class FileManagerInfo
{
    public $is_file = false;

    public $name = 'undefined';

    public $extension = 'undefined';

    public $mime = 'undefined';

    public $size = 0;

    public function fullName()
    {
        $ext = '';
        if ($this->extension !== 'undefined') {
            $ext = '.' . $this->extension;
        }

        return $this->name . $ext;
    }

    public function readFromFile(UploadedFile $file)
    {
        $info = new FileManagerInfo();
        $name = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $info->is_file = true;
        $info->name = $this->slug($name);
        $info->extension = $file->getClientOriginalExtension();
        $info->mime = $file->getMimeType();
        $info->size = $file->getSize();

        return $info;
    }

    public function readFromString($name, $path = null, $type = null)
    {
        $info = new FileManagerInfo();

        if (str_contains($name, '/')) {
            throw new FilemanagerException("TODO: incorrect {$name}");
        }

        $info->is_file = str_contains($name, '.');

        if ($info->is_file && $type !== 'folder') {
            $file_name = pathinfo($name, PATHINFO_FILENAME);
            $info->extension = pathinfo($name, PATHINFO_EXTENSION);
            $info->name = $this->slug($file_name);

            $full_path = $path . $name;
            if ($path && File::exists($full_path)) {
                $info->mime = mime_content_type($full_path);
            }
        } else {
            $info->name = $this->slug($name);
        }

        return $info;
    }

    private function slug($text)
    {
        return str_slug($text);
    }
}