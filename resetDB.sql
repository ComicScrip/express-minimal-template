DROP TABLE IF EXISTS `things`;

CREATE TABLE `things` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
);

INSERT INTO `things` (name) VALUES 
  ('item1'),
  ('item2');
