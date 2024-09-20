import GreptileService from '../../../lib/greptileService';
const greptileService = new GreptileService();

// check for a greptile index
export default async function handler(req: any, res: any) { // eslint-disable-line
  if (req.method === 'GET') {
    const { repoId } = req.query;
    const { branch } = req.query;

    try {
        const response = await greptileService.checkIndexStatus(repoId, undefined, branch)

        if(response.data.status !== 'completed'){
            // non blocking index call
            greptileService.indexRepository(repoId, undefined, branch)
        }
        res.status(200).json(response.data.status);
    } catch (error) {
      await greptileService.indexRepository(repoId, undefined, branch)
      res.status(500).json({ error, message: "Failed to load" });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}