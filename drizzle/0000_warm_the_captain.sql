CREATE TABLE IF NOT EXISTS "embeddings" (
	"id" varchar NOT NULL,
	"model" varchar NOT NULL,
	"vector" double precision[] NOT NULL,
	"duration" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "labels" (
	"id" varchar PRIMARY KEY NOT NULL,
	"model" varchar NOT NULL,
	"variant" varchar NOT NULL,
	"title" varchar NOT NULL,
	"text" text,
	"mod" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "logs" (
	"time" timestamp DEFAULT now(),
	"event" varchar DEFAULT 'info',
	"message" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "models" (
	"id" varchar PRIMARY KEY NOT NULL,
	"label" varchar NOT NULL,
	"tier" varchar NOT NULL,
	"provider" varchar NOT NULL,
	"model" varchar NOT NULL,
	"variant" varchar,
	"embed" boolean DEFAULT false NOT NULL,
	"generate" boolean DEFAULT false NOT NULL,
	"function" boolean DEFAULT false NOT NULL,
	"image" boolean DEFAULT false NOT NULL,
	"specialty" boolean DEFAULT false NOT NULL,
	"prefix" varchar,
	"notes" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "positions" (
	"id" varchar NOT NULL,
	"model" varchar NOT NULL,
	"plane" double precision[] NOT NULL,
	"space" double precision[] NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "post_labels" (
	"post" varchar,
	"label" varchar,
	"model" varchar NOT NULL,
	"technique" varchar NOT NULL,
	"variant" varchar NOT NULL,
	"raw" varchar,
	"duration" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "posts" (
	"id" varchar PRIMARY KEY NOT NULL,
	"created" date NOT NULL,
	"title" varchar NOT NULL,
	"url" varchar NOT NULL,
	"text" text NOT NULL,
	"author" varchar NOT NULL,
	"comments" integer DEFAULT 0 NOT NULL,
	"score" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "prompts" (
	"id" varchar PRIMARY KEY NOT NULL,
	"text" varchar NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "post_labels" ADD CONSTRAINT "post_labels_post_posts_id_fk" FOREIGN KEY ("post") REFERENCES "public"."posts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "post_labels" ADD CONSTRAINT "post_labels_label_labels_id_fk" FOREIGN KEY ("label") REFERENCES "public"."labels"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
