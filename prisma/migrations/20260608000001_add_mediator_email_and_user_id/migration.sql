-- Add email and userId fields to Mediator for profile claiming
ALTER TABLE "Mediator" ADD COLUMN "email" TEXT;
ALTER TABLE "Mediator" ADD COLUMN "userId" TEXT;

CREATE UNIQUE INDEX "Mediator_email_key" ON "Mediator"("email");
CREATE UNIQUE INDEX "Mediator_userId_key" ON "Mediator"("userId");

ALTER TABLE "Mediator" ADD CONSTRAINT "Mediator_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
