-- phpMyAdmin SQL Dump
-- version 3.2.2.1
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Sep 11, 2013 at 07:28 PM
-- Server version: 5.1.30
-- PHP Version: 5.2.8

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";

--
-- Database: `temploggning`
--

-- --------------------------------------------------------

--
-- Table structure for table `badtunna`
--

CREATE TABLE IF NOT EXISTS `readings` (
  `sensor_id` int NOT NULL,
  `date` datetime NOT NULL,
  `temp` float NOT NULL,
  PRIMARY KEY (`sensor_id`, `date`),
  KEY `Index_1` (`sensor_id`, `date`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `sensors`
--

CREATE TABLE IF NOT EXISTS `sensors` (
  `sensor_id` int NOT NULL,
  `id` varchar(200) NOT NULL,
  `name` varchar(200) NOT NULL,
  `color` varchar(20) DEFAULT NULL,
  `date` datetime NOT NULL,
  PRIMARY KEY (`sensor_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

CREATE UNIQUE INDEX ix_sensor_id ON sensors (id)

-- --------------------------------------------------------