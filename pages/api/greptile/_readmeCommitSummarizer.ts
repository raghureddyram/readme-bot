import axios from 'axios';
import * as openai from 'openai';

// class ReadmeCommitSummarizer {
//     private baseUrl: string = 'https://api.openai.com/v1';
//     private githubApiUrl: string = 'https://api.github.com';
//     private apiKey: string;
//     private githubToken: string;
//     private githubUsername: string;

//     constructor(
//         apiKey: string = process.env.OPENAI_API_KEY || '',
//         githubToken: string = process.env.GITHUB_PAT || '',
//         githubUsername: string = process.env.GITHUB_USERNAME || ''
//     ) {
//         this.apiKey = apiKey;
//         this.githubToken = githubToken;
//         this.githubUsername = githubUsername;

//         openai.configuration = new openai.Configuration({
//             apiKey: this.apiKey,
//         });
//     }

//     // Get the commit history of README.md from GitHub repository
//     private async getReadmeCommitHistory(repoId: string, branch: string = 'main'): Promise<any[]> {
//         const url = `${this.githubApiUrl}/repos/${this.githubUsername}/${repoId}/commits?path=README.md&sha=${branch}`;
//         const response = await axios.get(url, {
//             headers: {
//                 Authorization: `Bearer ${this.githubToken}`,
//             },
//         });
//         return response.data;
//     }

//     // Get the diff between two commits for README.md from GitHub
//     private async getDiffBetweenCommits(repoId: string, commit1: string, commit2: string): Promise<string> {
//         const url = `${this.githubApiUrl}/repos/${this.githubUsername}/${repoId}/compare/${commit1}...${commit2}`;
//         const response = await axios.get(url, {
//             headers: {
//                 Authorization: `Bearer ${this.githubToken}`,
//             },
//         });
//         return response.data.diff;
//     }

//     // Summarize the diff using OpenAI API
//     private async summarizeDiff(diffText: string): Promise<string> {
//         const response = await openai.createCompletion({
//             model: 'text-davinci-003',
//             prompt: `Summarize the following git diff:\n\n${diffText}`,
//             max_tokens: 150,
//         });
//         return response.data.choices[0].text.trim();
//     }

//     // Main function to get README history and summarize changes
//     public async summarizeReadmeChanges(repoId: string, branch: string = 'main'): Promise<void> {
//         try {
//             const commits = await this.getReadmeCommitHistory(repoId, branch);
//             if (commits.length < 2) {
//                 console.log('Not enough commits found.');
//                 return;
//             }

//             // Get diff between the two latest commits
//             const diff = await this.getDiffBetweenCommits(repoId, commits[0].sha, commits[1].sha);
//             if (!diff) {
//                 console.log('No changes in README.md between the latest commits.');
//                 return;
//             }

//             // Summarize the diff
//             const summary = await this.summarizeDiff(diff);
//             console.log('Summary of changes in README.md:');
//             console.log(summary);
//         } catch (error) {
//             console.error('Error:', error);
//         }
//     }
// }

// export default ReadmeCommitSummarizer;
