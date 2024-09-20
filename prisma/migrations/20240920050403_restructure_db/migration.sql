/*
  Warnings:

  - You are about to drop the column `lastUpdated` on the `Readme` table. All the data in the column will be lost.
  - You are about to drop the column `projectId` on the `Readme` table. All the data in the column will be lost.
  - You are about to drop the `GitHubUser` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Project` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ReadmeChanges` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SetupSteps` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TestingSteps` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `repoId` to the `Readme` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Readme" DROP CONSTRAINT "Readme_projectId_fkey";

-- DropForeignKey
ALTER TABLE "ReadmeChanges" DROP CONSTRAINT "ReadmeChanges_githubUserId_fkey";

-- DropForeignKey
ALTER TABLE "ReadmeChanges" DROP CONSTRAINT "ReadmeChanges_readmeId_fkey";

-- DropForeignKey
ALTER TABLE "SetupSteps" DROP CONSTRAINT "SetupSteps_projectId_fkey";

-- DropForeignKey
ALTER TABLE "SetupSteps" DROP CONSTRAINT "SetupSteps_readmeId_fkey";

-- DropForeignKey
ALTER TABLE "TestingSteps" DROP CONSTRAINT "TestingSteps_projectId_fkey";

-- DropForeignKey
ALTER TABLE "TestingSteps" DROP CONSTRAINT "TestingSteps_readmeId_fkey";

-- AlterTable
ALTER TABLE "Readme" DROP COLUMN "lastUpdated",
DROP COLUMN "projectId",
ADD COLUMN     "generatedFromCommitHistory" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastCommitSha" TEXT,
ADD COLUMN     "repoId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "GitHubUser";

-- DropTable
DROP TABLE "Project";

-- DropTable
DROP TABLE "ReadmeChanges";

-- DropTable
DROP TABLE "SetupSteps";

-- DropTable
DROP TABLE "TestingSteps";

-- CreateTable
CREATE TABLE "GreptileIndex" (
    "id" SERIAL NOT NULL,
    "repoId" INTEGER NOT NULL,
    "branch" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GreptileIndex_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Repo" (
    "id" SERIAL NOT NULL,
    "backendLanguage" TEXT,
    "frontendLanguage" TEXT,
    "metadata" JSONB NOT NULL,

    CONSTRAINT "Repo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GreptileIndex_repoId_key" ON "GreptileIndex"("repoId");

-- AddForeignKey
ALTER TABLE "GreptileIndex" ADD CONSTRAINT "GreptileIndex_repoId_fkey" FOREIGN KEY ("repoId") REFERENCES "Repo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Readme" ADD CONSTRAINT "Readme_repoId_fkey" FOREIGN KEY ("repoId") REFERENCES "Repo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
