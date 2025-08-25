CREATE TABLE "airtable_account" (
	"userId" varchar(255) NOT NULL,
	"type" varchar(255) NOT NULL,
	"provider" varchar(255) NOT NULL,
	"providerAccountId" varchar(255) NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" varchar(255),
	"scope" varchar(255),
	"id_token" text,
	"session_state" varchar(255),
	CONSTRAINT "airtable_account_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE "airtable_session" (
	"sessionToken" varchar(255) PRIMARY KEY NOT NULL,
	"userId" varchar(255) NOT NULL,
	"expires" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "airtable_user" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"email" varchar(255) NOT NULL,
	"image" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "airtable_verification_token" (
	"identifier" varchar(255) NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires" timestamp with time zone NOT NULL,
	CONSTRAINT "airtable_verification_token_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
ALTER TABLE "airtable_account" ADD CONSTRAINT "airtable_account_userId_airtable_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."airtable_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "airtable_session" ADD CONSTRAINT "airtable_session_userId_airtable_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."airtable_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "airtable_account" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "t_user_id_idx" ON "airtable_session" USING btree ("userId");