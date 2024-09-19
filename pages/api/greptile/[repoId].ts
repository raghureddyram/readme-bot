import GreptileService from '../../../lib/greptileService';
const greptileService = new GreptileService();

// check for a greptile index
export default async function handler(req: any, res: any) { // eslint-disable-line
  if (req.method === 'GET') {
    const { repoId } = req.query;

    try {
        const response = await greptileService.checkIndexStatus(repoId)

        if(response.data.status !== 'complete'){
            // non blocking index call
            greptileService.indexRepository(repoId)
        }
        res.status(200).json(response.data.status);
    } catch (error) {
      res.status(500).json({ error, message: "Failed to load" });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}