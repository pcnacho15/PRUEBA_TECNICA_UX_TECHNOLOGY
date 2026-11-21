-- =============================================================================
-- Base de datos y tabla única: ordenes_servicio
-- Motor: MySQL 8.0.16+ (las restricciones CHECK se aplican a partir de esa versión)
-- Docker ejecuta este script automáticamente al crear el volumen por primera vez.
-- =============================================================================

-- El cliente mysql del contenedor lee el archivo como latin1 si no se indica.
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS ux_prueba_tecnica CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE ux_prueba_tecnica;

CREATE TABLE IF NOT EXISTS ordenes_servicio (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo_orden VARCHAR(30) NOT NULL UNIQUE,
  cliente_nombre VARCHAR(150) NOT NULL,
  cantidad_items INT NOT NULL DEFAULT 1,
  valor_total DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  porcentaje_descuento DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
  fecha_solicitud DATE NOT NULL,
  estado VARCHAR(20) NOT NULL DEFAULT 'Pendiente',
  prioridad VARCHAR(20) NOT NULL DEFAULT 'Media',
  observaciones TEXT NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,

  -- Validación explícita a nivel de base de datos (segunda línea de defensa tras los DTOs)
  CONSTRAINT chk_ordenes_cantidad_items CHECK (cantidad_items >= 1),
  CONSTRAINT chk_ordenes_valor_total CHECK (valor_total >= 0),
  CONSTRAINT chk_ordenes_porcentaje_descuento CHECK (porcentaje_descuento BETWEEN 0 AND 100),
  CONSTRAINT chk_ordenes_estado CHECK (estado IN ('Pendiente', 'En Proceso', 'Completada', 'Cancelada')),
  CONSTRAINT chk_ordenes_prioridad CHECK (prioridad IN ('Baja', 'Media', 'Alta', 'Crítica')),
  CONSTRAINT chk_ordenes_activo CHECK (activo IN (0, 1)),

  -- Índices para el listado (filtra por activo, estado y cliente; ordena por fecha_creacion)
  INDEX idx_ordenes_activo_estado (activo, estado),
  INDEX idx_ordenes_cliente_nombre (cliente_nombre),
  INDEX idx_ordenes_fecha_creacion (fecha_creacion)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

INSERT INTO ordenes_servicio (codigo_orden, cliente_nombre, cantidad_items, valor_total,
  porcentaje_descuento, fecha_solicitud, estado, prioridad, observaciones) VALUES
('ORD-2026-001', 'Grupo Réditos S.A.', 5, 2500000.00, 10.00, '2026-11-15', 'En Proceso',
  'Alta', 'Implementación módulo transaccional'),
('ORD-2026-002', 'Filial Comercial Norte', 2, 850500.50, 0.00, '2026-11-18', 'Pendiente',
  'Media', 'Soporte preventivo de terminales'),
('ORD-2026-003', 'Distribuidora Andina Ltda.', 12, 4320000.75, 5.50, '2026-11-20', 'Completada',
  'Baja', NULL),
('ORD-2026-004', 'Servicios Integrales del Sur', 1, 150000.00, 0.00, '2026-11-21', 'Cancelada',
  'Crítica', 'Cancelada por el cliente antes de la visita técnica');
