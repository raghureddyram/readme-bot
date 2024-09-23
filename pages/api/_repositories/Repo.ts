import { PrismaClient, Repo } from "@prisma/client";

const prisma = new PrismaClient();


export function findRepo(repoName: string): Repo {
    return prisma.repo.findUnique({
        where: { name: repoName as string },
    });
}