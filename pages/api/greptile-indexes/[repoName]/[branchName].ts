import GreptileService from '../../../../lib/services/greptileService';
import { getGreptileIndex } from '../../_repositories/GreptileIndex';
const greptileService = new GreptileService();

// check for a greptile index
export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    const { repoName, branchName } = req.query;
    const { githubUsername } = req.query; //pass as query param as needed
    if(!repoName || !branchName ){
      return res.status(422).json('Unprocessable. Please ensure repoName and branchName present');
    }

    try {
        const greptileIndex = await getGreptileIndex(repoName, branchName)
        if(!greptileIndex || greptileIndex && greptileIndex.status === "completed") {
          return res.status(200).json(greptileIndex.status);
        }
        const response = await greptileService.checkIndexStatus(repoName, githubUsername, branchName)
        res.status(200).json(response.data.status);
    } catch (error) {
      await greptileService.indexRepository(repoName, githubUsername, branchName)
      res.status(500).json({ error, message: "Failed to load" });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}