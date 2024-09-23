import { PrismaClient, Branch } from '@prisma/client'; // Import Branch type if needed

const prisma = new PrismaClient();


export async function findBranch(repoId: number, branchName: string): Promise<Branch | null> {
    return prisma.branch.findUnique({
            where: {
            repoId_name: {
                repoId: repoId,
                name: branchName,
            },
        },
    });
}

export async function createBranch(repoId: number, branchName: string): Promise<Branch | null> {
    return prisma.branch.create({
        data: {
        repoId,
        name: branchName,
        },
    });
}