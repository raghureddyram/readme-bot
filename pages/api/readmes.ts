import GreptileService from '../../lib/greptileService'
const greptileService = new GreptileService();
import { stringify } from 'flatted';
import path from 'path';
import { promises as fs } from 'fs';
import { formatMarkdown } from '@/lib/utils';
import CommitSummarizer from '@/lib/readmeCommitSummarizer';


export default async function handler(req: any, res: any) { // eslint-disable-line
  if (req.method === 'POST') {
    const { repoId, githubUsername, branch } = req.body;
    const commitSummarizer = new CommitSummarizer(repoId, branch)

    try {
        let result = await commitSummarizer.summarizeChanges() || {summary: '', hasReadme: false}
        
        if(!result.hasReadme) {
           const lastChangeSummary = result.summary
          // check for last generated version of readme from DB

          // if no generated version, generate
            const summaries = await greptileService.getReadmeRelatedSummaries(repoId, branch)
            const readmePrompt = `Given a list of change summaries, please provide a README.md file. Key considerations: prerequesites, How to setup, how to run, how to test, sample table relationships, architectural choices.
            \n\n
            These are the summaries: ${summaries}.
            This is the change summary of the last update made: ${lastChangeSummary}
            `
            const readmeFromQuery = await greptileService.baseQuery('readme-history-query', repoId, branch, undefined, readmePrompt);
            
            if(readmeFromQuery.data.sources) {
              const markdownText = formatMarkdown(readmeFromQuery.data.message)

              const dirPath = path.join(process.cwd(), '_generatedFiles');
              
              const filePath = path.join(process.cwd(), '_generatedFiles', `README-${new Date().toISOString()}.md`);
              // Ensure that the directories exist
              await fs.mkdir(dirPath, { recursive: true });
              await fs.writeFile(filePath, markdownText, 'utf8');


              res.status(200).json({data: "file created succefully"});  
            }

          
        }
        res.status(200).json({data: "file created succefully"});  
        
        
    } catch (error) {
      res.status(500).json({ error: stringify(error) });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}