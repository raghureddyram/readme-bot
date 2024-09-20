import axios from 'axios';
import GreptileService from './greptileService';

type CommitDiff = {
    patches: string[],
    hasReadme: boolean,
}

type GeneratedSummary = {
    summary: string,
    hasReadme: boolean
}
class CommitSummarizer {
    private readonly githubApiUrl: string = 'https://api.github.com';
    private readonly githubToken: string;
    private readonly githubUsername: string;
    private readonly repoId: string;

    constructor(
        repoId: string,
        githubToken: string = process.env.GITHUB_PAT || '',
        githubUsername: string = process.env.GITHUB_USERNAME || ''
       
    ) {
        this.repoId = repoId;
        this.githubToken = githubToken;
        this.githubUsername = githubUsername;
    }

    // Helper function to configure axios headers for GitHub API
    private getGithubHeaders() {
        return {
            Authorization: `Bearer ${this.githubToken}`,
        };
    }

    // Get the commit history from GitHub repository
    private async getCommitHistory(repoId: string, branch: string = 'main'): Promise<any[]> {
        const url = `${this.githubApiUrl}/repos/${this.githubUsername}/${repoId}/commits?path=README.md&sha=${branch}`;
        try {
            const response = await axios.get(url, {
                headers: this.getGithubHeaders(),
            });
            return response.data;
        } catch (error) {
            console.error(`Failed to get commit history: ${error}`);
            throw error;
        }
    }

    // Get the diff between two commits from GitHub
    
    private async getDiffBetweenCommits(repoId: string, latestCommit: string, previousCommit: string): Promise<CommitDiff> {
        const url = `${this.githubApiUrl}/repos/${this.githubUsername}/${repoId}/compare/${previousCommit}...${latestCommit}`;
        try {
            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${this.githubToken}`,
                    Accept: "application/vnd.github.v3+json"
                },
                params: {
                    per_page: 100 // Optional: For large comparisons, use pagination
                }
            });
            if(response?.data?.diff_url){
                const files = response.data.files;
                const patches = files.map((file: any) => file.patch);
                const hasReadme = files.some((file: any) => file.filename.includes('README.md'));
                
                return { patches, hasReadme }
            }
            return { patches: [], hasReadme: false};
        } catch (error) {
            console.error(`Failed to get diff between commits: ${error}`);
            throw error;
        }
    }

    // Summarize the diff using Greptile
    private async summarizeDiff(diffText: string[] | []): Promise<string> {
        const greptileService = new GreptileService();
        const prompt = `Summarize the following git diff:\n\n${diffText}`;

        try {
            const response = await greptileService.baseQuery(this.repoId, 'main', undefined, prompt);
            return response.data.message;
        } catch (error) {
            console.error(`Failed to summarize the diff: ${error}`);
            throw error;
        }
    }

    // Main function to get last two commits history and summarize changes
    public async summarizeChanges(branch: string = 'main'): Promise< GeneratedSummary | undefined > {
        try {
            const commits = await this.getCommitHistory(this.repoId, branch);
            if (commits.length < 2) {
                console.log('Not enough commits found.');
                return;
            }

            // Get diff between the two latest commits
            const {patches, hasReadme} = await this.getDiffBetweenCommits(this.repoId, commits[0].sha, commits[1].sha);
            const summary = await this.summarizeDiff(patches);

            console.log('Summary of changes between last two commits:');
            console.log(summary);

            return {summary, hasReadme}
        } catch (error) {
            console.error('Error summarizing README changes:', error);
        }
    }
}

export default CommitSummarizer;
