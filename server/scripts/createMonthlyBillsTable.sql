-- Create monthly_bills table with proper constraints and indexes
CREATE TABLE IF NOT EXISTS `monthly_bills` (
  `monthly_bill_id` int(11) NOT NULL AUTO_INCREMENT,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_by` int(11) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_by` int(11) DEFAULT NULL,
  `contract_id` int(11) NOT NULL,
  `wapda_unit_consumed` varchar(100) DEFAULT NULL,
  `wapda_per_unit_rate` varchar(100) DEFAULT NULL,
  `wapda_bill` varchar(100) DEFAULT NULL,
  `generator_unit_consumed` varchar(100) DEFAULT NULL,
  `generator_per_unit_rate` varchar(100) DEFAULT NULL,
  `generator_bill` varchar(100) DEFAULT NULL,
  `water_unit_consumed` varchar(100) DEFAULT NULL,
  `water_per_unit_rate` varchar(100) DEFAULT NULL,
  `water_bill` varchar(100) DEFAULT NULL,
  `management_charges` varchar(100) DEFAULT NULL,
  `rent` varchar(100) DEFAULT NULL,
  `arrears` varchar(100) DEFAULT NULL,
  `additional_charges` int(100) DEFAULT NULL,
  `bill_issue_date` date NOT NULL,
  `bill_due_date` date NOT NULL,
  `is_bill_paid` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`monthly_bill_id`),
  KEY `contract_id` (`contract_id`),
  KEY `bill_issue_date` (`bill_issue_date`),
  KEY `bill_due_date` (`bill_due_date`),
  KEY `is_bill_paid` (`is_bill_paid`),
  KEY `created_by` (`created_by`),
  KEY `updated_by` (`updated_by`),
  CONSTRAINT `monthly_bills_ibfk_1` FOREIGN KEY (`contract_id`) REFERENCES `contracts` (`contract_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `monthly_bills_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `monthly_bills_ibfk_3` FOREIGN KEY (`updated_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS `idx_contract_id` ON `monthly_bills` (`contract_id`);
CREATE INDEX IF NOT EXISTS `idx_bill_issue_date` ON `monthly_bills` (`bill_issue_date`);
CREATE INDEX IF NOT EXISTS `idx_is_bill_paid` ON `monthly_bills` (`is_bill_paid`);
CREATE INDEX IF NOT EXISTS `idx_month` ON `monthly_bills` ((DATE_FORMAT(`bill_issue_date`, '%Y-%m')));

