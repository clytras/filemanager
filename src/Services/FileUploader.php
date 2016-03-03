<?php namespace Crip\FileManager\Services;

use Crip\Core\Contracts\ICripObject;
use Crip\Core\Helpers\FileSystem;
use Crip\FileManager\Data\File;
use Crip\FileManager\Exceptions\FileManagerException;
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
     * @var UrlManager
     */
    private $url;

    /**
     * @var ThumbManager
     */
    private $thumb;
    /**
     * @var File
     */
    private $file;

    /**
     * @param UrlManager $url
     * @param ThumbManager $thumb
     * @param File $file
     */
    public function __construct(UrlManager $url, ThumbManager $thumb, File $file)
    {
        $this->url = $url;
        $this->thumb = $thumb;
        $this->file = $file;
    }

    /**
     * @param UploadedFile $uploaded_file
     * @param PathManager $path
     *
     * @return array Uploaded file url and/or thumbs
     *
     * @throws FileManagerException
     */
    public function upload(UploadedFile $uploaded_file, PathManager $path)
    {
        if ($uploaded_file->isValid()) {
            $this->getUniqueName($path, $this->file->setFromUpload($uploaded_file));
            $uploaded_file->move($path->fullPath(), $this->file->full_name);
            $this->file->setPath($path);
            $result = [
                'file' =>  $this->file->toArray()
            ];
            if ($this->file->mime->service->isImage()) {
                $result['thumbs'] = $this->thumb->create($path, $this->file);
            }

            return $result;
        }
        throw new FileManagerException($this, 'err_file_upload_invalid_file');
    }

    /**
     * @param PathManager $path
     * @param File $file
     *
     * @return File
     */
    private function getUniqueName(PathManager $path, File $file)
    {
        if (FileSystem::exists($path->fullPath($file))) {
            $original_name = $file->name;
            $file->setName($file->name . '-1');
            for ($i = 2; FileSystem::exists($path->fullPath($file)); $i++) {
                $file->setName($original_name . '-' . $i);
            }
        }

        return $file;
    }
}