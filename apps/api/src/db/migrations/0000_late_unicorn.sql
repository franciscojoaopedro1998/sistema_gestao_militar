CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"accountId" text NOT NULL,
	"providerId" text NOT NULL,
	"userId" text NOT NULL,
	"accessToken" text,
	"refreshToken" text,
	"idToken" text,
	"accessTokenExpiresAt" timestamp,
	"refreshTokenExpiresAt" timestamp,
	"scope" text,
	"password" text,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "barracks" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"capacity" integer DEFAULT 20 NOT NULL,
	"occupied_beds" integer DEFAULT 0 NOT NULL,
	"type" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "course_personnel" (
	"id" text PRIMARY KEY NOT NULL,
	"course_id" text NOT NULL,
	"user_id" text NOT NULL,
	"war_name" text NOT NULL,
	"rank" text NOT NULL,
	"role" text DEFAULT 'ALUNO' NOT NULL,
	"status" text DEFAULT 'Inscrito' NOT NULL,
	"grade" text
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"instructor" text NOT NULL,
	"duration_hours" text NOT NULL,
	"status" text DEFAULT 'Inscrições Abertas' NOT NULL,
	"start_date" text NOT NULL,
	"end_date" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "historico_eventos" (
	"id" text PRIMARY KEY NOT NULL,
	"militar_id" text NOT NULL,
	"tipo" text NOT NULL,
	"data" text NOT NULL,
	"descricao" text NOT NULL,
	"detalhes" text
);
--> statement-breakpoint
CREATE TABLE "maintenance_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"vehicle_id" text NOT NULL,
	"description" text NOT NULL,
	"start_date" timestamp DEFAULT now() NOT NULL,
	"end_date" timestamp,
	"status" text DEFAULT 'EM_ANDAMENTO' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "militares" (
	"id" text PRIMARY KEY NOT NULL,
	"nip" text NOT NULL,
	"patente" text NOT NULL,
	"tipo_prestacao_servico" text NOT NULL,
	"forma_prestacao_servico" text,
	"nome" text NOT NULL,
	"bi" text NOT NULL,
	"data_nascimento" text NOT NULL,
	"sexo" text NOT NULL,
	"grupo_sanguineo" text NOT NULL,
	"altura" text NOT NULL,
	"peso" text NOT NULL,
	"calcado" text NOT NULL,
	"uniforme" text NOT NULL,
	"pai" text NOT NULL,
	"mae" text NOT NULL,
	"estado_civil" text NOT NULL,
	"endereco" text NOT NULL,
	"telefones" text NOT NULL,
	"email" text NOT NULL,
	"contato_acidente_nome" text NOT NULL,
	"contato_acidente_parentesco" text NOT NULL,
	"contato_acidente_telefone" text NOT NULL,
	"formacao_academica" text NOT NULL,
	"data_incorporacao" text NOT NULL,
	"funcao" text NOT NULL,
	"formacao_militar" text NOT NULL,
	"unidade_militar" text NOT NULL,
	"companhia" text NOT NULL,
	"pelotao" text NOT NULL,
	"seccao" text NOT NULL,
	"equipa" text NOT NULL,
	"data_ultima_promocao" text NOT NULL,
	"situacao" text NOT NULL,
	"especialidade" text NOT NULL,
	"foto" text,
	"data_previsao_retorno" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "militares_nip_unique" UNIQUE("nip"),
	CONSTRAINT "militares_bi_unique" UNIQUE("bi")
);
--> statement-breakpoint
CREATE TABLE "mission_personnel" (
	"id" text PRIMARY KEY NOT NULL,
	"mission_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" text DEFAULT 'COMBATENTE' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "missions" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"local" text,
	"status" text DEFAULT 'PLANEJADA' NOT NULL,
	"risk_level" text DEFAULT 'BAIXO' NOT NULL,
	"route_coordinates" text,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"data_fim_previsa" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"token" text NOT NULL,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL,
	"ipAddress" text,
	"userAgent" text,
	"userId" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"emailVerified" boolean NOT NULL,
	"image" text,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL,
	"war_name" text,
	"rank" text DEFAULT 'SOLDADO',
	"military_id" text,
	"blood_type" text,
	"specialty" text,
	"status" text DEFAULT 'ATIVO',
	"barrack_id" text,
	CONSTRAINT "user_email_unique" UNIQUE("email"),
	CONSTRAINT "user_military_id_unique" UNIQUE("military_id")
);
--> statement-breakpoint
CREATE TABLE "vehicles" (
	"id" text PRIMARY KEY NOT NULL,
	"plate" text NOT NULL,
	"type" text NOT NULL,
	"model" text NOT NULL,
	"fuel_type" text NOT NULL,
	"odometer" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'PRONTO' NOT NULL,
	"fuel_level" integer DEFAULT 100 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "vehicles_plate_unique" UNIQUE("plate")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp,
	"updatedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "weapon_loans" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"weapon_id" text NOT NULL,
	"loan_officer_id" text NOT NULL,
	"loaned_at" timestamp DEFAULT now() NOT NULL,
	"returned_at" timestamp,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "weapons" (
	"id" text PRIMARY KEY NOT NULL,
	"serial_number" text NOT NULL,
	"type" text NOT NULL,
	"model" text NOT NULL,
	"caliber" text NOT NULL,
	"status" text DEFAULT 'DISPONIVEL' NOT NULL,
	"last_inspection" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "weapons_serial_number_unique" UNIQUE("serial_number")
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_personnel" ADD CONSTRAINT "course_personnel_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_personnel" ADD CONSTRAINT "course_personnel_user_id_militares_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."militares"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "historico_eventos" ADD CONSTRAINT "historico_eventos_militar_id_militares_id_fk" FOREIGN KEY ("militar_id") REFERENCES "public"."militares"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance_logs" ADD CONSTRAINT "maintenance_logs_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mission_personnel" ADD CONSTRAINT "mission_personnel_mission_id_missions_id_fk" FOREIGN KEY ("mission_id") REFERENCES "public"."missions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mission_personnel" ADD CONSTRAINT "mission_personnel_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weapon_loans" ADD CONSTRAINT "weapon_loans_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weapon_loans" ADD CONSTRAINT "weapon_loans_weapon_id_weapons_id_fk" FOREIGN KEY ("weapon_id") REFERENCES "public"."weapons"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weapon_loans" ADD CONSTRAINT "weapon_loans_loan_officer_id_user_id_fk" FOREIGN KEY ("loan_officer_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;