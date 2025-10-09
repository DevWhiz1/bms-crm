-- Create meters_readings table with proper constraints and indexes
CREATE TABLE IF NOT EXISTS `meters_readings` (
  `meter_reading_id` int(11) NOT NULL AUTO_INCREMENT,
  `meter_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_by` int(11) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_by` int(11) DEFAULT NULL,
  `reading_date` date NOT NULL,
  `current_units` varchar(100) NOT NULL,
  `unit_consumed` varchar(100) NOT NULL,
  PRIMARY KEY (`meter_reading_id`),
  UNIQUE KEY `unique_meter_reading` (`meter_id`, `reading_date`),
  KEY `meter_id` (`meter_id`),
  KEY `reading_date` (`reading_date`),
  KEY `created_by` (`created_by`),
  KEY `updated_by` (`updated_by`),
  CONSTRAINT `meters_readings_ibfk_1` FOREIGN KEY (`meter_id`) REFERENCES `meters` (`meter_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `meters_readings_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `meters_readings_ibfk_3` FOREIGN KEY (`updated_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS `idx_meter_id` ON `meters_readings` (`meter_id`);
CREATE INDEX IF NOT EXISTS `idx_reading_date` ON `meters_readings` (`reading_date`);
CREATE INDEX IF NOT EXISTS `idx_created_by` ON `meters_readings` (`created_by`);

-- Add unique constraint to prevent duplicate readings for same meter on same date
ALTER TABLE `meters_readings` 
ADD CONSTRAINT `unique_meter_date` UNIQUE (`meter_id`, `reading_date`);

