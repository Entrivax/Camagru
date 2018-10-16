<?php
    require "../config/database.php";

    class Db extends PDO
    {
        function __construct($setupEnv = false)
        {
            global $DB_DSN_NO_DB, $DB_DSN, $DB_USER, $DB_PASSWORD;
            parent::__construct($setupEnv ? $DB_DSN_NO_DB : $DB_DSN, $DB_USER, $DB_PASSWORD);
            $this->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->exec('SET time_zone = "+00:00"');
        }
    }
?>