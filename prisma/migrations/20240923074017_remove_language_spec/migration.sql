/*
  Warnings:

  - You are about to drop the column `backendLanguage` on the `Repo` table. All the data in the column will be lost.
  - You are about to drop the column `frontendLanguage` on the `Repo` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Repo" DROP COLUMN "backendLanguage",
DROP COLUMN "frontendLanguage";
