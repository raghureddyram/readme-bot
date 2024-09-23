-- CreateTable
CREATE TABLE "Repo" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "backendLanguage" TEXT,
    "frontendLanguage" TEXT,

    CONSTRAINT "Repo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Branch" (
    "id" SERIAL NOT NULL,
    "repoId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Branch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GreptileIndex" (
    "id" SERIAL NOT NULL,
    "branchNameId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'submitted',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GreptileIndex_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Readme" (
    "id" SERIAL NOT NULL,
    "branchNameId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "generatedFromCommitHistory" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastCommitSha" TEXT,

    CONSTRAINT "Readme_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Repo_name_key" ON "Repo"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Branch_repoId_name_key" ON "Branch"("repoId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "GreptileIndex_branchNameId_status_key" ON "GreptileIndex"("branchNameId", "status");

-- AddForeignKey
ALTER TABLE "Branch" ADD CONSTRAINT "Branch_repoId_fkey" FOREIGN KEY ("repoId") REFERENCES "Repo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GreptileIndex" ADD CONSTRAINT "GreptileIndex_branchNameId_fkey" FOREIGN KEY ("branchNameId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Readme" ADD CONSTRAINT "Readme_branchNameId_fkey" FOREIGN KEY ("branchNameId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
