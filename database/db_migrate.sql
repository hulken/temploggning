
-- SENSORS
ALTER TABLE `sensors` ADD `sensor_id` int NOT NULL, DROP PRIMARY KEY;
UPDATE `sensors` SET `sensor_id` = CONV(`id`,16,11);
ALTER TABLE `sensors` ADD PRIMARY KEY (`sensor_id`);
CREATE UNIQUE INDEX ix_sensor_id ON sensors (id);

-- READINGS
CREATE TABLE IF NOT EXISTS `readings` (
  `sensor_id` int NOT NULL,
  `date` datetime NOT NULL,
  `temp` float NOT NULL,
  PRIMARY KEY (`sensor_id`, `date`),
  KEY `Index_1` (`sensor_id`, `date`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- OLD DATA
INSERT INTO readings SELECT 23, date, temp FROM franluft_efter;
INSERT INTO readings SELECT 2430634, date, temp FROM vvb;
INSERT INTO readings SELECT 234694, date, temp FROM tilluft_efter;
INSERT INTO readings SELECT 23232, date, temp FROM solfangare;
INSERT INTO readings SELECT 246735218, date, temp FROM ute;
INSERT INTO readings SELECT 2387, date, temp FROM tilluft_fore;
INSERT INTO readings SELECT 23510859, date, temp FROM uterum;
INSERT INTO readings SELECT 2147483647, date, temp FROM inne;
INSERT INTO readings SELECT 23501474, date, temp FROM badtunna;

--DROP TABLE franluft_efter, vvb, tilluft_efter, solfangare, ute, tilluft_fore, uterum, inne, badtunna;
ANALYZE TABLE readings;
OPTIMIZE TABLE readings;