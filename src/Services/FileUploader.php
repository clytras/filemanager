<?php namespace Crip\FileManager\Services;

use Crip\Core\Contracts\ICripObject;
use Crip\FileManager\Exceptions\FileManagerException;
use Crip\FileManager\FileManager;
use Intervention\Image\ImageManager;
use Symfony\Component\HttpFoundation\File\UploadedFile;

/**
 * Class FileUploader
 * @package Crip\FileManager\Services
 */
class FileUploader implements ICripObject
{
    /**
     * Default thumb size array
     *
     * @var array
     */
    protected $thumbs = [
        'thumb' => [
            205,
            205,
            'resize',
        ]
    ];

    /**
     * @param UploadedFile $file
     * @param string $upload_path
     *
     * @return string Uploaded file name
     *
     * @throws FileManagerException
     */
    public function upload(UploadedFile $file, $upload_path)
    {
        if ($file->isValid()) {
            $crip_file = $this->getUniqueName($upload_path, (new CripFile)->readFromFile($file));
            $file->move($upload_path, $crip_file->fullName());
            if ($crip_file->mime->isImage()) {
                $this->createThumbs($upload_path, $crip_file);
            }

            return $crip_file->fullName();
        }
        throw new FileManagerException($this, 'err_file_upload_invalid_file');
    }

    /**
     * @param string $path
     * @param CripFile $file
     *
     * @return CripFile
     */
    private function getUniqueName($path, CripFile $file)
    {
        if (CripFile::exists(CripFile::join([$path, $file->fullName()]))) {
            $original_name = $file->name;
            $file->setName($file->name . '-1');
            for ($i = 2; CripFile::exists(CripFile::join([$path, $file->fullName()])); $i++) {
                $file->setName($original_name . '-' . $i);
            }
        }

        return $file;
    }

    /**
     * @param string $upload_path
     * @param CripFile $file
     */
    private function createThumbs($upload_path, CripFile $file)
    {
        $thumb_sizes = array_merge($this->thumbs, FileManager::package()->config('thumbs', []));
        $thumbs = [];
        foreach($thumb_sizes as $size_key => $sizes) {
            $img = app(ImageManager::class)->make(CripFile::join([$upload_path, $file->fullName()]));
            $path = $this->thumbPath($upload_path, $size_key);
        }
    }

    private function thumbPath($upload_path, $size_key)
    {

    }
}