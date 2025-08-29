CREATE TABLE "airtable_base" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"userId" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "airtable_cell_values" (
	"id" serial PRIMARY KEY NOT NULL,
	"rowId" integer NOT NULL,
	"columnId" integer NOT NULL,
	"value" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "airtable_columns" (
	"id" serial PRIMARY KEY NOT NULL,
	"tableId" integer,
	"name" varchar(255) NOT NULL,
	"type" text DEFAULT 'text' NOT NULL,
	"orderIndex" integer NOT NULL,
	"primary" boolean
);
--> statement-breakpoint
CREATE TABLE "airtable_rows" (
	"id" serial PRIMARY KEY NOT NULL,
	"tableId" integer,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "airtable_tables" (
	"id" serial PRIMARY KEY NOT NULL,
	"baseId" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "airtable_views" (
	"id" serial PRIMARY KEY NOT NULL,
	"tableId" integer,
	"name" text NOT NULL,
	"config" jsonb DEFAULT '{}' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "airtable_base" ADD CONSTRAINT "airtable_base_userId_airtable_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."airtable_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "airtable_cell_values" ADD CONSTRAINT "airtable_cell_values_rowId_airtable_rows_id_fk" FOREIGN KEY ("rowId") REFERENCES "public"."airtable_rows"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "airtable_cell_values" ADD CONSTRAINT "airtable_cell_values_columnId_airtable_columns_id_fk" FOREIGN KEY ("columnId") REFERENCES "public"."airtable_columns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "airtable_columns" ADD CONSTRAINT "airtable_columns_tableId_airtable_tables_id_fk" FOREIGN KEY ("tableId") REFERENCES "public"."airtable_tables"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "airtable_rows" ADD CONSTRAINT "airtable_rows_tableId_airtable_tables_id_fk" FOREIGN KEY ("tableId") REFERENCES "public"."airtable_tables"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "airtable_tables" ADD CONSTRAINT "airtable_tables_baseId_airtable_base_id_fk" FOREIGN KEY ("baseId") REFERENCES "public"."airtable_base"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "airtable_views" ADD CONSTRAINT "airtable_views_tableId_airtable_tables_id_fk" FOREIGN KEY ("tableId") REFERENCES "public"."airtable_tables"("id") ON DELETE cascade ON UPDATE no action;