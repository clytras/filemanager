<?php namespace Crip\FileManager\Exceptions;

use Crip\Core\Contracts\ICripObject;
use Crip\Core\Exceptions\BaseCripException;
use Crip\FileManager\FileManager;
use Exception;

class FileManagerException extends BaseCripException
{
    /**
     * @param ICripObject $object
     * @param string $locale_key
     * @param array $parameters
     * @param int $code
     * @param Exception|null $previous
     */
    public function __construct(
        ICripObject $object,
        $locale_key,
        $parameters = [],
        $code = 0,
        Exception $previous = null
    ) {
        $message = FileManager::package()->trans($locale_key, $parameters);
        parent::__construct($object, $message, $code, $previous);
    }
}