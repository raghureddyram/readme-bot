
import { S3Retriever } from '@/lib/services/s3Services';
import { stringify } from 'flatted';
import { findRepo } from '../../_repositories/Repo';
import { findBranch } from '../../_repositories/Branch';
import { findLastReadMe } from '../../_repositories/Readme';



export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    try {
      const { repoName, branchName } = req.query;

      if (!repoName || !branchName) {
        return res.status(400).json({ message: 'repoName and branchName are required' });
      }

      const repo = await findRepo(repoName)
      if (!repo) {
        return res.status(404).json({ message: `Repo with name ${repoName} not found` });
      }

      const branch = await findBranch(repo.id, branchName as string)


      if (!branch) {
        return res.status(404).json({ message: `Branch ${branchName} for repo ${repoName} not found` });
      }

      const lastReadMe = await findLastReadMe(branch.id)
      if(!lastReadMe) {
        return res.status(404).json({ message: `readme not found for Branch ${branchName} in repo ${repoName}` });
      }
      const retriever = new S3Retriever();
      if(lastReadMe.length && lastReadMe[0].generatedFromCommitHistory){
        // if readme generated and uploaded to s3, retrieve
        const fileContents = await retriever.getFileFromUrl(lastReadMe[0].s3_url)
        return res.status(200).json({ fileContents });
      } else {
        // Step 3: Retrieve the file from S3 using the retrieved branch
        const pathPrefix = `${repoName}/${branchName}/`;
        const fileContents = await retriever.getLastReadme(pathPrefix);

        return res.status(200).json({ fileContents });
      }
    } catch (error) {
      return res.status(500).json({ error: stringify(error) });
    }
  } else {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
}