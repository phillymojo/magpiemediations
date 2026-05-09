-- Add slug field to Mediator for human-readable public URLs.
-- Temporary DEFAULT '' allows the column to be added to existing rows;
-- the default is dropped immediately so future inserts must supply a slug.

ALTER TABLE "Mediator" ADD COLUMN "slug" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Mediator" ALTER COLUMN "slug" DROP DEFAULT;
CREATE UNIQUE INDEX "Mediator_slug_key" ON "Mediator"("slug");
