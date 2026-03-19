-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: TFG
-- ------------------------------------------------------
-- Server version	9.1.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Asignatura`
--

DROP TABLE IF EXISTS `Asignatura`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Asignatura` (
  `id` int NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Curso`
--

DROP TABLE IF EXISTS `Curso`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Curso` (
  `id` int NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Evento`
--

DROP TABLE IF EXISTS `Evento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Evento` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_matricula` int NOT NULL,
  `Hora` date NOT NULL,
  `Nombre` varchar(255) DEFAULT NULL,
  `Afectado` varchar(255) DEFAULT NULL,
  `Contexto` varchar(255) DEFAULT NULL,
  `Componente` varchar(255) DEFAULT NULL,
  `Evento` varchar(255) DEFAULT NULL,
  `Descripción` varchar(255) DEFAULT NULL,
  `Origen` varchar(255) DEFAULT NULL,
  `Ip` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_matricula` (`id_matricula`),
  CONSTRAINT `Evento_ibfk_1` FOREIGN KEY (`id_matricula`) REFERENCES `Matricula` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=176743 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Matricula`
--

DROP TABLE IF EXISTS `Matricula`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Matricula` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `id_asignatura` int NOT NULL,
  `Curso` varchar(50) NOT NULL,
  `Nota` float DEFAULT NULL,
  PRIMARY KEY (`id`,`id_usuario`,`id_asignatura`,`Curso`),
  UNIQUE KEY `id` (`id`),
  KEY `id_usuario` (`id_usuario`),
  KEY `id_asignatura` (`id_asignatura`),
  CONSTRAINT `Matricula_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `Usuario` (`id`),
  CONSTRAINT `Matricula_ibfk_2` FOREIGN KEY (`id_asignatura`) REFERENCES `Asignatura` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=301 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Mensaje`
--

DROP TABLE IF EXISTS `Mensaje`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Mensaje` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_usuario_receptor` int NOT NULL,
  `id_usuario_emisor` int NOT NULL,
  `asunto` varchar(100) NOT NULL,
  `texto` text NOT NULL,
  `fecha_envio` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `id_usuario_receptor` (`id_usuario_receptor`),
  KEY `id_usuario_emisor` (`id_usuario_emisor`),
  CONSTRAINT `Mensaje_ibfk_1` FOREIGN KEY (`id_usuario_receptor`) REFERENCES `Usuario` (`id`),
  CONSTRAINT `Mensaje_ibfk_2` FOREIGN KEY (`id_usuario_emisor`) REFERENCES `Usuario` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Prediccion`
--

DROP TABLE IF EXISTS `Prediccion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Prediccion` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_matricula` int NOT NULL,
  `Nota_predicha` float NOT NULL,
  `Cluster` varchar(255) NOT NULL,
  `Cluster_numero` int NOT NULL,
  `Fecha` date NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_matricula` (`id_matricula`),
  CONSTRAINT `Prediccion_ibfk_1` FOREIGN KEY (`id_matricula`) REFERENCES `Matricula` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=301 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Prediccion_Hist`
--

DROP TABLE IF EXISTS `Prediccion_Hist`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Prediccion_Hist` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_matricula` int NOT NULL,
  `Nota_predicha` float NOT NULL,
  `Cluster` varchar(255) NOT NULL,
  `Cluster_numero` int NOT NULL,
  `Fecha` date NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_matricula` (`id_matricula`),
  CONSTRAINT `Prediccion_Hist_ibfk_1` FOREIGN KEY (`id_matricula`) REFERENCES `Matricula` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1476 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Usuario`
--

DROP TABLE IF EXISTS `Usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Usuario` (
  `id` int NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(255) NOT NULL,
  `Contrasena` varchar(255) NOT NULL,
  `is_teacher` tinyint(1) NOT NULL,
  `is_admin` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=152 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-19 10:25:37
