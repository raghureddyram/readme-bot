import { NextApiRequest, NextApiResponse } from 'next';
import GreptileService from '../../../lib/services/greptileService';
const greptileService = new GreptileService();
import { findOrCreateGreptileIndex, getGreptileIndex, updateGreptileIndexStatus } from "../_repositories/GreptileIndex"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { repoName, branchName, githubUsername } = req.body;

    if (!repoName || !branchName) {
      return res.status(422).json({ error: 'Unprocessable. Please ensure repoName and branchName are present' });
    }

    try {
      // Step 1: Check if the GreptileIndex already exists
      const greptileIndex = await findOrCreateGreptileIndex(repoName, branchName);

      // Step 3: Check index status from the Greptile service
      let response = {data: {status: undefined}}
      try {
        response = await greptileService.checkIndexStatus(repoName, githubUsername, branchName);
      } catch(error){
        await greptileService.indexRepository(repoName, githubUsername, branchName); // Non-blocking
        return res.status(200).json("Indexing started");
      }
      

      // Step 4: If the index is not completed, trigger non-blocking indexing
      if (response.data.status !== 'completed') {
        greptileService.indexRepository(repoName, githubUsername, branchName); // Non-blocking
      } else if(greptileIndex && greptileIndex.status !== 'completed') {
        // Step 5: If response is complete, update the GreptileIndex status in the database
        await updateGreptileIndexStatus(greptileIndex.id, response.data.status);
      }

      // Step 6: Return the current index status to the client
      return res.status(200).json({ status: response.data.status });
    } catch (error) {
      console.error('Error during index check:', error);
      return res.status(500).json({ error: 'Failed to load' });
    }
  } else {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
}