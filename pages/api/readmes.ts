import GreptileService from '../../lib/greptileService'
const greptileService = new GreptileService();
import { stringify } from 'flatted';
import path from 'path';
import { promises as fs } from 'fs';
import { formatMarkdown } from '@/lib/makdown';
import ReadmeCommitSummarizer from '@/lib/readmeCommitSummarizer';


export default async function handler(req: any, res: any) { // eslint-disable-line
  if (req.method === 'POST') {
    const { repoId, githubUsername } = req.body;
    const readmeCommitSummarizer = new ReadmeCommitSummarizer(repoId)

    try {

        const readmeDiffs = await readmeCommitSummarizer.summarizeReadmeChanges()
          res.status(200).json({data: "file created succefully"});  
        // const summaries = await greptileService.getReadmeRelatedSummaries(repoId)
        // const readmePrompt = `Given a list of change summaries, please provide a README.md file. Key considerations: How to setup, how to run, how to test, sample table relationships.
        // \n\n
        // These are the summaries: ${summaries}.
        // `
        // const readmeFromQuery = await greptileService.baseQuery(repoId, undefined, undefined, readmePrompt);
        
        // if(readmeFromQuery.data.sources) {
        //   const markdownText = formatMarkdown(readmeFromQuery.data.message)

        //   const dirPath = path.join(process.cwd(), '_generatedFiles');
          
        //   const filePath = path.join(process.cwd(), '_generatedFiles', `README-${new Date().toISOString()}.md`);
        //   // Ensure that the directories exist
        //   await fs.mkdir(dirPath, { recursive: true });
        //   await fs.writeFile(filePath, markdownText, 'utf8');


        //   res.status(200).json({data: "file created succefully"});  
        // }
        
    } catch (error) {
      res.status(500).json({ error: stringify(error) });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}