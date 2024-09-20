import axios from 'axios';
import GreptileService from './greptileService';

type CommitDiff = {
    diff: string,
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
    private readonly branch: string;

    constructor(
        repoId: string,
        branch: string = 'main',
        githubToken: string = process.env.GITHUB_PAT || '',
        githubUsername: string = process.env.GITHUB_USERNAME || ''
       
    ) {
        this.repoId = repoId;
        this.branch = branch;
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
    private async getCommitHistory(): Promise<any[]> {
        const url = `${this.githubApiUrl}/repos/${this.githubUsername}/${this.repoId}/commits?sha=${this.branch}`;
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
    
    private async getDiffBetweenCommits(latestCommit: string, previousCommit: string): Promise<CommitDiff> {
        const url = `${this.githubApiUrl}/repos/${this.githubUsername}/${this.repoId}/compare/${previousCommit}...${latestCommit}`;
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
                const diffResponse = await axios.get(response.data.diff_url);

                const files = response.data.files;
                const hasReadme = files.some((file: any) => file.filename.includes('README.md'));
                
                return { diff: diffResponse.data, hasReadme }
            }
            return { diff: '', hasReadme: false};
        } catch (error) {
            console.error(`Failed to get diff between commits: ${error}`);
            throw error;
        }
    }

    // Summarize the diff using Greptile
    private async summarizeDiff(diffText: string): Promise<string> {
        const greptileService = new GreptileService();
        const prompt = `Summarize the following git diff:\n\n${diffText}`;

        try {
            const response = await greptileService.baseQuery('summarize-diff-query', this.repoId, this.branch, undefined, prompt);
            return response.data.message;
        } catch (error) {
            console.error(`Failed to summarize the diff: ${error}`);
            throw error;
        }
    }

    // Main function to get last two commits history and summarize changes
    public async summarizeChanges(): Promise< GeneratedSummary | undefined > {
        try {
            const commits = await this.getCommitHistory();
            if (commits.length < 2) {
                console.log('Not enough commits found.');
                return;
            }

            // Get diff between the two latest commits
            const {diff, hasReadme} = await this.getDiffBetweenCommits(commits[0].sha, commits[1].sha);
            const summary = await this.summarizeDiff(diff);

            console.log('Summary of changes between last two commits:');
            console.log(summary);

            return {summary, hasReadme}
        } catch (error) {
            console.error('Error summarizing README changes:', error);
        }
    }
}

export default CommitSummarizer;
