CREATE TABLE `tbl_users` (
    `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
    `username` varchar(50) DEFAULT NULL UNIQUE,
    `email` varchar(255) NOT NULL,
    `password` varchar(255) NOT NULL,
    `phone` varchar(15) DEFAULT NULL,
    `avatar` varchar(500) DEFAULT NULL,
    `address` varchar(255) DEFAULT NULL,
    `role` tinyint(1) UNSIGNED NOT NULL DEFAULT '1' COMMENT '1 for Guest, 2 for Organizer, 3 for Admin',
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY(`id`)
  );


  ALTER TABLE `tbl_users` ADD COLUMN
  reset_token varchar(6);

    ALTER TABLE `tbl_users` ADD COLUMN
  reset_token_expiration DATETIME

  ALTER TABLE tbl_users ADD COLUMN avatar_public_id varchar(255)