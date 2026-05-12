-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED', 'WITHDRAWN');

-- CreateTable
CREATE TABLE "Mediator" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "firm" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "yearsOfPractice" INTEGER NOT NULL,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mediator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PracticeArea" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "PracticeArea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediatorPracticeArea" (
    "mediatorId" TEXT NOT NULL,
    "practiceAreaId" TEXT NOT NULL,

    CONSTRAINT "MediatorPracticeArea_pkey" PRIMARY KEY ("mediatorId","practiceAreaId")
);

-- CreateIndex
CREATE INDEX "Mediator_verificationStatus_idx" ON "Mediator"("verificationStatus");

-- CreateIndex
CREATE INDEX "Mediator_state_idx" ON "Mediator"("state");

-- CreateIndex
CREATE INDEX "Mediator_lastName_firstName_idx" ON "Mediator"("lastName", "firstName");

-- CreateIndex
CREATE UNIQUE INDEX "PracticeArea_name_key" ON "PracticeArea"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PracticeArea_slug_key" ON "PracticeArea"("slug");

-- CreateIndex
CREATE INDEX "MediatorPracticeArea_practiceAreaId_idx" ON "MediatorPracticeArea"("practiceAreaId");

-- AddForeignKey
ALTER TABLE "MediatorPracticeArea" ADD CONSTRAINT "MediatorPracticeArea_mediatorId_fkey" FOREIGN KEY ("mediatorId") REFERENCES "Mediator"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediatorPracticeArea" ADD CONSTRAINT "MediatorPracticeArea_practiceAreaId_fkey" FOREIGN KEY ("practiceAreaId") REFERENCES "PracticeArea"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
