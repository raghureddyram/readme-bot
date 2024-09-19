-- CreateTable
CREATE TABLE "Readme" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "projectId" INTEGER NOT NULL,
    "lastUpdated" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Readme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReadmeChanges" (
    "id" SERIAL NOT NULL,
    "readmeId" INTEGER NOT NULL,
    "contentDiff" TEXT NOT NULL,
    "githubUserId" INTEGER NOT NULL,
    "changeType" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReadmeChanges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GitHubUser" (
    "id" SERIAL NOT NULL,
    "githubUsername" TEXT NOT NULL,
    "email" TEXT,
    "contributionsCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "GitHubUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "repoUrl" TEXT NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SetupSteps" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "stepOrder" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "isRequired" BOOLEAN NOT NULL,
    "readmeId" INTEGER,

    CONSTRAINT "SetupSteps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestingSteps" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "stepOrder" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "isRequired" BOOLEAN NOT NULL,
    "readmeId" INTEGER,

    CONSTRAINT "TestingSteps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GitHubUser_githubUsername_key" ON "GitHubUser"("githubUsername");

-- AddForeignKey
ALTER TABLE "Readme" ADD CONSTRAINT "Readme_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReadmeChanges" ADD CONSTRAINT "ReadmeChanges_readmeId_fkey" FOREIGN KEY ("readmeId") REFERENCES "Readme"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReadmeChanges" ADD CONSTRAINT "ReadmeChanges_githubUserId_fkey" FOREIGN KEY ("githubUserId") REFERENCES "GitHubUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SetupSteps" ADD CONSTRAINT "SetupSteps_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SetupSteps" ADD CONSTRAINT "SetupSteps_readmeId_fkey" FOREIGN KEY ("readmeId") REFERENCES "Readme"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestingSteps" ADD CONSTRAINT "TestingSteps_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestingSteps" ADD CONSTRAINT "TestingSteps_readmeId_fkey" FOREIGN KEY ("readmeId") REFERENCES "Readme"("id") ON DELETE SET NULL ON UPDATE CASCADE;
