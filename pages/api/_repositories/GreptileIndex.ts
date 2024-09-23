import { PrismaClient } from '@prisma/client';
import { findBranch, createBranch } from './Branch';
import { findRepo } from './Repo';

const prisma = new PrismaClient();

export async function findOrCreateGreptileIndex(repoName: string, branchName: string, status: string = 'submitted') {
  try {
    let repo = await findRepo(repoName)

    if (!repo) {
      repo = await prisma.repo.create({
        data: { name: repoName },
      });
    }

    // Step 2: Find or create the Branch
    let branch = await findBranch(repo.id, branchName)

    if (!branch) {
      branch = await createBranch(repo.id, branchName);
    }

    // Step 3: Create a GreptileIndex for the Branch
    let greptileIndex = await prisma.greptileIndex.findUnique({
      where: {
        branchId: branch.id
      },
    });

    if(!greptileIndex){
      greptileIndex = await prisma.greptileIndex.create({
        data: {
          branchId: branch.id,
          status,
        },
      });
    }

    return greptileIndex;
  }catch(error){
    console.error("Error creating GreptileIndex:", error);
    throw error
  }
}

export async function getGreptileIndex(repoName: string, branchName: string) {
  try {
    // Step 1: Find the Repo by name
    const repo = await prisma.repo.findUnique({
      where: { name: repoName },
    });

    if (!repo) {
      throw new Error(`Repo with name ${repoName} not found`);
    }

    // Step 2: Find the Branch by composite key (repoId and branchName name)
    const branch = await prisma.branch.findUnique({
      where: {
        repoId_name: {
          repoId: repo.id,
          name: branchName,
        },
      },
    });

    if (!branch) {
      throw new Error(`Branch ${branchName} for repo ${repoName} not found`);
    }

    // Step 3: Find the GreptileIndex for the specific branchName
    const greptileIndex = await prisma.greptileIndex.findUnique({
      where: {
        branchId: branch.id,
      },
    });

    if (!greptileIndex) {
      throw new Error(`GreptileIndex for branchName ${branchName} in repo ${repoName} not found`);
    }

    return greptileIndex;

  } catch (error) {
    console.error("Error fetching GreptileIndex:", error);
    throw error;
  }
}

export async function updateGreptileIndexStatus(greptileIndexId: number, status: string) {
  try {
    const updatedGreptileIndex = await prisma.greptileIndex.update({
      where: {
        id: greptileIndexId,
      },
      data: {
        status: status,
      },
    });
    return updatedGreptileIndex;
  } catch (error) {
    console.error("Error updating GreptileIndex:", error);
    throw error;
  }
}