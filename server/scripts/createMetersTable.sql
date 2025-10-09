-- Create meters table with proper constraints and indexes
CREATE TABLE IF NOT EXISTS `meters` (
  `meter_id` int(11) NOT NULL AUTO_INCREMENT,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `apartment_id` int(11) UNSIGNED DEFAULT NULL,
  `meter_serial_no` varchar(50) NOT NULL,
  `meter_type` tinyint(4) NOT NULL COMMENT '1 for wapda, 2 for generator, 3 for water',
  PRIMARY KEY (`meter_id`),
  UNIQUE KEY `meter_serial_no` (`meter_serial_no`),
  KEY `apartment_id` (`apartment_id`),
  KEY `meter_type` (`meter_type`),
  KEY `created_at` (`created_at`),
  CONSTRAINT `meters_ibfk_1` FOREIGN KEY (`apartment_id`) REFERENCES `apartments` (`apartment_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS `idx_meter_type` ON `meters` (`meter_type`);
CREATE INDEX IF NOT EXISTS `idx_apartment_id` ON `meters` (`apartment_id`);
CREATE INDEX IF NOT EXISTS `idx_created_at` ON `meters` (`created_at`);

-- Add unique constraint on meter_serial_no if not exists
ALTER TABLE `meters` 
ADD CONSTRAINT `unique_meter_serial_no` UNIQUE (`meter_serial_no`);

