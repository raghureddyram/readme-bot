
import { S3Retriever } from '@/lib/services/s3Services';
import { stringify } from 'flatted';

export default async function handler(req: any, res: any) { // eslint-disable-line
  if (req.method === 'GET') {
    try {
    const { repoName, branchName } = req.query;
    const pathPrefix = `${repoName}/${branchName}/`
    const retriever = new S3Retriever()
    const fileContents = await retriever.getLastReadme(pathPrefix)
    res.status(200).json({fileContents})
    } catch(error) {
        res.status(500).json({ error: stringify(error) });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}