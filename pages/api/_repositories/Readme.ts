import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Create a new Readme record
export async function createReadme(branchId: number, s3Url: string, generatedFromCommitHistory: boolean, lastCommitSha?: string) {
  return await prisma.readme.create({
    data: {
      branchId,
      s3_url: s3Url,
      generatedFromCommitHistory,
      lastCommitSha,
    },
  });
}

// Create a new Readme record
export async function findLastReadMe(branchId: number) {
  return await prisma.readme.findMany({
    where: { branchId },
    orderBy: {
      createdAt: 'desc',
    },
    take: 1,
  });
}
