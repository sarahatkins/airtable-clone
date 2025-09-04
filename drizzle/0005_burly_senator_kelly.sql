ALTER TABLE "airtable_cell_values" ALTER COLUMN "tableId" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "airtable_views" ALTER COLUMN "config" SET DEFAULT '[object Object]';