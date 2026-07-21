-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: mouren
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `afiliados`
--

DROP TABLE IF EXISTS `afiliados`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `afiliados` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `suscripcion_id` bigint(20) unsigned NOT NULL,
  `user_id` bigint(20) unsigned NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `parentesco` varchar(50) NOT NULL,
  `estado` varchar(50) NOT NULL,
  `fecha_fallecimiento` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `afiliados_suscripcion_id_foreign` (`suscripcion_id`),
  KEY `afiliados_user_id_foreign` (`user_id`),
  CONSTRAINT `afiliados_suscripcion_id_foreign` FOREIGN KEY (`suscripcion_id`) REFERENCES `suscripciones` (`id`),
  CONSTRAINT `afiliados_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=154 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `afiliados`
--

LOCK TABLES `afiliados` WRITE;
/*!40000 ALTER TABLE `afiliados` DISABLE KEYS */;
INSERT INTO `afiliados` VALUES (122,107,15,'Kate Bush','Titular','activo',NULL,'2026-06-08 03:01:05','2026-06-08 03:01:05'),(123,107,15,'Ariana Grande','Madre','activo',NULL,'2026-06-08 03:01:05','2026-06-16 18:40:00'),(124,107,15,'Lady Gaga','Madre','activo',NULL,'2026-06-08 04:16:00','2026-06-16 18:40:00'),(125,108,16,'Yorladys Giron','Titular','activo',NULL,'2026-06-09 21:20:35','2026-06-09 21:20:35'),(134,119,19,'Sabrina Miamor Carpenter','Titular','activo',NULL,'2026-06-29 09:33:10','2026-06-29 09:33:10'),(135,119,19,'Intento','Cónyuge','activo',NULL,'2026-06-29 09:33:10','2026-06-29 09:33:10'),(136,120,19,'Sabrina Miamor Carpenter','Titular','activo',NULL,'2026-06-29 09:33:41','2026-06-29 09:33:41'),(137,120,19,'Intento','Cónyuge','activo',NULL,'2026-06-29 09:33:41','2026-06-29 09:33:41'),(138,122,21,'Juan Gomez','Titular','activo',NULL,'2026-07-06 03:02:36','2026-07-06 03:02:36'),(139,122,21,'Maria','Padre/Madre','activo',NULL,'2026-07-06 03:02:36','2026-07-06 03:02:36'),(140,122,21,'Juan','Cónyuge','activo',NULL,'2026-07-06 03:02:36','2026-07-06 03:02:36'),(141,122,21,'Felipe','Padre/Madre','activo',NULL,'2026-07-06 03:02:36','2026-07-06 03:02:36'),(142,123,21,'Juan Gomez','Titular','activo',NULL,'2026-07-06 03:02:41','2026-07-06 03:02:41'),(143,123,21,'Maria','Padre/Madre','activo',NULL,'2026-07-06 03:02:41','2026-07-06 03:02:41'),(144,123,21,'Juan','Cónyuge','activo',NULL,'2026-07-06 03:02:41','2026-07-06 03:02:41'),(145,123,21,'Felipe','Padre/Madre','activo',NULL,'2026-07-06 03:02:41','2026-07-06 03:02:41'),(150,126,22,'Maria Martinez','Titular','activo',NULL,'2026-07-06 03:42:58','2026-07-06 03:42:58'),(151,126,22,'Josue','Cónyuge','activo',NULL,'2026-07-06 03:42:58','2026-07-06 03:42:58'),(152,126,22,'Estiven','Cónyuge','activo',NULL,'2026-07-06 03:42:58','2026-07-06 03:42:58'),(153,126,22,'Leonardo','Hijo/a','activo',NULL,'2026-07-06 03:42:58','2026-07-06 03:42:58');
/*!40000 ALTER TABLE `afiliados` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache`
--

DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache`
--

LOCK TABLES `cache` WRITE;
/*!40000 ALTER TABLE `cache` DISABLE KEYS */;
INSERT INTO `cache` VALUES ('laravel-cache-intentotrece@gmail.com|127.0.0.1','i:4;',1783288616),('laravel-cache-intentotrece@gmail.com|127.0.0.1:timer','i:1783288616;',1783288616);
/*!40000 ALTER TABLE `cache` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache_locks`
--

DROP TABLE IF EXISTS `cache_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_locks_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache_locks`
--

