<?php namespace Crip\FileManager\Services;

use Crip\Core\Contracts\ICripObject;
use Crip\FileManager\Contracts\IUsePathService;
use Crip\FileManager\Exceptions\FileManagerException;
use Crip\FileManager\Traits\UsePath;
use Symfony\Component\HttpFoundation\File\UploadedFile;

/**
 * Class FileUploader
 * @package Crip\FileManager\Services
 */
class FileUploader implements ICripObject, IUsePathService
{

    use UsePath;

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
     * @var Thumb
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
     * @param Thumb $thumb
     * @param File $file
     * @param UniqueNameService $uniqueName
     */
    public function __construct(Thumb $thumb, File $file, UniqueNameService $uniqueName)
    {
        $this->thumb = $thumb;
        $this->file = $file;
        $this->uniqueName = $uniqueName;
    }

    /**
     * @param UploadedFile $uploaded_file
     * @return array Uploaded file info
     * @throws FileManagerException
     */
    public function upload(UploadedFile $uploaded_file)
    {
        if ($uploaded_file->isValid()) {
            $file = $this->file->uploading($uploaded_file);
            $this->uniqueName->file($file);
            $uploaded_file->move($file->dirPath(), $file->fullName());
            if ($file->isImage()) {
                $this->thumb->create($file);
                $file->setFileThumb();
            }

            return (array) $file->details();
        }
        throw new FileManagerException($this, 'err_file_upload_invalid_file');
    }

    /**
     * Update file when path manager is set up
     *
     * @param Path $path
     */
    protected function onPathUpdate(Path $path)
    {
        $this->file->setPath($path);
        $this->thumb->setPath($path);
    }
}