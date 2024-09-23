import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createRepo(repoName: string) {
  const newRepo = await prisma.repo.create({
    data: {
      backendLanguage: 'Python',
      frontendLanguage: 'React',
      metadata: { description: repoName},
    },
  });

  console.log(newRepo);
  return newRepo;
}