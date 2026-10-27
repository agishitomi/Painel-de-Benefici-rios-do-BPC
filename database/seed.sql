-- ==============================================================================
-- Prefeitura da Cidade do Recife - Secretaria de Desenvolvimento Social
-- Sistema: Painel de Beneficiário BPC do Recife
-- Arquivo: database/seed.sql
-- Descrição: Estrutura DDL e Carga Inicial de Dados (Seeds)
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS `bpc_recife_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `bpc_recife_db`;

SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------------------------
-- 1. TABELA: usuarios
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nome` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `senha` VARCHAR(255) NOT NULL,
  `ativo` BOOLEAN DEFAULT TRUE,
  `data_criacao` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `data_atualizacao` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 2. TABELA: papeis
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `papeis` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nome` VARCHAR(100) NOT NULL UNIQUE,
  `descricao` TEXT,
  `data_criacao` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `data_atualizacao` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 3. TABELA: permissoes
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `permissoes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nome` VARCHAR(100) NOT NULL UNIQUE,
  `descricao` TEXT,
  `data_criacao` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `data_atualizacao` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 4. TABELA ASSOCIATIVA: usuario_papel
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `usuario_papel` (
  `usuario_id` INT NOT NULL,
  `papel_id` INT NOT NULL,
  PRIMARY KEY (`usuario_id`, `papel_id`),
  CONSTRAINT `fk_up_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_up_papel` FOREIGN KEY (`papel_id`) REFERENCES `papeis` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 5. TABELA ASSOCIATIVA: papel_permissao
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `papel_permissao` (
  `papel_id` INT NOT NULL,
  `permissao_id` INT NOT NULL,
  PRIMARY KEY (`papel_id`, `permissao_id`),
  CONSTRAINT `fk_pp_papel` FOREIGN KEY (`papel_id`) REFERENCES `papeis` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_pp_permissao` FOREIGN KEY (`permissao_id`) REFERENCES `permissoes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 6. TABELA: beneficiarios_bpc
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `beneficiarios_bpc` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `numero_beneficio` VARCHAR(30) NOT NULL UNIQUE,
  `nis` VARCHAR(20) NOT NULL,
  `nome_beneficiario` VARCHAR(255) NOT NULL,
  `cpf_mascarado` VARCHAR(20) NOT NULL,
  `tipo_beneficio` ENUM('BPC_IDOSO', 'BPC_PCD') NOT NULL,
  `bairro_recife` VARCHAR(100) NOT NULL,
  `rpa_recife` VARCHAR(20) NOT NULL,
  `valor_mensal` DECIMAL(10,2) NOT NULL DEFAULT 1412.00,
  `status_cadastral` ENUM('REGULAR', 'EM_REVISAO', 'BLOQUEADO', 'PENDENCIA_CADUNICO') DEFAULT 'REGULAR',
  `cras_referencia` VARCHAR(150) NOT NULL,
  `data_concessao` DATE NOT NULL,
  `data_ultima_atualizacao` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 7. TABELA: paineis
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `paineis` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nome` VARCHAR(150) NOT NULL,
  `codigo` VARCHAR(50) NOT NULL UNIQUE,
  `descricao` TEXT,
  `ativo` BOOLEAN DEFAULT TRUE,
  `data_criacao` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `data_atualizacao` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 8. TABELA: indicadores
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `indicadores` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `painel_id` INT NOT NULL,
  `codigo` VARCHAR(50) NOT NULL UNIQUE,
  `titulo` VARCHAR(150) NOT NULL,
  `descricao` TEXT,
  `fonte_dado` VARCHAR(255) NOT NULL DEFAULT 'MDS / CadÚnico / INSS',
  `tipo_calculo` VARCHAR(50) DEFAULT 'COUNT',
  `valor_atual` DECIMAL(14,2) DEFAULT 0,
  `unidade_medida` VARCHAR(30) DEFAULT 'beneficiários',
  `icone` VARCHAR(50) DEFAULT 'Users',
  `cor` VARCHAR(50) DEFAULT 'blue',
  `ordem` INT DEFAULT 1,
  `ativo` BOOLEAN DEFAULT TRUE,
  `data_criacao` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `data_atualizacao` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_ind_painel` FOREIGN KEY (`painel_id`) REFERENCES `paineis` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ==============================================================================
-- CARGA DE DADOS INICIAIS (SEEDS)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- SEED: permissoes (10 Registros)
-- ------------------------------------------------------------------------------
INSERT INTO `permissoes` (`id`, `nome`, `descricao`, `data_criacao`, `data_atualizacao`) VALUES
(1, 'bpc:visualizar', 'Permite visualizar fichas e lista de beneficiários do BPC Recife', '2025-01-01 08:00:00', '2025-01-01 08:00:00'),
(2, 'bpc:cadastrar', 'Permite cadastrar novo registro de beneficiário ou solicitação BPC', '2025-01-01 08:00:00', '2025-01-01 08:00:00'),
(3, 'bpc:editar', 'Permite atualizar dados cadastrais e status de beneficiários', '2025-01-01 08:00:00', '2025-01-01 08:00:00'),
(4, 'bpc:excluir', 'Permite remover ou arquivar registros de beneficiários', '2025-01-01 08:00:00', '2025-01-01 08:00:00'),
(5, 'bpc:exportar', 'Permite exportar relatórios em formato CSV, Excel e PDF', '2025-01-01 08:00:00', '2025-01-01 08:00:00'),
(6, 'usuarios:gerenciar', 'Controle total sobre criação, edição e inativação de usuários', '2025-01-01 08:00:00', '2025-01-01 08:00:00'),
(7, 'papeis:gerenciar', 'Criação e edição de papéis e perfis de acesso no sistema', '2025-01-01 08:00:00', '2025-01-01 08:00:00'),
(8, 'permissoes:gerenciar', 'Gestão avançada do catálogo de permissões RBAC', '2025-01-01 08:00:00', '2025-01-01 08:00:00'),
(9, 'auditoria:visualizar', 'Consulta aos logs de auditoria e segurança da aplicação', '2025-01-01 08:00:00', '2025-01-01 08:00:00'),
(10, 'relatorios:gerenciais', 'Visualização de dashboards e relatórios consolidados por RPA', '2025-01-01 08:00:00', '2025-01-01 08:00:00')
ON DUPLICATE KEY UPDATE `nome`=VALUES(`nome`), `descricao`=VALUES(`descricao`);

-- ------------------------------------------------------------------------------
-- SEED: papeis (5 Registros)
-- ------------------------------------------------------------------------------
INSERT INTO `papeis` (`id`, `nome`, `descricao`, `data_criacao`, `data_atualizacao`) VALUES
(1, 'Administrador Geral', 'Acesso irrestrito a todas as funções, usuários e módulos do sistema.', '2025-01-01 08:00:00', '2025-01-01 08:00:00'),
(2, 'Gestor Municipal BPC', 'Gestão das políticas municipais do BPC, monitoramento territorial e relatórios das RPAs.', '2025-01-01 08:00:00', '2025-01-01 08:00:00'),
(3, 'Assistente Social / CRAS', 'Operador de referência nas unidades de CRAS para atendimento e atualização cadastral.', '2025-01-01 08:00:00', '2025-01-01 08:00:00'),
(4, 'Auditor / Fiscal', 'Acesso de auditoria e fiscalização com permissões de consulta e relatórios analíticos.', '2025-01-01 08:00:00', '2025-01-01 08:00:00'),
(5, 'Consulta Básica', 'Perfil restrito apenas para verificação cadastral sem poderes de alteração.', '2025-01-01 08:00:00', '2025-01-01 08:00:00')
ON DUPLICATE KEY UPDATE `nome`=VALUES(`nome`), `descricao`=VALUES(`descricao`);

-- ------------------------------------------------------------------------------
-- SEED: papel_permissao (Vínculos RBAC)
-- ------------------------------------------------------------------------------
-- Administrador Geral: Todas as 10 permissões
INSERT IGNORE INTO `papel_permissao` (`papel_id`, `permissao_id`) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8), (1, 9), (1, 10),
-- Gestor Municipal BPC: Visualizar, cadastrar, editar, exportar, relatórios
(2, 1), (2, 2), (2, 3), (2, 5), (2, 10),
-- Assistente Social: Visualizar, cadastrar, editar, exportar
(3, 1), (3, 2), (3, 3), (3, 5),
-- Auditor / Fiscal: Visualizar, exportar, auditoria, relatórios
(4, 1), (4, 5), (4, 9), (4, 10),
-- Consulta Básica: Visualizar
(5, 1);

-- ------------------------------------------------------------------------------
-- SEED: usuarios (5 Registros com senhas em hash bcrypt - 'admin123')
-- ------------------------------------------------------------------------------
INSERT INTO `usuarios` (`id`, `nome`, `email`, `senha`, `ativo`, `data_criacao`, `data_atualizacao`) VALUES
(1, 'Alberto Barbieri', 'alberto.barbieri@recife.pe.gov.br', '$2a$10$X8m1ZsqJpXp9q8n6G3XFqeqj6GfR2v5yH7sU8rK9k0l1m2n3o4p5q', 1, '2025-01-10 08:30:00', '2025-01-10 08:30:00'),
(2, 'Dra. Maria Luiza Santos', 'maria.santos@recife.pe.gov.br', '$2a$10$X8m1ZsqJpXp9q8n6G3XFqeqj6GfR2v5yH7sU8rK9k0l1m2n3o4p5q', 1, '2025-01-15 09:15:00', '2025-01-15 09:15:00'),
(3, 'Carlos Eduardo Ferreira (CRAS Santo Amaro)', 'carlos.ferreira@recife.pe.gov.br', '$2a$10$X8m1ZsqJpXp9q8n6G3XFqeqj6GfR2v5yH7sU8rK9k0l1m2n3o4p5q', 1, '2025-02-01 10:00:00', '2025-02-01 10:00:00'),
(4, 'Juliana Mendes de Oliveira (Auditoria)', 'juliana.oliveira@recife.pe.gov.br', '$2a$10$X8m1ZsqJpXp9q8n6G3XFqeqj6GfR2v5yH7sU8rK9k0l1m2n3o4p5q', 1, '2025-02-12 14:20:00', '2025-02-12 14:20:00'),
(5, 'Rafael Costa Albuquerque', 'rafael.albuquerque@recife.pe.gov.br', '$2a$10$X8m1ZsqJpXp9q8n6G3XFqeqj6GfR2v5yH7sU8rK9k0l1m2n3o4p5q', 0, '2025-03-01 11:45:00', '2025-04-10 16:30:00')
ON DUPLICATE KEY UPDATE `nome`=VALUES(`nome`), `ativo`=VALUES(`ativo`);

-- ------------------------------------------------------------------------------
-- SEED: usuario_papel
-- ------------------------------------------------------------------------------
INSERT IGNORE INTO `usuario_papel` (`usuario_id`, `papel_id`) VALUES
(1, 1), -- Alberto: Administrador Geral
(1, 2), -- Alberto: Gestor Municipal BPC
(2, 2), -- Maria Luiza: Gestor Municipal BPC
(3, 3), -- Carlos Eduardo: Assistente Social
(4, 4), -- Juliana: Auditor
(5, 5); -- Rafael: Consulta Básica

-- ------------------------------------------------------------------------------
-- SEED: beneficiarios_bpc (Amostragem territorial das 6 RPAs do Recife)
-- ------------------------------------------------------------------------------
INSERT INTO `beneficiarios_bpc` (`id`, `numero_beneficio`, `nis`, `nome_beneficiario`, `cpf_mascarado`, `tipo_beneficio`, `bairro_recife`, `rpa_recife`, `valor_mensal`, `status_cadastral`, `cras_referencia`, `data_concessao`, `data_ultima_atualizacao`) VALUES
(1, '870.192.831-2', '128.94821.90-3', 'Severina Maria de Jesus Cavalcanti', '***.482.194-**', 'BPC_IDOSO', 'Casa Amarela', 'RPA 3', 1412.00, 'REGULAR', 'CRAS Alto do Mandu / Casa Amarela', '2018-04-12', '2025-02-10 10:14:00'),
(2, '870.994.120-8', '209.11284.45-1', 'João Manoel da Silva Filho', '***.931.028-**', 'BPC_PCD', 'Ibura', 'RPA 6', 1412.00, 'REGULAR', 'CRAS Ibura de Cima', '2020-09-01', '2025-01-18 11:30:00'),
(3, '871.304.551-0', '130.44910.82-7', 'Francisca Lindalva dos Santos', '***.109.384-**', 'BPC_IDOSO', 'Várzea', 'RPA 4', 1412.00, 'EM_REVISAO', 'CRAS Várzea / CDU', '2019-11-20', '2025-03-05 14:00:00'),
(4, '872.481.902-3', '238.99120.14-5', 'Matheus Gabriel Oliveira de Arruda', '***.720.441-**', 'BPC_PCD', 'Santo Amaro', 'RPA 1', 1412.00, 'REGULAR', 'CRAS Santo Amaro / Campo Grande', '2021-06-15', '2025-02-28 09:45:00'),
(5, '873.110.492-9', '161.78201.33-9', 'Maria das Dores Nascimento', '***.349.882-**', 'BPC_IDOSO', 'Afogados', 'RPA 5', 1412.00, 'PENDENCIA_CADUNICO', 'CRAS Afogados / San Martin', '2017-08-04', '2025-03-12 16:10:00'),
(6, '874.802.139-4', '194.20938.71-2', 'Antônio Carlos Bezerra Leite', '***.551.290-**', 'BPC_PCD', 'Água Fria', 'RPA 2', 1412.00, 'BLOQUEADO', 'CRAS Campina do Barreto / Água Fria', '2016-03-22', '2025-01-05 08:20:00'),
(7, '875.992.301-1', '210.49182.09-8', 'Luzia Barbosa de Albuquerque', '***.812.399-**', 'BPC_IDOSO', 'Boa Viagem', 'RPA 6', 1412.00, 'REGULAR', 'CRAS Boa Viagem / Pina', '2022-01-10', '2025-02-15 13:50:00'),
(8, '876.441.802-5', '180.33910.48-6', 'Claudio Roberto de Freitas', '***.604.192-**', 'BPC_PCD', 'Torre', 'RPA 4', 1412.00, 'REGULAR', 'CRAS Cordeiro / Torre', '2023-05-18', '2025-03-01 15:20:00')
ON DUPLICATE KEY UPDATE `nome_beneficiario`=VALUES(`nome_beneficiario`), `status_cadastral`=VALUES(`status_cadastral`);

-- ==============================================================================
-- 7. SEED: paineis (1 Painel Principal Solicitado)
-- ==============================================================================
INSERT INTO `paineis` (`id`, `nome`, `codigo`, `descricao`, `ativo`, `data_criacao`, `data_atualizacao`) VALUES
(
  1,
  'Painel de Beneficiário BPC do Recife',
  'PAINEL_BPC_RECIFE',
  'Painel central de monitoramento, territorialização e acompanhamento dos beneficiários do Benefício de Prestação Continuada (BPC/LOAS) na Cidade do Recife.',
  1,
  '2025-01-01 08:00:00',
  '2025-01-01 08:00:00'
)
ON DUPLICATE KEY UPDATE `nome`=VALUES(`nome`), `descricao`=VALUES(`descricao`), `ativo`=VALUES(`ativo`);

-- ==============================================================================
-- 8. SEED: indicadores (3 Indicadores Solicitados Vinculados ao Painel 1)
-- ==============================================================================
-- Indicador 1: Total de beneficiários
-- Indicador 2: Beneficiários idosos
-- Indicador 3: Beneficiários com deficiência
INSERT INTO `indicadores` (`id`, `painel_id`, `codigo`, `titulo`, `descricao`, `fonte_dado`, `tipo_calculo`, `valor_atual`, `unidade_medida`, `icone`, `cor`, `ordem`, `ativo`, `data_criacao`, `data_atualizacao`) VALUES
(
  1,
  1,
  'TOTAL_BENEFICIARIOS',
  'Total de Beneficiários',
  'Quantitativo consolidado de beneficiários do BPC (Idosos e PCD) ativos e cadastrados no município do Recife.',
  'MDS / SAGICAD / INSS - Folha Mensal BPC Recife',
  'COUNT',
  8.00,
  'beneficiários',
  'Users',
  'blue',
  1,
  1,
  '2025-01-01 08:00:00',
  '2025-01-01 08:00:00'
),
(
  2,
  1,
  'BENEFICIARIOS_IDOSOS',
  'Beneficiários Idosos',
  'Quantitativo de idosos com 65 anos ou mais em situação de vulnerabilidade beneficiários do BPC/LOAS no Recife.',
  'INSS / Dataprev - Benefício Espécie 88 (Amparo Social ao Idoso)',
  'COUNT',
  4.00,
  'idosos',
  'UserCheck',
  'indigo',
  2,
  1,
  '2025-01-01 08:00:00',
  '2025-01-01 08:00:00'
),
(
  3,
  1,
  'BENEFICIARIOS_DEFICIENCIA',
  'Beneficiários com Deficiência',
  'Quantitativo de pessoas com deficiência física, intelectual, visual ou auditiva atendidas pelo benefício BPC PCD no Recife.',
  'INSS / Dataprev - Benefício Espécie 87 (Amparo Social à PCD)',
  'COUNT',
  4.00,
  'PCD',
  'CreditCard',
  'violet',
  3,
  1,
  '2025-01-01 08:00:00',
  '2025-01-01 08:00:00'
)
ON DUPLICATE KEY UPDATE 
  `titulo`=VALUES(`titulo`),
  `descricao`=VALUES(`descricao`),
  `fonte_dado`=VALUES(`fonte_dado`),
  `tipo_calculo`=VALUES(`tipo_calculo`),
  `valor_atual`=VALUES(`valor_atual`),
  `unidade_medida`=VALUES(`unidade_medida`),
  `icone`=VALUES(`icone`),
  `cor`=VALUES(`cor`),
  `ordem`=VALUES(`ordem`),
  `ativo`=VALUES(`ativo`);
