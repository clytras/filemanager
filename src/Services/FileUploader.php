<?php namespace Crip\FileManager\Services;

use Crip\Core\Contracts\ICripObject;
use Crip\Core\Helpers\FileSystem;
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
     * @param UrlManager $url
     * @param ThumbManager $thumb
     */
    public function __construct(UrlManager $url, ThumbManager $thumb)
    {
        $this->url = $url;
        $this->thumb = $thumb;
    }

    /**
     * @param UploadedFile $file
     * @param PathManager $path
     *
     * @return array Uploaded file url and/or thumbs
     *
     * @throws FileManagerException
     */
    public function upload(UploadedFile $file, PathManager $path)
    {
        if ($file->isValid()) {
            $crip_file = $this->getUniqueName($path, (new CripFile)->readFromFile($file));
            $file->move($path->fullPath(), $crip_file->fullName());
            $uploaded_file = [
                'file' => $this->url->getFileUrl($path, $crip_file)
            ];
            if ($crip_file->mime->isImage()) {
                $uploaded_file['thumbs'] = $this->thumb->create($path, $crip_file);
            }

            return $uploaded_file;
        }
        throw new FileManagerException($this, 'err_file_upload_invalid_file');
    }

    /**
     * @param PathManager $path
     * @param CripFile $file
     *
     * @return CripFile
     */
    private function getUniqueName(PathManager $path, CripFile $file)
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