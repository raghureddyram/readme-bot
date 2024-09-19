



import GreptileService from './_greptileService';
const greptileService = new GreptileService();

export default async function handler(req: any, res: any) { // eslint-disable-line
  if (req.method === 'GET') {
    const { repoId } = req.query;

    

    try {
        const readmeHistory = await greptileService.checkReadmeHistory(repoId)
        // const indexResponse = await greptileService.checkIndexStatus(repoId)
        res.status(200).json(readmeHistory.data);

        // if (indexResponse.data.status === "completed"){
        //     res.status(200).json(indexResponse.data);
        // }   else {
        //     const indexing = await greptileService.indexRepository(repoId);
        //     res.status(200).json(indexing.data);
        // }
    } catch (error) {
      res.status(500).json({ error, message: "Failed to load" });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}