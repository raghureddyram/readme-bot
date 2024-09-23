import GreptileService from '../../../lib/services/greptileService'
import { stringify } from 'flatted';
import path from 'path';
import { promises as fs } from 'fs';
import { formatMarkdown } from '@/lib/utils';
import { S3Retriever, S3Uploader } from '@/lib/services/s3Services';
import CommitSummarizer from '@/lib/services/commitSummarizerService';
import { PrismaClient } from '@prisma/client';  // Add Prisma client import
import { findBranch } from '../_repositories/Branch';
import { findRepo } from '../_repositories/Repo';
import { createReadme } from '../_repositories/Readme'

const greptileService = new GreptileService();

export default async function handler(req: any, res: any) {
  if (req.method === 'POST') {
    const { repoName, githubUsername, branchName } = req.body;
    if(!repoName || !branchName){
      return res.status(422).json("Please ensure repoName and branchName sent")
    }
    // Step: Create the Readme record in the database
    const repo = await findRepo(repoName)
    if(!repo){
      return res.status(422).json("Please ensure greptile indexing succeeds first. Index by posting to /api/greptile-indexes")
    }
    const branch = await findBranch(repo.id, branchName)
    if(!branch) {
      return res.status(422).json("Please ensure greptile indexing succeeds first. Index by posting to /api/greptile-indexes")
    }

    const commitSummarizer = new CommitSummarizer(repoName, branchName);

    try {
        const retriever = new S3Retriever();
        const pathPrefix = `${repoName}/${branchName}/`;
        const lastS3file = await retriever.getLastReadme(pathPrefix);
        
        let result = await commitSummarizer.summarizeChanges() || { summary: '', hasReadme: false, latestCommit: undefined };

        // if a manual readme update is detected, do nothing, otherwise proceed.
        if (result.hasReadme) {
            return res.status(200).json({ data: "Readme already available!" });
        }
        console.log("No readme change detected in last commit, attempting readme generation");
        
        const lastChangeSummary = result.summary;

        // Check for the last generated version of the readme from DB. If no generated version exists, generate one.
        const summaries = await greptileService.getReadmeRelatedSummaries(repoName, branchName, result.latestCommit);
        const readmePrompt = `Given a list of change summaries/existing README.md, please provide a README.md file.
        Key considerations: prerequesites, How to setup, how to run, how to test, sample table relationships, architectural choices, possible enhancements.
        \n\n
        These are the summaries/existing_readme: ${summaries}.
        This is the change summary of the last update made: ${lastChangeSummary}`;
        
        const readmeFromQuery = await greptileService.baseQuery(`readme-history-query${result.latestCommit}`, repo.name, branch.name, githubUsername, readmePrompt);
        
        if (readmeFromQuery.data.sources) {
            const markdownText = formatMarkdown(readmeFromQuery.data.message);

            const dirPath = path.join(process.cwd(), '_generatedFiles');
            const fileName = `${new Date().toISOString()}.README.md`;
            
            const filePath = path.join(process.cwd(), '_generatedFiles', fileName);
            // Ensure that the directories exist
            await fs.mkdir(dirPath, { recursive: true });
            await fs.writeFile(filePath, markdownText, 'utf8');

            const s3uploader = new S3Uploader();
            const s3Url = await s3uploader.uploadFile(markdownText, `${repo.name}/${branch.name}/${fileName}`) as string;

            

            const newReadme = await createReadme(branch.id, s3Url, true, result.latestCommit)
           

            console.log('Readme created:', newReadme);
        }
        
        res.status(200).json({ data: "File created successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: stringify(error) });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
