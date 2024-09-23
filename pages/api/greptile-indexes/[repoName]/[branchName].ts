import GreptileService from '../../../../lib/services/greptileService';
const greptileService = new GreptileService();

// check for a greptile index
export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    const { repoName, branchName } = req.query;
    if(!repoName || !branchName ){
      return res.status(422).json('Unprocessable. Please ensure repoName and branchName present');
    }

    try {
        
        const response = await greptileService.checkIndexStatus(repoName, undefined, branchName)
        res.status(200).json(response.data.status);
    } catch (error) {
      await greptileService.indexRepository(repoName, undefined, branchName)
      res.status(500).json({ error, message: "Failed to load" });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}