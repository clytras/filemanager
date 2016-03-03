<?php namespace Crip\FileManager\Services;

use Crip\Core\Contracts\ICripObject;
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
     * @var UniqueNameService
     */
    private $uniqueName;

    /**
     * @param UrlManager $url
     * @param ThumbManager $thumb
     * @param File $file
     * @param UniqueNameService $uniqueName
     */
    public function __construct(UrlManager $url, ThumbManager $thumb, File $file, UniqueNameService $uniqueName)
    {
        $this->url = $url;
        $this->thumb = $thumb;
        $this->file = $file;
        $this->uniqueName = $uniqueName;
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
            $this->file->setPath($path)->setFromUpload($uploaded_file);
            $this->uniqueName->file($this->file);
            $uploaded_file->move($path->fullPath(), $this->file->full_name);
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
}