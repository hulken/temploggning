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

CREATE TABLE IF NOT EXISTS `badtunna` (
  `date` datetime NOT NULL,
  `temp` float NOT NULL,
  PRIMARY KEY (`date`),
  KEY `Index_1` (`date`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `franluft_efter`
--

CREATE TABLE IF NOT EXISTS `franluft_efter` (
  `date` datetime NOT NULL,
  `temp` float NOT NULL,
  PRIMARY KEY (`date`),
  KEY `Index_1` (`date`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `franluft_fore`
--

CREATE TABLE IF NOT EXISTS `franluft_fore` (
  `date` datetime NOT NULL,
  `temp` float NOT NULL,
  PRIMARY KEY (`date`),
  KEY `Index_1` (`date`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 ROW_FORMAT=FIXED;

-- --------------------------------------------------------

--
-- Table structure for table `inne`
--

CREATE TABLE IF NOT EXISTS `inne` (
  `date` datetime NOT NULL,
  `temp` float NOT NULL,
  PRIMARY KEY (`date`) USING HASH,
  KEY `Index_1` (`date`) USING HASH
) ENGINE=MyISAM DEFAULT CHARSET=latin1 ROW_FORMAT=FIXED;

-- --------------------------------------------------------

--
-- Table structure for table `sensors`
--

CREATE TABLE IF NOT EXISTS `sensors` (
  `id` varchar(200) NOT NULL,
  `name` varchar(200) NOT NULL,
  `color` varchar(20) DEFAULT NULL,
  `date` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `solfangare`
--

CREATE TABLE IF NOT EXISTS `solfangare` (
  `date` datetime NOT NULL,
  `temp` float NOT NULL,
  PRIMARY KEY (`date`),
  KEY `Index_1` (`date`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 ROW_FORMAT=FIXED;

-- --------------------------------------------------------

--
-- Table structure for table `tilluft_efter`
--

CREATE TABLE IF NOT EXISTS `tilluft_efter` (
  `date` datetime NOT NULL,
  `temp` float NOT NULL,
  PRIMARY KEY (`date`),
  KEY `Index_1` (`date`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 ROW_FORMAT=FIXED;

-- --------------------------------------------------------

--
-- Table structure for table `tilluft_fore`
--

CREATE TABLE IF NOT EXISTS `tilluft_fore` (
  `date` datetime NOT NULL,
  `temp` float NOT NULL,
  PRIMARY KEY (`date`),
  KEY `Index_1` (`date`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 ROW_FORMAT=FIXED;

-- --------------------------------------------------------

--
-- Table structure for table `ute`
--

CREATE TABLE IF NOT EXISTS `ute` (
  `date` datetime NOT NULL,
  `temp` float NOT NULL,
  PRIMARY KEY (`date`),
  KEY `Index_1` (`date`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 ROW_FORMAT=FIXED;

-- --------------------------------------------------------

--
-- Table structure for table `uterum`
--

CREATE TABLE IF NOT EXISTS `uterum` (
  `date` datetime NOT NULL,
  `temp` float NOT NULL,
  PRIMARY KEY (`date`),
  KEY `Index_1` (`date`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 ROW_FORMAT=FIXED;

-- --------------------------------------------------------

--
-- Table structure for table `vvb`
--

CREATE TABLE IF NOT EXISTS `vvb` (
  `date` datetime NOT NULL,
  `temp` float NOT NULL,
  PRIMARY KEY (`date`),
  KEY `Index_1` (`date`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 ROW_FORMAT=FIXED;
