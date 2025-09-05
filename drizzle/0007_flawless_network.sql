ALTER TABLE "airtable_columns" ALTER COLUMN "tableId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "airtable_views" ALTER COLUMN "tableId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "airtable_views" ALTER COLUMN "config" SET DEFAULT '{"sorting":[],"filters":null,"hiddenColumns":[]}';