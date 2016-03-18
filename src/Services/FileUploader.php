<?php namespace Crip\FileManager\Services;

use Crip\Core\Contracts\ICripObject;
use Crip\FileManager\Contracts\IManagerPath;
use Crip\FileManager\Data\File;
use Crip\FileManager\Exceptions\FileManagerException;
use Symfony\Component\HttpFoundation\File\UploadedFile;

/**
 * Class FileUploader
 * @package Crip\FileManager\Services
 */
class FileUploader implements ICripObject, IManagerPath
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
     * @var PathManager
     */
    private $path_manager;

    /**
     * @param ThumbManager $thumb
     * @param File $file
     * @param UniqueNameService $uniqueName
     */
    public function __construct(ThumbManager $thumb, File $file, UniqueNameService $uniqueName)
    {
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
    public function upload(UploadedFile $uploaded_file)
    {
        if ($uploaded_file->isValid()) {
            $this->file->setFromUpload($uploaded_file);
            $this->uniqueName->file($this->file);
            $uploaded_file->move($this->getPathManager()->sysPath(), $this->file->full_name);
            $result = [
                'file' =>  $this->file->toArray()
            ];
            if ($this->file->mime->service->isImage()) {
                $result['thumbs'] = $this->thumb->create($this->file);
            }

            return $result;
        }
        throw new FileManagerException($this, 'err_file_upload_invalid_file');
    }

    /**
     * Set path manager
     *
     * @param PathManager $manager
     * @return $this
     */
    public function setPathManager(PathManager $manager)
    {
        $this->path_manager = $manager;
        $this->thumb->setPathManager($manager);
        $this->file->setPathManager($manager);

        return $this;
    }

    /**
     * Get current path manager
     *
     * @return PathManager
     */
    public function getPathManager()
    {
        return $this->path_manager;
    }
}