<?php

/**
 * Hostinger Shared Hosting - Laravel Entry Point
 * 
 * On Hostinger, the document root is public_html/.
 * Laravel's public folder must be mapped here.
 * 
 * Upload this file to: public_html/index.php
 * Upload the store/ folder to: store/ (one level above public_html)
 */

// Adjust this path to where you uploaded the store folder on Hostinger
// Typically: /home/yourUsername/store/public/index.php
define('LARAVEL_ROOT', __DIR__ . '/../store/public');

$_SERVER['SCRIPT_FILENAME'] = LARAVEL_ROOT . '/index.php';
$_SERVER['SCRIPT_NAME'] = '/index.php';

require LARAVEL_ROOT . '/index.php';
