/*
  Warnings:

  - You are about to drop the column `branchNameId` on the `GreptileIndex` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[branchId]` on the table `GreptileIndex` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `branchId` to the `GreptileIndex` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "GreptileIndex" DROP CONSTRAINT "GreptileIndex_branchNameId_fkey";

-- DropIndex
DROP INDEX "GreptileIndex_branchNameId_status_key";

-- AlterTable
ALTER TABLE "GreptileIndex" DROP COLUMN "branchNameId",
ADD COLUMN     "branchId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "GreptileIndex_branchId_key" ON "GreptileIndex"("branchId");

-- AddForeignKey
ALTER TABLE "GreptileIndex" ADD CONSTRAINT "GreptileIndex_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