LOCK TABLES `cache_locks` WRITE;
/*!40000 ALTER TABLE `cache_locks` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache_locks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `canciones`
--

DROP TABLE IF EXISTS `canciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `canciones` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `titulo` varchar(255) NOT NULL,
  `artista` varchar(255) DEFAULT NULL,
  `genero_musical` varchar(255) DEFAULT NULL,
  `archivo_audio` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `canciones`
--

LOCK TABLES `canciones` WRITE;
/*!40000 ALTER TABLE `canciones` DISABLE KEYS */;
INSERT INTO `canciones` VALUES (1,'Descanso Sereno','Morui el cuervo',NULL,'Descanso_sereno.mp4','2026-05-18 16:43:54','2026-05-18 16:43:54'),(2,'Eterna Luz','Morui el cuervo',NULL,'Eterna_luz.mp4','2026-05-18 16:43:54','2026-05-18 16:43:54'),(3,'S.E.N.A','Morui el cuervo',NULL,'S.E.N.A.mp3','2026-05-18 16:43:54','2026-05-18 16:43:54'),(4,'Siste Fest','Morui el cuervo',NULL,'siste fest.mp3','2026-05-18 16:43:54','2026-05-18 16:43:54'),(5,'Susurro del Alma','Morui el cuervo',NULL,'S.E.N.A.mp3','2026-05-18 16:43:54','2026-05-18 16:43:54'),(6,'Renacer Eterno','Morui el cuervo',NULL,'renacer_eterno.mp3','2026-05-18 16:43:54','2026-05-18 16:43:54');
/*!40000 ALTER TABLE `canciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ceremonias`
--

DROP TABLE IF EXISTS `ceremonias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ceremonias` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `servicio_funerario_id` bigint(20) unsigned NOT NULL,
  `sala_velacion_id` bigint(20) unsigned DEFAULT NULL,
  `fecha_hora` datetime NOT NULL,
  `observaciones` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ceremonias_servicio_funerario_id_foreign` (`servicio_funerario_id`),
  KEY `ceremonias_sala_velacion_id_foreign` (`sala_velacion_id`),
  CONSTRAINT `ceremonias_sala_velacion_id_foreign` FOREIGN KEY (`sala_velacion_id`) REFERENCES `salas_velacion` (`id`) ON DELETE SET NULL,
  CONSTRAINT `ceremonias_servicio_funerario_id_foreign` FOREIGN KEY (`servicio_funerario_id`) REFERENCES `servicios_funerarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ceremonias`
--

LOCK TABLES `ceremonias` WRITE;
/*!40000 ALTER TABLE `ceremonias` DISABLE KEYS */;
INSERT INTO `ceremonias` VALUES (1,128,1,'2026-07-15 14:00:58','Homenaje presencial y transmisión virtual.','2026-07-04 10:25:58','2026-07-04 10:25:58'),(2,129,2,'2026-07-20 10:30:58','Despedida en la sala de mascotas con apoyo de Mouri IA.','2026-07-04 10:25:58','2026-07-04 10:25:58');
/*!40000 ALTER TABLE `ceremonias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `especies`
--

DROP TABLE IF EXISTS `especies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `especies` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `especies`
--

LOCK TABLES `especies` WRITE;
/*!40000 ALTER TABLE `especies` DISABLE KEYS */;
INSERT INTO `especies` VALUES (1,'Perro','2026-06-15 04:32:56','2026-06-15 04:32:56'),(2,'Gato','2026-06-15 04:32:56','2026-06-15 04:32:56'),(3,'Ave','2026-06-15 04:32:56','2026-06-15 04:32:56'),(4,'Roedor (Hámster, Cuy, Conejo)','2026-06-15 04:32:56','2026-06-15 04:32:56'),(5,'Reptil','2026-06-15 04:32:56','2026-06-15 04:32:56'),(6,'Otro','2026-06-15 04:32:56','2026-06-15 04:32:56');
/*!40000 ALTER TABLE `especies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estados_factura`
--

DROP TABLE IF EXISTS `estados_factura`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `estados_factura` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estados_factura`
--

LOCK TABLES `estados_factura` WRITE;
/*!40000 ALTER TABLE `estados_factura` DISABLE KEYS */;
INSERT INTO `estados_factura` VALUES (1,'Pendiente','2026-06-09 08:21:27','2026-06-09 08:21:27'),(2,'Pagado','2026-06-09 08:21:27','2026-06-09 08:21:27');
/*!40000 ALTER TABLE `estados_factura` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estados_usuario`
--

DROP TABLE IF EXISTS `estados_usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `estados_usuario` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estados_usuario`
--

LOCK TABLES `estados_usuario` WRITE;
/*!40000 ALTER TABLE `estados_usuario` DISABLE KEYS */;
INSERT INTO `estados_usuario` VALUES (1,'Activo','2026-05-18 16:31:36','2026-05-18 16:31:36'),(2,'Inactivo','2026-05-18 16:31:36','2026-05-18 16:31:36'),(3,'Suspendido','2026-05-18 16:31:36','2026-05-18 16:31:36'),(4,'Pendiente','2026-05-18 16:31:36','2026-05-18 16:31:36'),(5,'Bloqueado','2026-05-18 16:31:36','2026-05-18 16:31:36');
/*!40000 ALTER TABLE `estados_usuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `etapas_servicio`
--

DROP TABLE IF EXISTS `etapas_servicio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `etapas_servicio` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `etapas_servicio`
--

LOCK TABLES `etapas_servicio` WRITE;
/*!40000 ALTER TABLE `etapas_servicio` DISABLE KEYS */;
/*!40000 ALTER TABLE `etapas_servicio` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `facturas`
--

DROP TABLE IF EXISTS `facturas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `facturas` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `suscripcion_id` bigint(20) unsigned NOT NULL,
  `fecha_emision` date NOT NULL,
  `fecha_vencimiento` date NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `estado_factura_id` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `facturas_suscripcion_id_foreign` (`suscripcion_id`),
  KEY `facturas_estado_factura_id_foreign` (`estado_factura_id`),
  CONSTRAINT `facturas_estado_factura_id_foreign` FOREIGN KEY (`estado_factura_id`) REFERENCES `estados_factura` (`id`),
  CONSTRAINT `facturas_suscripcion_id_foreign` FOREIGN KEY (`suscripcion_id`) REFERENCES `suscripciones` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `facturas`
--

LOCK TABLES `facturas` WRITE;
/*!40000 ALTER TABLE `facturas` DISABLE KEYS */;
INSERT INTO `facturas` VALUES (39,107,'2026-06-29','2026-07-09',24900.00,1,'2026-06-29 06:03:44','2026-06-29 06:03:44'),(40,108,'2026-06-29','2026-07-09',16350.00,1,'2026-06-29 06:03:54','2026-06-29 06:03:54'),(41,115,'2026-06-29','2026-07-09',8200.00,1,'2026-06-29 06:04:03','2026-06-29 06:04:03'),(42,116,'2026-06-29','2026-07-09',8200.00,1,'2026-06-29 06:04:12','2026-06-29 06:04:12');
/*!40000 ALTER TABLE `facturas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `failed_jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `failed_jobs`
--

LOCK TABLES `failed_jobs` WRITE;
/*!40000 ALTER TABLE `failed_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `failed_jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `generos`
--

DROP TABLE IF EXISTS `generos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `generos` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `generos`
--

LOCK TABLES `generos` WRITE;
/*!40000 ALTER TABLE `generos` DISABLE KEYS */;
INSERT INTO `generos` VALUES (1,'Masculino','2026-05-18 16:29:38','2026-05-18 16:29:38'),(2,'Femenino','2026-05-18 16:29:38','2026-05-18 16:29:38'),(3,'No Binario','2026-05-18 16:29:38','2026-05-18 16:29:38'),(4,'Prefiero no decirlo','2026-05-18 16:29:38','2026-05-18 16:29:38');
/*!40000 ALTER TABLE `generos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_batches`
--

DROP TABLE IF EXISTS `job_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_batches`
--

LOCK TABLES `job_batches` WRITE;
/*!40000 ALTER TABLE `job_batches` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) unsigned NOT NULL,
  `reserved_at` int(10) unsigned DEFAULT NULL,
  `available_at` int(10) unsigned NOT NULL,
  `created_at` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs`
--

LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mascotas`
--

DROP TABLE IF EXISTS `mascotas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `mascotas` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `estado` varchar(255) NOT NULL DEFAULT 'activo',
  `especie_id` bigint(20) unsigned NOT NULL,
  `raza_id` bigint(20) unsigned DEFAULT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `user_id` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `suscripcion_id` bigint(20) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `mascotas_especie_id_foreign` (`especie_id`),
  KEY `mascotas_user_id_foreign` (`user_id`),
  KEY `mascotas_suscripcion_id_foreign` (`suscripcion_id`),
  KEY `mascotas_raza_id_foreign` (`raza_id`),
  CONSTRAINT `mascotas_especie_id_foreign` FOREIGN KEY (`especie_id`) REFERENCES `especies` (`id`),
  CONSTRAINT `mascotas_raza_id_foreign` FOREIGN KEY (`raza_id`) REFERENCES `razas` (`id`) ON DELETE SET NULL,
  CONSTRAINT `mascotas_suscripcion_id_foreign` FOREIGN KEY (`suscripcion_id`) REFERENCES `suscripciones` (`id`) ON DELETE CASCADE,
  CONSTRAINT `mascotas_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mascotas`
--

LOCK TABLES `mascotas` WRITE;
/*!40000 ALTER TABLE `mascotas` DISABLE KEYS */;
INSERT INTO `mascotas` VALUES (3,'Tabby','activo',2,13,NULL,17,'2026-06-26 08:49:08','2026-06-26 08:49:08',115),(4,'Tabby','activo',2,14,NULL,15,'2026-06-27 09:16:29','2026-06-27 09:16:29',116),(5,'Muñeca','activo',1,12,NULL,19,'2026-06-30 06:04:39','2026-06-30 06:04:39',121),(6,'Tobby','fallecido',1,9,NULL,21,'2026-07-06 03:08:00','2026-07-06 03:08:00',125),(7,'Lechuzin','activo',3,NULL,NULL,21,'2026-07-06 03:08:00','2026-07-06 03:08:00',125);
/*!40000 ALTER TABLE `mascotas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `metodos_pago`
--

DROP TABLE IF EXISTS `metodos_pago`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `metodos_pago` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `metodos_pago`
--

LOCK TABLES `metodos_pago` WRITE;
/*!40000 ALTER TABLE `metodos_pago` DISABLE KEYS */;
INSERT INTO `metodos_pago` VALUES (1,'Mercado Pago / PSE','2026-06-30 08:04:30','2026-06-30 08:04:30'),(2,'Transferencia Bancaria Directa','2026-06-30 08:04:30','2026-06-30 08:04:30'),(3,'Efectivo / Caja','2026-06-30 08:04:30','2026-06-30 08:04:30');
/*!40000 ALTER TABLE `metodos_pago` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `migrations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (1,'0000_01_01_000000_create_tipo_documentos_table',1),(2,'0000_01_02_000000_create_generos_table',1),(3,'0000_01_03_000000_create_estado_usuarios_table',1),(4,'0000_01_05_000000_create_tipo_usuarios_table',1),(5,'00000_02_02_000000_create_servicios_table',1),(6,'0000_02_01_000000_create_users_table',1),(7,'0000_02_03_000000_create_tokens_table',1),(8,'0000_02_06_000000_create_plans_table',1),(9,'0000_02_07_000000_create_plan_servicios_table',1),(10,'0000_02_08_000000_create_recuerdos_table',1),(11,'0000_02_09_000000_create_cancions_table',1),(12,'0000_02_10_000000_create_plan_recuerdos_table',1),(13,'0000_03_01_000000_create_especies_table',1),(14,'0000_03_02_000000_create_mascotas_table',1),(15,'0000_04_01_000000_create_suscripcions_table',1),(16,'0000_04_02_000000_create_afiliados_table',1),(17,'0000_04_03_000000_create_servicio_funerarios_table',1),(18,'0000_04_04_000000_create_personalizacions_table',1),(19,'0000_05_01_000000_create_estado_facturas_table',1),(20,'0000_05_02_000000_create_metodo_pagos_table',1),(21,'0000_05_03_000000_create_facturas_table',1),(22,'0000_05_04_000000_create_pagos_table',1),(23,'0000_06_01_000000_create_etapa_servicios_table',1),(24,'0000_06_02_000000_create_trazabilidad_servicios_table',1),(25,'0000_07_01_000000_create_notificacions_table',1),(26,'0000_07_02_000000_create_suscripcion_recuerdos_table',1),(27,'0001_01_01_000001_create_cache_table',1),(28,'0001_01_01_000002_create_jobs_table',1),(29,'2026_04_30_134953_create_personal_access_tokens_table',1),(30,'0000_07_03_000000_create_servicio_extra_suscripcions_table',2),(31,'2026_04_30_134954_add_suscripcion_id_to_mascotas_table',3),(32,'2026_04_30_134955_modificar_tabla_personalizaciones',4),(33,'2026_04_30_134956_modificar_servicio_funerario_nullable_en_personalizaciones',5),(34,'0000_07_04_000000_create_razas_table',6),(35,'2026_04_30_134957_alter_raza_in_mascotas_table',7),(36,'2026_04_30_134958_add_remember_token_to_users_table',8),(41,'2026_04_30_134959_create_sala_velacions_table',9),(42,'2026_04_30_134960_create_ceremonias_table',9),(43,'2026_04_30_134961_add_estado_to_mascotas_table',10);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notificaciones`
--

DROP TABLE IF EXISTS `notificaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notificaciones` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `usuario_id` bigint(20) unsigned NOT NULL,
  `mensaje` text NOT NULL,
  `fecha` datetime NOT NULL,
  `leido` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `notificaciones_usuario_id_foreign` (`usuario_id`),
  CONSTRAINT `notificaciones_usuario_id_foreign` FOREIGN KEY (`usuario_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notificaciones`
--

LOCK TABLES `notificaciones` WRITE;
/*!40000 ALTER TABLE `notificaciones` DISABLE KEYS */;
/*!40000 ALTER TABLE `notificaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pagos`
--

DROP TABLE IF EXISTS `pagos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pagos` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `factura_id` bigint(20) unsigned NOT NULL,
  `metodo_pago_id` bigint(20) unsigned NOT NULL,
  `fecha_pago` datetime NOT NULL,
  `monto` decimal(10,2) NOT NULL,
  `estado` varchar(50) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `pagos_factura_id_foreign` (`factura_id`),
  KEY `pagos_metodo_pago_id_foreign` (`metodo_pago_id`),
  CONSTRAINT `pagos_factura_id_foreign` FOREIGN KEY (`factura_id`) REFERENCES `facturas` (`id`),
  CONSTRAINT `pagos_metodo_pago_id_foreign` FOREIGN KEY (`metodo_pago_id`) REFERENCES `metodos_pago` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pagos`
--

LOCK TABLES `pagos` WRITE;
/*!40000 ALTER TABLE `pagos` DISABLE KEYS */;
/*!40000 ALTER TABLE `pagos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `personal_access_tokens`
--

DROP TABLE IF EXISTS `personal_access_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) unsigned NOT NULL,
  `name` text NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  KEY `personal_access_tokens_expires_at_index` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personal_access_tokens`
--

LOCK TABLES `personal_access_tokens` WRITE;
/*!40000 ALTER TABLE `personal_access_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `personal_access_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `personalizaciones`
--

DROP TABLE IF EXISTS `personalizaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `personalizaciones` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `suscripcion_id` bigint(20) unsigned DEFAULT NULL,
  `servicio_funerario_id` bigint(20) unsigned DEFAULT NULL,
  `servicio_id` bigint(20) unsigned NOT NULL,
  `configuracion` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`configuracion`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `personalizaciones_servicio_funerario_id_foreign` (`servicio_funerario_id`),
  KEY `personalizaciones_servicio_id_foreign` (`servicio_id`),
  KEY `personalizaciones_suscripcion_id_foreign` (`suscripcion_id`),
  CONSTRAINT `personalizaciones_servicio_funerario_id_foreign` FOREIGN KEY (`servicio_funerario_id`) REFERENCES `servicios_funerarios` (`id`),
  CONSTRAINT `personalizaciones_servicio_id_foreign` FOREIGN KEY (`servicio_id`) REFERENCES `servicios` (`id`),
  CONSTRAINT `personalizaciones_suscripcion_id_foreign` FOREIGN KEY (`suscripcion_id`) REFERENCES `suscripciones` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personalizaciones`
--

LOCK TABLES `personalizaciones` WRITE;
/*!40000 ALTER TABLE `personalizaciones` DISABLE KEYS */;
INSERT INTO `personalizaciones` VALUES (1,107,NULL,11,'{\"id\":1,\"suscripcion_id\":107,\"servicio_funerario_id\":null,\"servicio_id\":11,\"configuracion\":{\"id\":1,\"suscripcion_id\":107,\"servicio_funerario_id\":null,\"servicio_id\":11,\"configuracion\":{\"id\":1,\"suscripcion_id\":107,\"servicio_funerario_id\":null,\"servicio_id\":11,\"configuracion\":{\"id\":1,\"suscripcion_id\":107,\"servicio_funerario_id\":null,\"servicio_id\":11,\"configuracion\":{\"id\":1,\"suscripcion_id\":107,\"servicio_funerario_id\":null,\"servicio_id\":11,\"configuracion\":{\"id\":1,\"suscripcion_id\":107,\"servicio_funerario_id\":null,\"servicio_id\":11,\"configuracion\":{\"id\":1,\"suscripcion_id\":107,\"servicio_funerario_id\":null,\"servicio_id\":11,\"configuracion\":{\"id\":1,\"suscripcion_id\":107,\"servicio_funerario_id\":null,\"servicio_id\":11,\"configuracion\":{\"id\":1,\"suscripcion_id\":107,\"servicio_funerario_id\":null,\"servicio_id\":11,\"configuracion\":{\"id\":1,\"suscripcion_id\":107,\"servicio_funerario_id\":null,\"servicio_id\":11,\"configuracion\":{\"id\":1,\"suscripcion_id\":107,\"servicio_funerario_id\":null,\"servicio_id\":11,\"configuracion\":{\"colorId\":4,\"colorNombre\":\"Rosado\",\"florId\":1,\"florNombre\":\"Rosas\",\"observacion\":\"wertyui\",\"configuracion\":{\"colorId\":2,\"colorNombre\":\"Dorado\",\"florId\":4,\"florNombre\":\"Claveles\",\"observacion\":\"ert\"}},\"created_at\":\"2026-06-14T22:04:05.000000Z\",\"updated_at\":\"2026-06-15T05:48:11.000000Z\",\"colorId\":1,\"colorNombre\":\"Blanco\",\"florId\":4,\"florNombre\":\"Claveles\",\"observacion\":\"Hola\"},\"created_at\":\"2026-06-14T22:04:05.000000Z\",\"updated_at\":\"2026-06-15T17:16:17.000000Z\",\"colorId\":4,\"colorNombre\":\"Rosado\",\"florId\":2,\"florNombre\":\"Lirios\",\"observacion\":\"hhh\"},\"created_at\":\"2026-06-14T22:04:05.000000Z\",\"updated_at\":\"2026-06-16T02:15:04.000000Z\",\"colorId\":3,\"colorNombre\":\"Cafe\",\"florId\":2,\"florNombre\":\"Lirios\",\"observacion\":\"rr\"},\"created_at\":\"2026-06-14T22:04:05.000000Z\",\"updated_at\":\"2026-06-16T02:21:00.000000Z\"},\"created_at\":\"2026-06-14T22:04:05.000000Z\",\"updated_at\":\"2026-06-16T02:21:32.000000Z\"},\"created_at\":\"2026-06-14T22:04:05.000000Z\",\"updated_at\":\"2026-06-16T02:21:39.000000Z\"},\"created_at\":\"2026-06-14T22:04:05.000000Z\",\"updated_at\":\"2026-06-16T03:27:11.000000Z\"},\"created_at\":\"2026-06-14T22:04:05.000000Z\",\"updated_at\":\"2026-06-16T03:28:13.000000Z\"},\"created_at\":\"2026-06-14T22:04:05.000000Z\",\"updated_at\":\"2026-06-16T05:28:21.000000Z\"},\"created_at\":\"2026-06-14T22:04:05.000000Z\",\"updated_at\":\"2026-06-16T13:40:00.000000Z\",\"colorId\":3,\"colorNombre\":\"Cafe\",\"florId\":1,\"florNombre\":\"Rosas\",\"observacion\":\"Que haya una imagen de lady gaga\"},\"created_at\":\"2026-06-14T22:04:05.000000Z\",\"updated_at\":\"2026-06-29T02:14:44.000000Z\"}','2026-06-15 03:04:05','2026-07-01 19:29:30');
/*!40000 ALTER TABLE `personalizaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `plan_recuerdos`
--

DROP TABLE IF EXISTS `plan_recuerdos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `plan_recuerdos` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `plan_id` bigint(20) unsigned NOT NULL,
  `recuerdo_id` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `plan_recuerdos_plan_id_foreign` (`plan_id`),
  KEY `plan_recuerdos_recuerdo_id_foreign` (`recuerdo_id`),
  CONSTRAINT `plan_recuerdos_plan_id_foreign` FOREIGN KEY (`plan_id`) REFERENCES `planes` (`id`),
  CONSTRAINT `plan_recuerdos_recuerdo_id_foreign` FOREIGN KEY (`recuerdo_id`) REFERENCES `recuerdos` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `plan_recuerdos`
--

LOCK TABLES `plan_recuerdos` WRITE;
/*!40000 ALTER TABLE `plan_recuerdos` DISABLE KEYS */;
/*!40000 ALTER TABLE `plan_recuerdos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `plan_servicio`
--

DROP TABLE IF EXISTS `plan_servicio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `plan_servicio` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `plan_id` bigint(20) unsigned NOT NULL,
  `servicio_id` bigint(20) unsigned NOT NULL,
  `cantidad` int(11) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `plan_servicio_plan_id_foreign` (`plan_id`),
  KEY `plan_servicio_servicio_id_foreign` (`servicio_id`),
  CONSTRAINT `plan_servicio_plan_id_foreign` FOREIGN KEY (`plan_id`) REFERENCES `planes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `plan_servicio_servicio_id_foreign` FOREIGN KEY (`servicio_id`) REFERENCES `servicios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `plan_servicio`
--

LOCK TABLES `plan_servicio` WRITE;
/*!40000 ALTER TABLE `plan_servicio` DISABLE KEYS */;
INSERT INTO `plan_servicio` VALUES (1,1,1,1,'2026-05-18 16:37:49','2026-05-18 16:37:49'),(2,1,2,1,'2026-05-18 16:37:49','2026-05-18 16:37:49'),(3,1,4,1,'2026-05-18 16:37:49','2026-05-18 16:37:49'),(4,1,5,1,'2026-05-18 16:37:49','2026-05-18 16:37:49'),(5,1,8,2,'2026-05-18 16:37:49','2026-05-18 16:37:49');
/*!40000 ALTER TABLE `plan_servicio` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `planes`
--

DROP TABLE IF EXISTS `planes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `planes` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text NOT NULL,
  `cuota_base` decimal(10,2) NOT NULL,
  `max_afiliados` int(11) NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `planes`
--

LOCK TABLES `planes` WRITE;
/*!40000 ALTER TABLE `planes` DISABLE KEYS */;
INSERT INTO `planes` VALUES (1,'Plan Tributo Eterno','Cobertura total hasta 5 personas',7000.00,5,1,'2026-05-18 16:34:26','2026-05-18 16:34:26'),(2,'Plan Descanso Sereno','Plan funerario básico familiar',4500.00,3,1,'2026-05-18 16:34:26','2026-05-18 16:34:26'),(3,'Plan Paz Familiar','Cobertura funeraria completa para núcleo familiar',9500.00,6,1,'2026-05-18 16:34:26','2026-05-18 16:34:26'),(4,'Huella Eterna','Este plan esta hecho para mascotas',8000.00,4,1,'2026-05-18 16:34:26','2026-05-18 16:34:26'),(5,'Plan Memorial Dorado','Servicio premium con velación y floristería',15000.00,8,1,'2026-05-18 16:34:26','2026-05-18 16:34:26'),(6,'Plan Siempre Contigo','Cobertura individual económica',3000.00,1,1,'2026-05-18 16:34:26','2026-05-18 16:34:26'),(7,'Plan Familiar Integral','Protección completa para grupos familiares grandes',18000.00,10,1,'2026-05-18 16:34:26','2026-05-18 16:34:26');
/*!40000 ALTER TABLE `planes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `razas`
--

DROP TABLE IF EXISTS `razas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `razas` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `especie_id` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `razas_especie_id_foreign` (`especie_id`),
  CONSTRAINT `razas_especie_id_foreign` FOREIGN KEY (`especie_id`) REFERENCES `especies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `razas`
--

LOCK TABLES `razas` WRITE;
/*!40000 ALTER TABLE `razas` DISABLE KEYS */;
INSERT INTO `razas` VALUES (9,'Pastor Alemán',1,'2026-06-15 04:33:00',NULL),(10,'Pug',1,'2026-06-15 04:33:00',NULL),(11,'Golden Retriever',1,'2026-06-15 04:33:00',NULL),(12,'Criollo / Mestizo (Perro)',1,'2026-06-15 04:33:00',NULL),(13,'Siamés',2,'2026-06-15 04:33:00',NULL),(14,'Persa',2,'2026-06-15 04:33:00',NULL),(15,'Angora',2,'2026-06-15 04:33:00',NULL),(16,'Criollo / Mestizo (Gato)',2,'2026-06-15 04:33:00',NULL);
/*!40000 ALTER TABLE `razas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recuerdos`
--

DROP TABLE IF EXISTS `recuerdos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `recuerdos` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `precio_adicional` decimal(10,2) NOT NULL DEFAULT 0.00,
  `imagen` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recuerdos`
--

LOCK TABLES `recuerdos` WRITE;
/*!40000 ALTER TABLE `recuerdos` DISABLE KEYS */;
INSERT INTO `recuerdos` VALUES (1,'Peluche de Mouri','Tarjeta con diseño floral personalizado para ceremonia',200.00,'peluche_mouri.png','2026-05-18 16:42:25','2026-05-18 16:42:25'),(2,'Separador de libro\n','Set de velas para homenaje y ceremonia',350.00,'separador.png','2026-05-18 16:42:25','2026-05-18 16:42:25'),(3,'Recuerdo con perlas','Urna con grabado personalizado',1200.00,'recordatorio_con_perlas.png','2026-05-18 16:42:25','2026-05-18 16:42:25'),(4,'Taza del Alma','Foto enmarcada del ser querido',500.00,'taza_mouri.png','2026-05-18 16:42:25','2026-05-18 16:42:25'),(5,'Arbol de la Vida','Libro para mensajes de familiares y amigos',300.00,'planta_lazo.png','2026-05-18 16:42:25','2026-05-18 16:42:25'),(6,'Cofre de recuerdos','Arreglo floral grande para ceremonia principal',900.00,'recordatorio_circular.png','2026-05-18 16:42:25','2026-05-18 16:42:25');
/*!40000 ALTER TABLE `recuerdos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `salas_velacion`
--

DROP TABLE IF EXISTS `salas_velacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `salas_velacion` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `estado` varchar(50) NOT NULL DEFAULT 'Disponible',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `salas_velacion`
--

LOCK TABLES `salas_velacion` WRITE;
/*!40000 ALTER TABLE `salas_velacion` DISABLE KEYS */;
INSERT INTO `salas_velacion` VALUES (1,'Sala Celestial','Ocupada','2026-07-04 10:25:58','2026-07-04 10:25:58'),(2,'Sala Aurora','Ocupada','2026-07-04 10:25:58','2026-07-04 10:25:58'),(3,'Sala Mouri','Disponible','2026-07-04 10:25:58','2026-07-04 10:25:58'),(4,'Sala Paz Eterna','Disponible','2026-07-04 10:25:58','2026-07-04 10:25:58'),(5,'Sala Olivos','Mantenimiento','2026-07-04 10:25:58','2026-07-04 10:25:58');
/*!40000 ALTER TABLE `salas_velacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `servicios`
--

DROP TABLE IF EXISTS `servicios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `servicios` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `precio` decimal(12,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `personalizable` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `servicios`
--

LOCK TABLES `servicios` WRITE;
/*!40000 ALTER TABLE `servicios` DISABLE KEYS */;
INSERT INTO `servicios` VALUES (1,'Cremación Humana','Servicio de cremación con urna incluida',1800.00,'2026-05-18 16:36:49','2026-05-18 16:36:49',0),(2,'Velatorio Básico','Uso de sala velatoria por 24 horas',1200.00,'2026-05-18 16:36:49','2026-05-18 16:36:49',0),(3,'Ataúd Estándar','Ataúd de madera estándar para servicio funerario',2500.00,'2026-05-18 16:36:49','2026-05-18 16:36:49',0),(4,'Traslado Funerario','Traslado del fallecido dentro de la ciudad',800.00,'2026-05-18 16:36:49','2026-05-18 16:36:49',0),(5,'Servicio Religioso','Ceremonia religiosa personalizada',600.00,'2026-05-18 16:36:49','2026-05-18 16:36:49',0),(6,'Preparación Estética','Arreglo y preparación estética del cuerpo',950.00,'2026-05-18 16:36:49','2026-05-18 16:36:49',0),(7,'Publicación Obituario','Publicación de obituario en medios locales',300.00,'2026-05-18 16:36:49','2026-05-18 16:36:49',0),(8,'Floristería Funeraria','Arreglos florales para ceremonia funeraria',700.00,'2026-05-18 16:36:49','2026-05-18 16:36:49',0),(9,'Cenizario','Espacio para conservación de cenizas',1500.00,'2026-05-18 16:36:49','2026-05-18 16:36:49',0),(10,'Asistencia Legal','Gestión de documentación y trámites legales',500.00,'2026-05-18 16:36:49','2026-05-18 16:36:49',0),(11,'Decoración Floral','Servicio de decoración floral personalizada para ceremonias y salas de velación.',1200.00,NULL,NULL,1),(12,'Sala de Velación Personalizada','Ambientación personalizada de la sala con iluminación, colores y temática emocional.',1800.00,NULL,NULL,0),(13,'Ceremonia Especial','Personalización completa de la ceremonia según preferencias familiares.',1500.00,NULL,NULL,0),(14,'Ambientación Emocional','Configuración de iluminación y ambiente para crear un espacio especial.',1000.00,NULL,NULL,0),(15,'Transporte Decorado','Decoración personalizada del vehículo funerario con detalles especiales.',2500.00,NULL,NULL,0),(16,'Urna Personalizada','Selección y personalización de urnas con grabados y acabados especiales.',2400.00,NULL,NULL,0),(17,'Memorial para Mascotas','Servicio especial para mascotas incluyendo homenaje y decoración personalizada.',1050.00,NULL,NULL,0),(18,'Libro de Mensajes','Libro físico o digital donde familiares y amigos pueden dejar mensajes y recuerdos.',2000.00,NULL,NULL,0),(19,'Proyección Multimedia','Pantallas y proyecciones de fotografías y videos durante la ceremonia.',1200.00,NULL,NULL,0),(20,'Flores Especiales','Arreglos florales con selección personalizada de flores y colores.',1300.00,NULL,NULL,0),(21,'Velas Conmemorativas','Velas decorativas y conmemorativas personalizadas para la ceremonia.',900.00,NULL,NULL,0),(22,'Retrato Conmemorativo','Creación de retrato artístico o digital para homenaje del ser querido.',1200.00,NULL,NULL,0),(23,'Streaming de Ceremonia','Transmisión en vivo privada para familiares que no puedan asistir presencialmente.',1400.00,NULL,NULL,0),(24,'Álbum Memorial','Álbum físico o digital con fotografías y recuerdos del homenaje.',1200.00,NULL,NULL,0),(25,'Decoración Temática','Decoración basada en gustos, colores o pasiones del ser querido.',1000.00,NULL,NULL,1);
/*!40000 ALTER TABLE `servicios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `servicios_extras_suscripcion`
--

DROP TABLE IF EXISTS `servicios_extras_suscripcion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `servicios_extras_suscripcion` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `suscripcion_id` bigint(20) unsigned NOT NULL,
  `servicio_id` bigint(20) unsigned NOT NULL,
  `precio_pagado` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `servicios_extras_suscripcion_suscripcion_id_foreign` (`suscripcion_id`),
  KEY `servicios_extras_suscripcion_servicio_id_foreign` (`servicio_id`),
  CONSTRAINT `servicios_extras_suscripcion_servicio_id_foreign` FOREIGN KEY (`servicio_id`) REFERENCES `servicios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `servicios_extras_suscripcion_suscripcion_id_foreign` FOREIGN KEY (`suscripcion_id`) REFERENCES `suscripciones` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=103 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `servicios_extras_suscripcion`
--

LOCK TABLES `servicios_extras_suscripcion` WRITE;
/*!40000 ALTER TABLE `servicios_extras_suscripcion` DISABLE KEYS */;
INSERT INTO `servicios_extras_suscripcion` VALUES (85,107,3,0.00,'2026-07-01 19:29:30','2026-07-01 19:29:30'),(86,107,11,0.00,'2026-07-01 19:29:30','2026-07-01 19:29:30'),(87,108,3,2500.00,'2026-06-09 21:20:35','2026-06-09 21:20:35'),(88,108,6,950.00,'2026-06-09 21:20:35','2026-06-09 21:20:35'),(89,108,7,300.00,'2026-06-09 21:20:35','2026-06-09 21:20:35'),(90,108,11,1200.00,'2026-06-09 21:20:35','2026-06-09 21:20:35'),(91,108,12,1800.00,'2026-06-09 21:20:35','2026-06-09 21:20:35'),(92,108,16,2400.00,'2026-06-09 21:20:35','2026-06-09 21:20:35'),(97,119,3,2500.00,'2026-06-29 09:33:10','2026-06-29 09:33:10'),(98,120,3,2500.00,'2026-06-29 09:33:41','2026-06-29 09:33:41'),(99,122,1,1800.00,'2026-07-06 03:02:36','2026-07-06 03:02:36'),(100,123,1,1800.00,'2026-07-06 03:02:41','2026-07-06 03:02:41'),(102,126,1,1800.00,'2026-07-06 03:42:58','2026-07-06 03:42:58');
/*!40000 ALTER TABLE `servicios_extras_suscripcion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `servicios_funerarios`
--

DROP TABLE IF EXISTS `servicios_funerarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `servicios_funerarios` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `afiliado_id` bigint(20) unsigned DEFAULT NULL,
  `mascota_id` bigint(20) unsigned DEFAULT NULL,
  `fecha_inicio` datetime NOT NULL,
  `cancion_id` bigint(20) unsigned DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `servicios_funerarios_afiliado_id_foreign` (`afiliado_id`),
  KEY `servicios_funerarios_mascota_id_foreign` (`mascota_id`),
  KEY `servicios_funerarios_cancion_id_foreign` (`cancion_id`),
  CONSTRAINT `servicios_funerarios_afiliado_id_foreign` FOREIGN KEY (`afiliado_id`) REFERENCES `afiliados` (`id`),
  CONSTRAINT `servicios_funerarios_cancion_id_foreign` FOREIGN KEY (`cancion_id`) REFERENCES `canciones` (`id`),
  CONSTRAINT `servicios_funerarios_mascota_id_foreign` FOREIGN KEY (`mascota_id`) REFERENCES `mascotas` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=148 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `servicios_funerarios`
--

LOCK TABLES `servicios_funerarios` WRITE;
/*!40000 ALTER TABLE `servicios_funerarios` DISABLE KEYS */;
INSERT INTO `servicios_funerarios` VALUES (108,122,NULL,'2026-07-01 14:29:30',5,'I swear Im not able of talk','2026-06-08 03:01:05','2026-07-01 19:29:30'),(109,123,NULL,'2026-07-01 14:29:30',6,'Hola','2026-06-08 03:01:05','2026-07-01 19:29:30'),(110,124,NULL,'2026-07-01 14:29:30',5,'F','2026-06-08 04:16:00','2026-07-01 19:29:30'),(117,NULL,3,'2026-06-26 03:49:08',1,NULL,'2026-06-26 08:49:08','2026-06-26 08:49:08'),(118,NULL,4,'2026-06-27 04:16:29',1,NULL,'2026-06-27 09:16:29','2026-06-27 09:16:29'),(123,134,NULL,'2026-06-29 04:33:10',1,NULL,'2026-06-29 09:33:10','2026-06-29 09:33:10'),(124,135,NULL,'2026-06-29 04:33:10',1,NULL,'2026-06-29 09:33:10','2026-06-29 09:33:10'),(125,136,NULL,'2026-06-29 04:33:41',1,NULL,'2026-06-29 09:33:41','2026-06-29 09:33:41'),(126,137,NULL,'2026-06-29 04:33:41',1,NULL,'2026-06-29 09:33:41','2026-06-29 09:33:41'),(127,NULL,5,'2026-06-30 01:04:39',6,NULL,'2026-06-30 06:04:39','2026-06-30 06:04:39'),(128,122,NULL,'2026-07-04 05:25:58',NULL,'Servicio coordinado con la familia.','2026-07-04 10:25:58','2026-07-04 10:25:58'),(129,NULL,3,'2026-07-02 05:25:58',NULL,'Servicio de cremación e inhumación de cenizas.','2026-07-04 10:25:58','2026-07-04 10:25:58'),(130,138,NULL,'2026-07-05 22:02:36',2,NULL,'2026-07-06 03:02:36','2026-07-06 03:02:36'),(131,139,NULL,'2026-07-05 22:02:36',2,NULL,'2026-07-06 03:02:36','2026-07-06 03:02:36'),(132,140,NULL,'2026-07-05 22:02:36',2,NULL,'2026-07-06 03:02:36','2026-07-06 03:02:36'),(133,141,NULL,'2026-07-05 22:02:36',2,NULL,'2026-07-06 03:02:36','2026-07-06 03:02:36'),(134,142,NULL,'2026-07-05 22:02:41',2,NULL,'2026-07-06 03:02:41','2026-07-06 03:02:41'),(135,143,NULL,'2026-07-05 22:02:41',2,NULL,'2026-07-06 03:02:41','2026-07-06 03:02:41'),(136,144,NULL,'2026-07-05 22:02:41',2,NULL,'2026-07-06 03:02:41','2026-07-06 03:02:41'),(137,145,NULL,'2026-07-05 22:02:41',2,NULL,'2026-07-06 03:02:41','2026-07-06 03:02:41'),(142,NULL,6,'2026-07-05 22:08:00',6,NULL,'2026-07-06 03:08:00','2026-07-06 03:08:00'),(143,NULL,7,'2026-07-05 22:08:00',6,NULL,'2026-07-06 03:08:00','2026-07-06 03:08:00'),(144,150,NULL,'2026-07-05 22:42:58',1,NULL,'2026-07-06 03:42:58','2026-07-06 03:42:58'),(145,151,NULL,'2026-07-05 22:42:58',1,NULL,'2026-07-06 03:42:58','2026-07-06 03:42:58'),(146,152,NULL,'2026-07-05 22:42:58',1,NULL,'2026-07-06 03:42:58','2026-07-06 03:42:58'),(147,153,NULL,'2026-07-05 22:42:58',1,NULL,'2026-07-06 03:42:58','2026-07-06 03:42:58');
/*!40000 ALTER TABLE `servicios_funerarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES ('6L4NisIcaoJRM4oKblLcpp8ajek5I3TaB0G9Bql9',22,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36','YTo1OntzOjY6Il90b2tlbiI7czo0MDoiZ2tLcWVvT25rU0w1VTdhbGxXSkZ2bjE4bnU2QmNIdkQ2cm5DMTZIeCI7czozOiJ1cmwiO2E6MDp7fXM6OToiX3ByZXZpb3VzIjthOjI6e3M6MzoidXJsIjtzOjI5OiJodHRwOi8vMTI3LjAuMC4xOjgwMDAvbWktcGxhbiI7czo1OiJyb3V0ZSI7czo3OiJtaS5wbGFuIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319czo1MDoibG9naW5fd2ViXzU5YmEzNmFkZGMyYjJmOTQwMTU4MGYwMTRjN2Y1OGVhNGUzMDk4OWQiO2k6MjI7fQ==',1783303935),('e06C5lPtcSHWfDE3uLVPNWp4fOw3DiYSSlndskej',22,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoiaEc4cTQ0S3lyd0x4Um9yNk1VOVFWT1lFNmxwMHE2UmNhSU9PdzdHZSI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319czo1MDoibG9naW5fd2ViXzU5YmEzNmFkZGMyYjJmOTQwMTU4MGYwMTRjN2Y1OGVhNGUzMDk4OWQiO2k6MjI7fQ==',1783291379),('GK38hxPTJKgoFmsvDyTg2fiiccNNgVZlbXYltlFZ',20,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36','YTo1OntzOjY6Il90b2tlbiI7czo0MDoibWcwNHRjVFVJQ2dVQXpBcnJudk9DME81dTlmcTBiamQ5cGFVcHJmbCI7czozOiJ1cmwiO2E6MTp7czo4OiJpbnRlbmRlZCI7czozNzoiaHR0cDovLzEyNy4wLjAuMTo4MDAwL2FkbWluL2Rhc2hib2FyZCI7fXM6OToiX3ByZXZpb3VzIjthOjI6e3M6MzoidXJsIjtzOjI3OiJodHRwOi8vMTI3LjAuMC4xOjgwMDAvbG9naW4iO3M6NToicm91dGUiO3M6NToibG9naW4iO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX1zOjUwOiJsb2dpbl93ZWJfNTliYTM2YWRkYzJiMmY5NDAxNTgwZjAxNGM3ZjU4ZWE0ZTMwOTg5ZCI7aToyMDt9',1783303100),('TmjfD3YjXAekZkpsi60JjkCDTfiJwzjV0rmmgVuZ',20,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36','YTo0OntzOjY6Il90b2tlbiI7czo0MDoiZjZLVUZTZWNPQTlqM0dTcE9ubmZLUEtMZmRma2ZSaGgwS2owcXZadSI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319czo1MDoibG9naW5fd2ViXzU5YmEzNmFkZGMyYjJmOTQwMTU4MGYwMTRjN2Y1OGVhNGUzMDk4OWQiO2k6MjA7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDQ6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9hZG1pbi9nZXN0aW9uLXVzdWFyaW9zIjtzOjU6InJvdXRlIjtzOjE0OiJhZG1pbi51c3VhcmlvcyI7fX0=',1783295592);
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `suscripcion_recuerdos`
--

DROP TABLE IF EXISTS `suscripcion_recuerdos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `suscripcion_recuerdos` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `suscripcion_id` bigint(20) unsigned NOT NULL,
  `recuerdo_id` bigint(20) unsigned NOT NULL,
  `costo_unitario` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `suscripcion_recuerdos_suscripcion_id_foreign` (`suscripcion_id`),
  KEY `suscripcion_recuerdos_recuerdo_id_foreign` (`recuerdo_id`),
  CONSTRAINT `suscripcion_recuerdos_recuerdo_id_foreign` FOREIGN KEY (`recuerdo_id`) REFERENCES `recuerdos` (`id`),
  CONSTRAINT `suscripcion_recuerdos_suscripcion_id_foreign` FOREIGN KEY (`suscripcion_id`) REFERENCES `suscripciones` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=124 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `suscripcion_recuerdos`
--

LOCK TABLES `suscripcion_recuerdos` WRITE;
/*!40000 ALTER TABLE `suscripcion_recuerdos` DISABLE KEYS */;
INSERT INTO `suscripcion_recuerdos` VALUES (105,108,1,200.00,'2026-06-09 21:20:35','2026-06-09 21:20:35'),(111,115,1,200.00,'2026-06-26 08:49:09','2026-06-26 08:49:09'),(112,116,1,200.00,'2026-06-27 09:16:29','2026-06-27 09:16:29'),(113,107,2,0.00,'2026-07-01 19:29:30','2026-07-01 19:29:30'),(116,119,5,300.00,'2026-06-29 09:33:10','2026-06-29 09:33:10'),(117,120,5,300.00,'2026-06-29 09:33:41','2026-06-29 09:33:41'),(118,121,5,300.00,'2026-06-30 06:04:39','2026-06-30 06:04:39'),(119,122,1,200.00,'2026-07-06 03:02:36','2026-07-06 03:02:36'),(120,123,1,200.00,'2026-07-06 03:02:41','2026-07-06 03:02:41'),(122,125,2,350.00,'2026-07-06 03:08:00','2026-07-06 03:08:00'),(123,126,1,200.00,'2026-07-06 03:42:58','2026-07-06 03:42:58');
/*!40000 ALTER TABLE `suscripcion_recuerdos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `suscripciones`
--

DROP TABLE IF EXISTS `suscripciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `suscripciones` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `usuario_id` bigint(20) unsigned NOT NULL,
  `plan_id` bigint(20) unsigned NOT NULL,
  `fecha_inicio` date NOT NULL,
  `estado` varchar(50) NOT NULL,
  `cuota_mensual` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `suscripciones_usuario_id_foreign` (`usuario_id`),
  KEY `suscripciones_plan_id_foreign` (`plan_id`),
  CONSTRAINT `suscripciones_plan_id_foreign` FOREIGN KEY (`plan_id`) REFERENCES `planes` (`id`),
  CONSTRAINT `suscripciones_usuario_id_foreign` FOREIGN KEY (`usuario_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=127 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `suscripciones`
--

LOCK TABLES `suscripciones` WRITE;
/*!40000 ALTER TABLE `suscripciones` DISABLE KEYS */;
INSERT INTO `suscripciones` VALUES (107,15,1,'2026-06-07','activo',25050.00,'2026-06-08 03:01:05','2026-07-01 19:29:30'),(108,16,1,'2026-06-09','activo',16350.00,'2026-06-09 21:20:35','2026-06-09 21:20:35'),(115,17,4,'2026-06-26','activo',8200.00,'2026-06-26 08:49:08','2026-06-26 08:49:08'),(116,15,4,'2026-06-27','activo',8200.00,'2026-06-27 09:16:29','2026-06-27 09:16:29'),(119,19,1,'2026-06-29','activo',16800.00,'2026-06-29 09:33:10','2026-06-29 09:33:10'),(120,19,1,'2026-06-29','activo',16800.00,'2026-06-29 09:33:41','2026-06-29 09:33:41'),(121,19,4,'2026-06-30','activo',8300.00,'2026-06-30 06:04:39','2026-06-30 06:04:39'),(122,21,3,'2026-07-05','activo',40000.00,'2026-07-06 03:02:36','2026-07-06 03:02:36'),(123,21,3,'2026-07-05','activo',40000.00,'2026-07-06 03:02:41','2026-07-06 03:02:41'),(125,21,4,'2026-07-05','activo',16350.00,'2026-07-06 03:08:00','2026-07-06 03:08:00'),(126,22,5,'2026-07-05','activo',62000.00,'2026-07-06 03:42:58','2026-07-06 03:42:58');
/*!40000 ALTER TABLE `suscripciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tipos_documento`
--

DROP TABLE IF EXISTS `tipos_documento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tipos_documento` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipos_documento`
--

LOCK TABLES `tipos_documento` WRITE;
/*!40000 ALTER TABLE `tipos_documento` DISABLE KEYS */;
INSERT INTO `tipos_documento` VALUES (1,'Cédula de Ciudadanía','2026-05-18 16:28:42','2026-05-18 16:28:42'),(2,'Tarjeta de Identidad','2026-05-18 16:28:42','2026-05-18 16:28:42'),(3,'Cédula de Extranjería','2026-05-18 16:28:42','2026-05-18 16:28:42'),(4,'Pasaporte','2026-05-18 16:28:42','2026-05-18 16:28:42');
/*!40000 ALTER TABLE `tipos_documento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tipos_usuario`
--

DROP TABLE IF EXISTS `tipos_usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tipos_usuario` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipos_usuario`
--

LOCK TABLES `tipos_usuario` WRITE;
/*!40000 ALTER TABLE `tipos_usuario` DISABLE KEYS */;
INSERT INTO `tipos_usuario` VALUES (1,'Administrador','2026-05-18 16:33:02','2026-05-18 16:33:02'),(2,'Asesor','2026-05-18 16:33:02','2026-05-18 16:33:02'),(3,'Cliente','2026-05-18 16:33:02','2026-05-18 16:33:02'),(4,'Afiliado','2026-05-18 16:33:02','2026-05-18 16:33:02'),(5,'Super Administrador','2026-05-18 16:33:02','2026-05-18 16:33:02');
/*!40000 ALTER TABLE `tipos_usuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tokens`
--

DROP TABLE IF EXISTS `tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tokens` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `usuario_id` bigint(20) unsigned NOT NULL,
  `token` varchar(255) NOT NULL,
  `tipo` varchar(50) NOT NULL,
  `fecha_expiracion` datetime NOT NULL,
  `usado` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `tokens_usuario_id_foreign` (`usuario_id`),
  CONSTRAINT `tokens_usuario_id_foreign` FOREIGN KEY (`usuario_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tokens`
--

LOCK TABLES `tokens` WRITE;
/*!40000 ALTER TABLE `tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `trazabilidad_servicio`
--

DROP TABLE IF EXISTS `trazabilidad_servicio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `trazabilidad_servicio` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `servicio_funerario_id` bigint(20) unsigned NOT NULL,
  `etapa_id` bigint(20) unsigned NOT NULL,
  `descripcion` text NOT NULL,
  `fecha` datetime NOT NULL,
  `usuario_responsable` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `trazabilidad_servicio_servicio_funerario_id_foreign` (`servicio_funerario_id`),
  KEY `trazabilidad_servicio_etapa_id_foreign` (`etapa_id`),
  KEY `trazabilidad_servicio_usuario_responsable_foreign` (`usuario_responsable`),
  CONSTRAINT `trazabilidad_servicio_etapa_id_foreign` FOREIGN KEY (`etapa_id`) REFERENCES `etapas_servicio` (`id`),
  CONSTRAINT `trazabilidad_servicio_servicio_funerario_id_foreign` FOREIGN KEY (`servicio_funerario_id`) REFERENCES `servicios_funerarios` (`id`),
  CONSTRAINT `trazabilidad_servicio_usuario_responsable_foreign` FOREIGN KEY (`usuario_responsable`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trazabilidad_servicio`
--

LOCK TABLES `trazabilidad_servicio` WRITE;
/*!40000 ALTER TABLE `trazabilidad_servicio` DISABLE KEYS */;
/*!40000 ALTER TABLE `trazabilidad_servicio` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `cedula` varchar(20) NOT NULL,
  `tipo_documento_id` bigint(20) unsigned NOT NULL,
  `fecha_nacimiento` date NOT NULL,
  `genero_id` bigint(20) unsigned NOT NULL,
  `telefono` varchar(20) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `estado_id` bigint(20) unsigned NOT NULL,
  `tipo_usuario_id` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_cedula_unique` (`cedula`),
  UNIQUE KEY `users_email_unique` (`email`),
  KEY `users_tipo_documento_id_foreign` (`tipo_documento_id`),
  KEY `users_genero_id_foreign` (`genero_id`),
  KEY `users_estado_id_foreign` (`estado_id`),
  KEY `users_tipo_usuario_id_foreign` (`tipo_usuario_id`),
  CONSTRAINT `users_estado_id_foreign` FOREIGN KEY (`estado_id`) REFERENCES `estados_usuario` (`id`),
  CONSTRAINT `users_genero_id_foreign` FOREIGN KEY (`genero_id`) REFERENCES `generos` (`id`),
  CONSTRAINT `users_tipo_documento_id_foreign` FOREIGN KEY (`tipo_documento_id`) REFERENCES `tipos_documento` (`id`),
  CONSTRAINT `users_tipo_usuario_id_foreign` FOREIGN KEY (`tipo_usuario_id`) REFERENCES `tipos_usuario` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (15,'Kate Elizabeth Bush','00000024',1,'1990-01-02',2,'3244344444','katebush@gmail.com','$2y$12$vEsU0ap5VpTDcBh70JsO.OJ2lFZyA/3j7SbijV2.dapfQDsIjngeC',NULL,1,2,'2026-06-07 08:43:36','2026-06-08 04:01:03'),(16,'Yorladys Giron','1024678456',1,'2005-11-19',3,'3122123456','yorladysgiron@gmail.com','$2y$12$cuIVWa3uzvyIvwipcjsgG.bPkEyYXtRzB7tJifS3/cExfqyjYfL/K',NULL,1,2,'2026-06-09 21:01:18','2026-06-09 21:01:18'),(17,'Adele Laurie Blue Adkins','00000030',1,'2005-11-28',1,'3000000000','adele@gmail.com','$2y$12$r.4rlmC/cUzdHNlvHlVv2OJkuHKhg1lA1LTaRpB4V8oawPjSSYqIG',NULL,1,2,'2026-06-15 07:14:28','2026-06-15 07:14:28'),(18,'Oliver Tree','00000031',1,'2026-06-04',1,'3000000000','oliver@gmail.com','$2y$12$ZcMJxh3EYwz8QhBkSzLOguUbTEc/E3ndmVlN21j5/kBPIqXeNOiwe',NULL,1,2,'2026-06-22 09:37:31','2026-06-22 09:37:31'),(19,'Sabrina Miamor Carpenter','00000034',1,'2026-06-02',2,'3048858585','sabrinac@gmail.com','$2y$12$k1EvdKl7.harjIR0gHd4eOEVyZ7s.Bfw0AyebJBlxzPhNlxebh.Hm','FDCzSIURQurtJrKu503Td1KXIJWqFxk9Q5cR0GzuEvzg0QABdj1QpA448PDB',1,2,'2026-06-29 07:41:45','2026-06-30 01:54:18'),(20,'Laura Mercedez','ADMIN-1782918264',1,'2026-07-01',1,'3020494949','lauramercedez@gmail.com','$2y$12$uQhVaHk7kDPmaEYXb7QN5OUgI2Z8nBpNQzG39aSJWPI.QD/9CXj/u',NULL,1,1,'2026-07-01 20:04:24','2026-07-01 20:04:24'),(21,'Juan Gomez','000001',1,'2026-03-18',1,'3848858588','juangomez@gmail.com','$2y$12$IlwWlrS3bEUxLH7kbWooxe2YC3MXalZ9yLW2e.5vwIB7nWVPg.nEC',NULL,1,2,'2026-07-06 02:58:31','2026-07-06 02:58:31'),(22,'Maria Martinez','0000002',1,'1980-10-03',2,'3059345694','mariam@gmail.com','$2y$12$IjmhsG.c6D9r7OF2hZ4ni.Xli9ipuG32UvYaqsNRxk9j46G43fx0a',NULL,1,2,'2026-07-06 03:42:08','2026-07-06 03:42:08');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-05 21:22:19
