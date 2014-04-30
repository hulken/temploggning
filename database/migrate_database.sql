-- Note: You need to set the correct current version below!!!!
DECLARE @current_version int = 3;

IF (@current_version == 1) BEGIN
	-- Create new readings table
	CREATE TABLE IF NOT EXISTS `readings` (
	  `sensor_id` int NOT NULL,
	  `date` datetime NOT NULL,
	  `temp` float NOT NULL,
	  PRIMARY KEY (`sensor_id`, `date`)
	) ENGINE=MyISAM DEFAULT CHARSET=latin1;
	
	-- Update sensors table schema to version 2
	ALTER TABLE `sensors` ADD COLUMN `sensor_id` int NOT NULL;

	-- Set the id:s properly
	UPDATE `sensors` SET sensor_id = 1 WHERE name = 'franluft_efter';
	UPDATE `sensors` SET sensor_id = 2 WHERE name = 'vvb';
	UPDATE `sensors` SET sensor_id = 3 WHERE name = 'tilluft_efter';
	UPDATE `sensors` SET sensor_id = 4 WHERE name = 'solfangare';
	UPDATE `sensors` SET sensor_id = 5 WHERE name = 'ute';
	UPDATE `sensors` SET sensor_id = 6 WHERE name = 'tilluft_fore';
	UPDATE `sensors` SET sensor_id = 7 WHERE name = 'uterum';
	UPDATE `sensors` SET sensor_id = 8 WHERE name = 'inne';
	UPDATE `sensors` SET sensor_id = 9 WHERE name = 'badtunna';
	
	ALTER TABLE `sensors` DROP PRIMARY KEY;
	ALTER TABLE `sensors` ADD PRIMARY KEY (`sensor_id`);
	ALTER TABLE `sensors` ADD UNIQUE `ix_id` (`id`);
	
    ALTER TABLE `sensors` CHANGE `sensor_id` `sensor_id` INT( 11 ) NOT NULL AUTO_INCREMENT 
    
	-- Get all of the sensor data into the readings table
	INSERT INTO readings (`sensor_id`, `date`, `temp`) SELECT 1, franluft_efter.`date`, franluft_efter.`temp` FROM franluft_efter;
	INSERT INTO readings (`sensor_id`, `date`, `temp`) SELECT 2, vvb.`date`, vvb.`temp` FROM vvb;
	INSERT INTO readings (`sensor_id`, `date`, `temp`) SELECT 3, tilluft_efter.`date`, tilluft_efter.`temp` FROM tilluft_efter;
	INSERT INTO readings (`sensor_id`, `date`, `temp`) SELECT 4, solfangare.`date`, solfangare.`temp` FROM solfangare;
	INSERT INTO readings (`sensor_id`, `date`, `temp`) SELECT 5, ute.`date`, ute.`temp` FROM ute;
	INSERT INTO readings (`sensor_id`, `date`, `temp`) SELECT 6, tilluft_fore.`date`, tilluft_fore.`temp` FROM tilluft_fore;
	INSERT INTO readings (`sensor_id`, `date`, `temp`) SELECT 7, uterum.`date`, uterum.`temp` FROM uterum;
	INSERT INTO readings (`sensor_id`, `date`, `temp`) SELECT 8, inne.`date`, inne.`temp` FROM inne;
	INSERT INTO readings (`sensor_id`, `date`, `temp`) SELECT 9, badtunna.`date`, badtunna.`temp` FROM badtunna;

	-- Remove old sensor tables

END
ELSE IF (@current_version == 2) BEGIN

	-- Add new columns to sensors-table
	ALTER TABLE  `sensors` ADD  `sensor_type` INT NOT NULL ,
		ADD  `sensor_unit` VARCHAR( 200 ) NOT NULL

	ALTER TABLE  `temploggning`.`sensors` DROP INDEX  `ix_id` ,
		ADD UNIQUE  `ix_id` (  `id` ,  `sensor_type` )
END
ELSE IF (@current_version == 3) BEGIN

	-- Add new column to sensors-table
	ALTER TABLE  `sensors` ADD  `hidden` BOOLEAN NOT NULL
	
END
ELSE IF (@current_version == 4) BEGIN
	PRINT 'Your database schema is already up to date';
END