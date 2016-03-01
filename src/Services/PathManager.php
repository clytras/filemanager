<?php namespace Crip\FileManager\Services;

use Crip\Core\Contracts\ICripObject;
use Crip\FileManager\Exceptions\FileManagerException;
use Crip\FileManager\FileManager;

/**
 * Class PathManager
 * @package Crip\FileManager\Services
 */
class PathManager implements ICripObject
{
    /**
     * @var string
     */
    private $path;
    /**
     * @var string
     */
    private $base_path;
    /**
     * @var string
     */
    private $full_path;
    /**
     * @var \Crip\Core\Support\PackageBase
     */
    private $pck;

    public function __construct()
    {
        $this->setBasePath();
        $this->pck = FileManager::package();
    }

    /**
     * Change
     * @param string $path
     */
    public function goToPath($path)
    {
        $this->updateFullPath($path);
    }

    /**
     * @param $path
     *
     * @return PathManager
     *
     * @throws FileManagerException
     */
    private function setPath($path)
    {
        $this->path = trim(CripFile::canonical($path), '/');
        if(!CripFile::exists($this->full_path)) {
            throw new FileManagerException($this, 'err_path_not_exist', ['path' => $this->path]);
        }
        if (CripFile::type($this->full_path) !== 'dir') {
            throw new FileManagerException($this, 'err_path_not_dir', ['path' => $this->path]);
        }

        return $this;
    }

    /**
     * Update full path &| set path
     *
     * @param string $path
     *
     * @throws FileManagerException
     */
    private function updateFullPath($path = null)
    {
        if ($path !== null) {
            $this->setPath($path);
        }

        $this->full_path = $this->base_path . DIRECTORY_SEPARATOR . $this->path;
    }

    /**
     * Sets base path of object
     */
    private function setBasePath()
    {
        if (!$this->base_path) {
            $path = CripFile::canonical($this->pck->config('dir'));
            $this->base_path = base_path($path);
            CripFile::mkdir($path, 777, true);
        }

        $this->full_path = CripFile::canonical($this->base_path);
    }
}