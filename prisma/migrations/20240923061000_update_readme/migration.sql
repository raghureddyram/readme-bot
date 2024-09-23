/*
  Warnings:

  - You are about to drop the column `branchNameId` on the `Readme` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `Readme` table. All the data in the column will be lost.
  - Added the required column `branchId` to the `Readme` table without a default value. This is not possible if the table is not empty.
  - Added the required column `s3_url` to the `Readme` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Readme" DROP CONSTRAINT "Readme_branchNameId_fkey";

-- AlterTable
ALTER TABLE "Readme" DROP COLUMN "branchNameId",
DROP COLUMN "content",
ADD COLUMN     "branchId" INTEGER NOT NULL,
ADD COLUMN     "s3_url" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Readme" ADD CONSTRAINT "Readme_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
