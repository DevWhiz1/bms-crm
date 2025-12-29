-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 23, 2025 at 09:01 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.1.25

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `bms`
--

-- --------------------------------------------------------

--
-- Table structure for table `apartments`
--

CREATE TABLE `apartments` (
  `apartment_id` int(11) NOT NULL,
  `apartment_no` varchar(20) NOT NULL,
  `floor_no` tinyint(4) NOT NULL,
  `owner_id` int(11) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `apartments`
--

INSERT INTO `apartments` (`apartment_id`, `apartment_no`, `floor_no`, `owner_id`) VALUES
(1, '1', 1, 1),
(2, '2', 1, NULL),
(3, '3', 1, NULL),
(4, '4', 1, NULL),
(5, '5', 1, NULL),
(6, '6', 1, NULL),
(7, '7', 1, NULL),
(8, '1', 2, NULL),
(9, '2', 2, NULL),
(12, '3', 2, NULL),
(13, '4', 2, NULL),
(14, '5', 2, NULL),
(15, '6', 2, NULL),
(16, '7', 2, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `apartments_owners`
--

CREATE TABLE `apartments_owners` (
  `apartment_owner_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_by` int(11) UNSIGNED DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_by` int(11) DEFAULT NULL,
  `owner_id` int(11) UNSIGNED NOT NULL,
  `apartment_id` int(11) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `apartments_owners`
--

INSERT INTO `apartments_owners` (`apartment_owner_id`, `created_at`, `created_by`, `updated_at`, `updated_by`, `owner_id`, `apartment_id`, `is_active`) VALUES
(1, '2025-12-23 07:48:24', 2, '2025-12-23 07:50:30', 2, 1, 7, 0),
(2, '2025-12-23 07:50:30', 2, '2025-12-23 07:55:08', 2, 1, 2, 0),
(3, '2025-12-23 07:50:30', 2, '2025-12-23 07:55:08', 2, 1, 8, 0),
(4, '2025-12-23 07:55:08', 2, '2025-12-23 07:55:08', 2, 1, 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `apartments_tenants`
--

CREATE TABLE `apartments_tenants` (
  `apartment_tenant_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_by` int(11) UNSIGNED DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_by` int(11) DEFAULT NULL,
  `tenant_id` int(11) NOT NULL,
  `apartment_id` int(11) NOT NULL,
  `contract_id` int(11) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `apartments_tenants`
--

INSERT INTO `apartments_tenants` (`apartment_tenant_id`, `created_at`, `created_by`, `updated_at`, `updated_by`, `tenant_id`, `apartment_id`, `contract_id`, `is_active`) VALUES
(1, '2025-09-16 07:26:26', 2, '2025-09-16 08:08:25', 2, 4, 1, 2, 0),
(2, '2025-09-16 07:26:26', 2, '2025-09-16 08:08:25', 2, 4, 16, 2, 0),
(3, '2025-09-16 07:54:59', 2, '2025-09-16 08:08:25', 2, 4, 1, 2, 0),
(4, '2025-09-16 07:54:59', 2, '2025-09-16 08:08:25', 2, 4, 16, 2, 0),
(5, '2025-09-16 07:55:20', 2, '2025-09-16 08:08:25', 2, 4, 1, 2, 0),
(6, '2025-09-16 07:55:20', 2, '2025-09-16 08:08:25', 2, 4, 16, 2, 0),
(7, '2025-09-16 07:55:30', 2, '2025-09-16 08:08:25', 2, 4, 1, 2, 0),
(8, '2025-09-16 07:55:30', 2, '2025-09-16 08:08:25', 2, 4, 16, 2, 0),
(9, '2025-09-16 07:58:10', 2, '2025-09-16 08:08:25', 2, 4, 1, 2, 0),
(10, '2025-09-16 07:58:10', 2, '2025-09-16 08:08:25', 2, 4, 16, 2, 0),
(11, '2025-09-16 07:58:10', 2, '2025-09-16 08:08:25', 2, 4, 9, 2, 0),
(12, '2025-09-16 08:08:25', 2, '2025-09-16 08:08:25', 2, 3, 1, 2, 1),
(13, '2025-09-16 08:08:25', 2, '2025-09-16 08:08:25', 2, 3, 16, 2, 1),
(14, '2025-09-16 08:11:02', 2, '2025-09-16 08:11:02', 2, 1, 1, 1, 1),
(15, '2025-09-16 08:11:02', 2, '2025-09-16 08:11:02', 2, 1, 7, 1, 1),
(16, '2025-10-07 13:29:48', 2, '2025-10-09 12:30:32', 2, 1, 5, 3, 0),
(17, '2025-10-07 13:29:48', 2, '2025-10-09 12:30:32', 2, 1, 4, 3, 0),
(18, '2025-10-09 12:32:52', 2, '2025-10-09 12:32:52', 2, 5, 2, 4, 1);

-- --------------------------------------------------------

--
-- Table structure for table `contracts`
--

CREATE TABLE `contracts` (
  `contract_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_by` int(11) UNSIGNED DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_by` int(11) DEFAULT NULL,
  `rent` varchar(100) NOT NULL,
  `service_charges` varchar(100) NOT NULL,
  `security_fees` varchar(100) NOT NULL,
  `contract_start_date` date NOT NULL,
`contract_end_date` date NOT NULL,
`is_active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
--
-- Table structure for table `contract_apartment_charges`
--

CREATE TABLE `contract_apartment_charges` (
  `contract_apartment_charge_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_by` int(11) UNSIGNED DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_by` int(11) DEFAULT NULL,
  `contract_id` int(11) NOT NULL,
  `apartment_id` int(11) NOT NULL,
  `rent` varchar(100) NOT NULL,
  `service_charges` varchar(100) NOT NULL,
  `security_fees` varchar(100) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `contracts`
--

INSERT INTO `contracts` (`contract_id`, `created_at`, `created_by`, `updated_at`, `updated_by`, `rent`, `service_charges`, `security_fees`, `contract_start_date`, `contract_end_date`, `is_active`) VALUES
(1, '2025-09-16 07:22:31', 2, '2025-09-16 08:11:02', 2, '500000', '3000', '250000', '2025-08-30', '2027-10-14', 1),
(2, '2025-09-16 07:26:26', 2, '2025-09-16 08:08:25', 2, '500000', '3000', '250000', '2025-08-26', '2027-10-10', 1),
(3, '2025-10-07 13:29:48', 2, '2025-10-09 12:30:32', 2, '500000', '3000', '250000', '2025-10-09', '2026-06-09', 0),
(4, '2025-10-09 12:32:52', 2, '2025-10-09 12:32:52', 2, '25000', '3000', '70000', '2024-12-31', '2026-05-31', 1);

-- --------------------------------------------------------

--
-- Table structure for table `meters`
--

CREATE TABLE `meters` (
  `meter_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `apartment_id` int(11) UNSIGNED DEFAULT NULL,
  `meter_serial_no` varchar(50) NOT NULL,
  `meter_type` tinyint(4) NOT NULL COMMENT '1 for wapda, 2 for generator, 3 for water'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `meters`
--

INSERT INTO `meters` (`meter_id`, `created_at`, `updated_at`, `apartment_id`, `meter_serial_no`, `meter_type`) VALUES
(1, '2025-10-09 06:20:15', '2025-10-09 06:21:09', 2, 'S-324423', 1),
(2, '2025-10-09 09:48:41', '2025-10-09 12:33:27', 2, '56575', 2),
(3, '2025-10-09 12:33:45', '2025-10-09 12:33:45', 2, '423232', 3);

-- --------------------------------------------------------

--
-- Table structure for table `meters_readings`
--

CREATE TABLE `meters_readings` (
  `meter_reading_id` int(11) NOT NULL,
  `meter_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_by` int(11) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_by` int(11) DEFAULT NULL,
  `reading_date` date NOT NULL,
  `current_units` varchar(100) NOT NULL,
  `unit_consumed` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `meters_readings`
--

INSERT INTO `meters_readings` (`meter_reading_id`, `meter_id`, `created_at`, `created_by`, `updated_at`, `updated_by`, `reading_date`, `current_units`, `unit_consumed`) VALUES
(1, 1, '2025-10-09 08:33:31', 2, '2025-10-09 12:34:25', 2, '2025-09-28', '100', '100'),
(3, 1, '2025-10-09 12:34:54', 2, '2025-10-09 12:34:54', NULL, '2025-10-15', '250', '150'),
(4, 2, '2025-10-09 12:35:22', 2, '2025-10-09 12:35:22', NULL, '2025-10-15', '250', '130');

-- --------------------------------------------------------

--
-- Table structure for table `monthly_bills`
--

CREATE TABLE `monthly_bills` (
  `monthly_bill_id` int(11) NOT NULL,
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
  `security_fees` varchar(100) DEFAULT NULL,
  `arrears` varchar(100) DEFAULT NULL,
  `additional_charges` int(100) DEFAULT NULL,
  `bill_issue_date` date NOT NULL,
  `bill_due_date` date NOT NULL,
  `is_bill_paid` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `monthly_bills`
--

INSERT INTO `monthly_bills` (`monthly_bill_id`, `created_at`, `created_by`, `updated_at`, `updated_by`, `contract_id`, `wapda_unit_consumed`, `wapda_per_unit_rate`, `wapda_bill`, `generator_unit_consumed`, `generator_per_unit_rate`, `generator_bill`, `water_unit_consumed`, `water_per_unit_rate`, `water_bill`, `management_charges`, `rent`, `security_fees`, `arrears`, `additional_charges`, `bill_issue_date`, `bill_due_date`, `is_bill_paid`) VALUES
(4, '2025-10-09 12:36:40', 2, '2025-10-09 12:36:40', NULL, 1, '0.00', '350', '0.00', '0.00', '205', '0.00', '0.00', '120', '0.00', '3000', '500000', '0.00', '0.00', 0, '2025-10-10', '2025-10-15', 0),
(5, '2025-10-09 12:36:40', 2, '2025-10-09 12:36:40', NULL, 2, '0.00', '350', '0.00', '0.00', '205', '0.00', '0.00', '120', '0.00', '3000', '500000', '0.00', '0.00', 0, '2025-10-10', '2025-10-15', 0),
(6, '2025-10-09 12:36:40', 2, '2025-10-09 12:36:40', NULL, 4, '150.00', '350', '52500.00', '130.00', '205', '26650.00', '0.00', '120', '0.00', '3000', '25000', '0.00', '0.00', 0, '2025-10-10', '2025-10-15', 0);

-- --------------------------------------------------------

--
-- Table structure for table `owners`
--

CREATE TABLE `owners` (
  `owner_id` int(11) UNSIGNED NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_by` int(11) UNSIGNED DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_by` int(11) UNSIGNED DEFAULT NULL,
  `full_name` varchar(100) NOT NULL,
  `cnic` varchar(15) NOT NULL,
  `phone_no` varchar(15) DEFAULT NULL,
  `photo` text DEFAULT NULL,
  `cnic_photo` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `owners`
--

INSERT INTO `owners` (`owner_id`, `created_at`, `created_by`, `updated_at`, `updated_by`, `full_name`, `cnic`, `phone_no`, `photo`, `cnic_photo`, `is_active`) VALUES
(1, '2025-12-23 07:26:08', 2, '2025-12-23 07:26:49', 2, 'test owner', '11119-1111619-9', '+923407005883', 'uploads\\owners\\photos\\diff-1766474768328-289999170.png', 'uploads\\owners\\cnic-photos\\Gemini-Generated-Image-ca3hmcca3hmcca3h-1766474768391-942260555.png', 1);

-- --------------------------------------------------------

--
-- Table structure for table `tenants`
--

CREATE TABLE `tenants` (
  `tenant_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_by` int(11) UNSIGNED DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_by` int(11) DEFAULT NULL,
  `full_name` varchar(100) NOT NULL,
  `cnic` varchar(15) NOT NULL,
  `mobile_no` varchar(15) DEFAULT NULL,
  `phone_no` varchar(15) DEFAULT NULL,
  `photo` text DEFAULT NULL,
  `cnic_photo` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tenants`
--

INSERT INTO `tenants` (`tenant_id`, `created_at`, `created_by`, `updated_at`, `updated_by`, `full_name`, `cnic`, `mobile_no`, `phone_no`, `photo`, `cnic_photo`, `is_active`) VALUES
(1, '2025-09-03 11:22:25', 2, '2025-09-04 06:08:21', 2, 'Test', '11119-1111119-9', '+923407005883', '+923407005883', 'uploads\\tenants\\photos\\Pakistan flag art-1756898545633-509045528.jpeg', 'uploads\\tenants\\cnic-photos\\WhatsApp Image 2025-03-23 at 09.50.41_673f0cb5-1756898545637-346775035.jpg', 0),
(2, '2025-09-04 06:06:19', 2, '2025-09-04 06:13:30', 2, 'Test sample', '11119-1111119-3', '+923407005883', '+923407005883', 'uploads\\tenants\\photos\\Screenshot-2025-08-28-153856-1756965979210-667349430.png', 'uploads\\tenants\\cnic-photos\\Gemini-Generated-Image-czjxl1czjxl1czjx-1756965979224-195082140.png', 1),
(3, '2025-09-04 06:14:58', 2, '2025-09-04 11:41:04', 2, 'sAMPLE', '11119-1111119-1', '+923407005883', '+923407005883', 'uploads\\tenants\\photos\\profilepic-1-1-1756966498664-520975673.jpg', 'uploads\\tenants\\cnic-photos\\Rush-1756966498706-636115822.png', 1),
(4, '2025-09-04 10:34:16', 2, '2025-09-04 10:34:28', 2, 'test tenant', '11119-1111119-5', '+923407005883', '+923407005883', 'uploads\\tenants\\photos\\Screenshot-2025-08-28-153856-1756982056051-556943494.png', 'uploads\\tenants\\cnic-photos\\cnic-ftont-1-1-1756982056068-633198774.jpg', 0),
(5, '2025-10-09 12:31:56', 2, '2025-10-09 12:31:56', 2, 'Ali', '96119-1146119-9', '+923407005883', '+923407005883', NULL, NULL, 1);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `full_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `password` varchar(100) NOT NULL,
  `token` varchar(512) DEFAULT NULL,
  `account_level` tinyint(4) DEFAULT 1,
  `is_active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `created_at`, `updated_at`, `full_name`, `email`, `password_hash`, `password`, `token`, `account_level`, `is_active`) VALUES
(1, '2025-09-03 07:38:48', '2025-09-03 07:38:48', 'Test User', 'test@example.com', '$2a$12$n.VWYnIxZJ0SWvR4V6heb.cwfr6Q25TlQpkrwGqBIDCe4Z.Foe1U6', 'TestPass123', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJmdWxsX25hbWUiOiJUZXN0IFVzZXIiLCJhY2NvdW50X2xldmVsIjoxLCJpYXQiOjE3NTY4ODUxMjgsImV4cCI6MTc1Njk3MTUyOH0.6TfsPT_LTY-rkL6HS0cAYWFnScnVtD936e-DIqk1fGc', 1, 1),
(2, '2025-09-03 09:10:53', '2025-12-23 07:45:21', 'admin', 'admin01@gmail.com', '$2a$12$RFRCUe47O7.x5riVnOlt4eMvVBcOOnj64baT1JUnaO4QYj4qR61c2', 'Admin@54321', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoyLCJlbWFpbCI6ImFkbWluMDFAZ21haWwuY29tIiwiZnVsbF9uYW1lIjoiYWRtaW4iLCJhY2NvdW50X2xldmVsIjoxLCJpYXQiOjE3NjY0NzU5MjEsImV4cCI6MTc4Mzc1NTkyMX0.NIZ_lCQj-m44W3wJ3lv0dpkAMgh8H6nraLizptC3Q0M', 1, 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `apartments`
--
ALTER TABLE `apartments`
  ADD PRIMARY KEY (`apartment_id`),
  ADD KEY `apartments_owner_id_fk` (`owner_id`);

--
-- Indexes for table `apartments_owners`
--
ALTER TABLE `apartments_owners`
  ADD PRIMARY KEY (`apartment_owner_id`),
  ADD KEY `owner_id` (`owner_id`),
  ADD KEY `apartment_id` (`apartment_id`);

--
-- Indexes for table `apartments_tenants`
--
ALTER TABLE `apartments_tenants`
  ADD PRIMARY KEY (`apartment_tenant_id`),
  ADD KEY `tenant_id` (`tenant_id`),
  ADD KEY `apartment_id` (`apartment_id`),
  ADD KEY `contract_id` (`contract_id`);

--
-- Indexes for table `contracts`
--
ALTER TABLE `contracts`
  ADD PRIMARY KEY (`contract_id`);

--
-- Indexes for table `contract_apartment_charges`
--
ALTER TABLE `contract_apartment_charges`
  ADD PRIMARY KEY (`contract_apartment_charge_id`),
  ADD UNIQUE KEY `uniq_contract_apartment` (`contract_id`,`apartment_id`),
  ADD KEY `idx_contract_apartment` (`apartment_id`);

--
-- Indexes for table `meters`
--
ALTER TABLE `meters`
  ADD PRIMARY KEY (`meter_id`);

--
-- Indexes for table `meters_readings`
--
ALTER TABLE `meters_readings`
  ADD PRIMARY KEY (`meter_reading_id`),
  ADD KEY `meter_id` (`meter_id`);

--
-- Indexes for table `monthly_bills`
--
ALTER TABLE `monthly_bills`
  ADD PRIMARY KEY (`monthly_bill_id`),
  ADD KEY `contract_id` (`contract_id`);

--
-- Indexes for table `owners`
--
ALTER TABLE `owners`
  ADD PRIMARY KEY (`owner_id`),
  ADD UNIQUE KEY `uniq_cnic` (`cnic`);

--
-- Indexes for table `tenants`
--
ALTER TABLE `tenants`
  ADD PRIMARY KEY (`tenant_id`),
  ADD UNIQUE KEY `cnic` (`cnic`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `apartments`
--
ALTER TABLE `apartments`
  MODIFY `apartment_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `apartments_owners`
--
ALTER TABLE `apartments_owners`
  MODIFY `apartment_owner_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `apartments_tenants`
--
ALTER TABLE `apartments_tenants`
  MODIFY `apartment_tenant_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `contracts`
--
ALTER TABLE `contracts`
  MODIFY `contract_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `contract_apartment_charges`
--
ALTER TABLE `contract_apartment_charges`
  MODIFY `contract_apartment_charge_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `meters`
--
ALTER TABLE `meters`
  MODIFY `meter_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `meters_readings`
--
ALTER TABLE `meters_readings`
  MODIFY `meter_reading_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `monthly_bills`
--
ALTER TABLE `monthly_bills`
  MODIFY `monthly_bill_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `owners`
--
ALTER TABLE `owners`
  MODIFY `owner_id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `tenants`
--
ALTER TABLE `tenants`
  MODIFY `tenant_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `apartments`
--
ALTER TABLE `apartments`
  ADD CONSTRAINT `apartments_owner_id_fk` FOREIGN KEY (`owner_id`) REFERENCES `owners` (`owner_id`) ON DELETE SET NULL;

--
-- Constraints for table `apartments_owners`
--
ALTER TABLE `apartments_owners`
  ADD CONSTRAINT `apartments_owners_fk_1` FOREIGN KEY (`owner_id`) REFERENCES `owners` (`owner_id`),
  ADD CONSTRAINT `apartments_owners_fk_2` FOREIGN KEY (`apartment_id`) REFERENCES `apartments` (`apartment_id`);

--
-- Constraints for table `apartments_tenants`
--
ALTER TABLE `apartments_tenants`
  ADD CONSTRAINT `apartments_tenants_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`),
  ADD CONSTRAINT `apartments_tenants_ibfk_2` FOREIGN KEY (`apartment_id`) REFERENCES `apartments` (`apartment_id`),
  ADD CONSTRAINT `apartments_tenants_ibfk_3` FOREIGN KEY (`contract_id`) REFERENCES `contracts` (`contract_id`);

--
-- Constraints for table `meters_readings`
--
ALTER TABLE `meters_readings`
  ADD CONSTRAINT `meters_readings_ibfk_1` FOREIGN KEY (`meter_id`) REFERENCES `meters` (`meter_id`);

--
-- Constraints for table `monthly_bills`
--
ALTER TABLE `monthly_bills`
  ADD CONSTRAINT `monthly_bills_ibfk_1` FOREIGN KEY (`contract_id`) REFERENCES `contracts` (`contract_id`);
--
-- Constraints for table `contract_apartment_charges`
--
ALTER TABLE `contract_apartment_charges`
  ADD CONSTRAINT `contract_apartment_charges_contract_fk` FOREIGN KEY (`contract_id`) REFERENCES `contracts` (`contract_id`),
  ADD CONSTRAINT `contract_apartment_charges_apartment_fk` FOREIGN KEY (`apartment_id`) REFERENCES `apartments` (`apartment_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
