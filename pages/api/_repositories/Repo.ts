import { PrismaClient, Repo } from "@prisma/client";

const prisma = new PrismaClient();


export function findRepo(repoName: string): Promise<Repo | null> {
    return prisma.repo.findUnique({
        where: { name: repoName as string },
    });
}