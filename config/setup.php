<?php
    require '../db/db.php';

    $db = new Db(true);

    $db->query("CREATE DATABASE IF NOT EXISTS `$DB_NAME`;");
    $db->query("use $DB_NAME");
    $db->query("SET FOREIGN_KEY_CHECKS = 0;");
    $db->query("CREATE TABLE IF NOT EXISTS `users` (
                    `id` BIGINT NOT NULL AUTO_INCREMENT,
                    `username` VARCHAR(24) NOT NULL,
                    `email` VARCHAR(320) NOT NULL,
                    `password` VARCHAR(255) NOT NULL,
                    `creationDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    `token` VARCHAR(60),
                    `resetToken` VARCHAR(60),
                    `sendMailOnComment` BOOLEAN NOT NULL DEFAULT TRUE,
                    PRIMARY KEY (`id`),
                    UNIQUE (`id`),
                    UNIQUE (`username`),
                    UNIQUE (`email`)
                ) ENGINE=InnoDB CHARSET=utf8 COLLATE utf8_unicode_ci;");
    $db->query("CREATE TABLE IF NOT EXISTS `posts` (
                    `id` BIGINT NOT NULL AUTO_INCREMENT,
                    `userId` BIGINT NOT NULL,
                    `fileName` VARCHAR(53) NOT NULL,
                    `date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    PRIMARY KEY (`id`),
                    UNIQUE (`id`),
                    KEY `userId` (`userId`),
                    CONSTRAINT `fk_posts_users` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
                ) ENGINE=InnoDB CHARSET=utf8 COLLATE utf8_bin;");
    $db->query("CREATE TABLE IF NOT EXISTS `likes` (
                    `userId` BIGINT NOT NULL,
                    `postId` BIGINT NOT NULL,
                    `date` DATETIME NOT NULL,
                    UNIQUE (`userId`, `postId`),
                    KEY `postId` (`postId`),
                    CONSTRAINT `fk_likes_users` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
                    CONSTRAINT `fk_likes_posts` FOREIGN KEY (`postId`) REFERENCES `posts` (`id`) ON DELETE CASCADE
                ) ENGINE=InnoDB;");
    $db->query("CREATE TABLE IF NOT EXISTS `comments` (
                    `id` BIGINT NOT NULL AUTO_INCREMENT,
                    `userId` BIGINT NOT NULL,
                    `postId` BIGINT NOT NULL,
                    `comment` TEXT COLLATE utf8_bin NOT NULL,
                    `date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE (`id`),
                    KEY `userId` (`userId`),
                    KEY `postId` (`postId`),
                    CONSTRAINT `fk_comments_users` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
                    CONSTRAINT `fk_comments_posts` FOREIGN KEY (`postId`) REFERENCES `posts` (`id`) ON DELETE CASCADE
                ) ENGINE=InnoDB CHARSET=utf8 COLLATE utf8_bin;");
    $db->query("CREATE TABLE IF NOT EXISTS `session_tokens` (
                    `token` VARCHAR(60) NOT NULL,
                    `userId` BIGINT NOT NULL,
                    `expire` DATETIME NOT NULL,
                    `creationDate` DATETIME NOT NULL,
                    `userAgent` VARCHAR(200) NOT NULL,
                    `ip` VARCHAR(45) NOT NULL,
                    UNIQUE (`token`),
                    KEY `userId` (`userId`),
                    CONSTRAINT `fk_session_tokens_users` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
                ) ENGINE=InnoDB CHARSET=utf8 COLLATE utf8_bin;;");
    $db->query("SET FOREIGN_KEY_CHECKS = 1;");

    if (!file_exists('../usr')) {
        mkdir('../usr');
    }

    echo ('Finished!');
?>