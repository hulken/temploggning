CREATE TABLE IF NOT EXISTS `readings_part_year` (
  `sensor_id` int NOT NULL,
  `date` datetime NOT NULL,
  `temp` float NOT NULL,
  PRIMARY KEY (`sensor_id`, `date`),
  KEY `Index_1` (`sensor_id`, `date`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1
PARTITION BY RANGE ( year(date) ) (
	PARTITION p2007 VALUES LESS THAN (2007),
	PARTITION p2008 VALUES LESS THAN (2008),
	PARTITION p2009 VALUES LESS THAN (2009),
	PARTITION p2010 VALUES LESS THAN (2010),
	PARTITION p2011 VALUES LESS THAN (2011),
	PARTITION p2012 VALUES LESS THAN (2012),
	PARTITION p2013 VALUES LESS THAN (2013),
	PARTITION p2014 VALUES LESS THAN (2014),
	PARTITION p2015 VALUES LESS THAN (2015),
	PARTITION p2016 VALUES LESS THAN (2016),
	PARTITION p2017 VALUES LESS THAN (2017),
	PARTITION p2018 VALUES LESS THAN (2018),
	PARTITION p2019 VALUES LESS THAN (2019),
	PARTITION p2020 VALUES LESS THAN (2020),
	PARTITION pRest VALUES LESS THAN MAXVALUE
);

INSERT INTO `readings_part_year` (sensor_id,date,temp) SELECT sensor_id, date, temp FROM readings;

SELECT table_rows as 'count(*)', partition_name FROM information_schema.partitions WHERE table_schema = schema() and table_name ='readings_part_year';

select count(*) from readings_part where date > date '2013-01-01' and date < date '2013-02-01';