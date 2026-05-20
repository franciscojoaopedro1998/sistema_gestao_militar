import { pgTable, text, timestamp, boolean, integer } from "drizzle-orm/pg-core";

// --- BETTER AUTH & PROFILE TABLES ---

export const users = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull(),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
  
  // Custom Military Fields
  warName: text("war_name"),
  rank: text("rank").default("SOLDADO"), // 'SOLDADO', 'CABO', 'SARGENTO', etc.
  militaryId: text("military_id").unique(),
  bloodType: text("blood_type"),
  specialty: text("specialty"),
  status: text("status").default("ATIVO"),
  barrackId: text("barrack_id"),
});

export const sessions = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
});

export const accounts = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
});

export const verifications = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt"),
  updatedAt: timestamp("updatedAt"),
});

// --- MILITARY DOMAIN TABLES ---

// Armas (Weapons)
export const weapons = pgTable("weapons", {
  id: text("id").primaryKey(),
  serialNumber: text("serial_number").notNull().unique(),
  type: text("type").notNull(),
  model: text("model").notNull(),
  caliber: text("caliber").notNull(),
  status: text("status").notNull().default("DISPONIVEL"),
  lastInspection: timestamp("last_inspection"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Cautelas (Weapon Loans)
export const weaponLoans = pgTable("weapon_loans", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "restrict" }),
  weaponId: text("weapon_id").notNull().references(() => weapons.id, { onDelete: "restrict" }),
  loanOfficerId: text("loan_officer_id").notNull().references(() => users.id),
  loanedAt: timestamp("loaned_at").defaultNow().notNull(),
  returnedAt: timestamp("returned_at"),
  notes: text("notes"),
});

// Viaturas (Vehicles)
export const vehicles = pgTable("vehicles", {
  id: text("id").primaryKey(),
  plate: text("plate").notNull().unique(),
  type: text("type").notNull(),
  model: text("model").notNull(),
  fuelType: text("fuel_type").notNull(),
  odometer: integer("odometer").notNull().default(0),
  status: text("status").notNull().default("PRONTO"),
  fuelLevel: integer("fuel_level").notNull().default(100),
  createdAt: timestamp("created_at").defaultNow(),
});

// Histórico de Manutenção de Viaturas
export const maintenanceLogs = pgTable("maintenance_logs", {
  id: text("id").primaryKey(),
  vehicleId: text("vehicle_id").notNull().references(() => vehicles.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  startDate: timestamp("start_date").defaultNow().notNull(),
  endDate: timestamp("end_date"),
  status: text("status").notNull().default("EM_ANDAMENTO"),
});

// Alojamentos (Barracks)
export const barracks = pgTable("barracks", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  capacity: integer("capacity").notNull().default(20),
  occupiedBeds: integer("occupied_beds").notNull().default(0),
  type: text("type").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Missões / Patrulhas (Missions)
export const missions = pgTable("missions", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  local: text("local"), // Added for target requirements
  status: text("status").notNull().default("PLANEJADA"), // 'Planejada', 'Em Curso', 'Concluída'
  riskLevel: text("risk_level").notNull().default("BAIXO"),
  routeCoordinates: text("route_coordinates"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  dataFimPrevisa: text("data_fim_previsa"), // Added for target requirements
  createdAt: timestamp("created_at").defaultNow(),
});

// Militares Designados na Missão
export const missionPersonnel = pgTable("mission_personnel", {
  id: text("id").primaryKey(),
  missionId: text("mission_id").notNull().references(() => missions.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: text("role").notNull().default("COMBATENTE"),
});

// --- NEW ADVANCED MILITARY MANAGEMENT TABLES ---

// Militares (Soldiers/Efetivo)
export const militares = pgTable("militares", {
  id: text("id").primaryKey(),
  nip: text("nip").notNull().unique(), // Número de Identificação Pessoal
  patente: text("patente").notNull(), // Enum Patente
  tipoPrestacaoServico: text("tipo_prestacao_servico").notNull(), // Enum TipoPrestacaoServico
  formaPrestacaoServico: text("forma_prestacao_servico"),
  nome: text("nome").notNull(),
  bi: text("bi").notNull().unique(), // Bilhete de Identidade
  dataNascimento: text("data_nascimento").notNull(),
  sexo: text("sexo").notNull(), // "M" | "F"
  grupoSanguineo: text("grupo_sanguineo").notNull(),
  altura: text("altura").notNull(),
  peso: text("peso").notNull(),
  calcado: text("calcado").notNull(),
  uniforme: text("uniforme").notNull(),
  pai: text("pai").notNull(),
  mae: text("mae").notNull(),
  estadoCivil: text("estado_civil").notNull(), // Enum EstadoCivil
  endereco: text("endereco").notNull(),
  telefones: text("telefones").notNull(), // Guardado como JSON string de strings
  email: text("email").notNull(),
  contatoAcidenteNome: text("contato_acidente_nome").notNull(),
  contatoAcidenteParentesco: text("contato_acidente_parentesco").notNull(),
  contatoAcidenteTelefone: text("contato_acidente_telefone").notNull(),
  formacaoAcademica: text("formacao_academica").notNull(),
  dataIncorporacao: text("data_incorporacao").notNull(),
  funcao: text("funcao").notNull(),
  formacaoMilitar: text("formacao_militar").notNull(),
  unidadeMilitar: text("unidade_militar").notNull(), // Enum Unidade
  companhia: text("companhia").notNull(),
  pelotao: text("pelotao").notNull(),
  seccao: text("seccao").notNull(),
  equipa: text("equipa").notNull(),
  dataUltimaPromocao: text("data_ultima_promocao").notNull(),
  situacao: text("situacao").notNull(), // Enum Situacao
  especialidade: text("especialidade").notNull(),
  foto: text("foto"),
  dataPrevisaoRetorno: text("data_previsao_retorno"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Histórico de Eventos do Militar
export const historicoEventos = pgTable("historico_eventos", {
  id: text("id").primaryKey(),
  militarId: text("militar_id").notNull().references(() => militares.id, { onDelete: "cascade" }),
  tipo: text("tipo").notNull(), // "PROMOÇÃO" | "MISSÃO" | "FÉRIAS" | "PUNIÇÃO" | "LOUVOR"
  data: text("data").notNull(),
  descricao: text("descricao").notNull(),
  detalhes: text("detalhes"),
});

// Cursos / Treinamentos Militares
export const courses = pgTable("courses", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  instructor: text("instructor").notNull(),
  durationHours: text("duration_hours").notNull(),
  status: text("status").notNull().default("Inscrições Abertas"), // 'Inscrições Abertas', 'Em Curso', 'Concluído'
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Alunos e Monitores Matriculados nos Cursos
export const coursePersonnel = pgTable("course_personnel", {
  id: text("id").primaryKey(),
  courseId: text("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => militares.id, { onDelete: "cascade" }),
  warName: text("war_name").notNull(),
  rank: text("rank").notNull(),
  role: text("role").notNull().default("ALUNO"), // 'ALUNO' | 'MONITOR' | 'INSTRUTOR'
  status: text("status").notNull().default("Inscrito"), // 'Inscrito' | 'Aprovado' | 'Reprovado'
  grade: text("grade"),
});
