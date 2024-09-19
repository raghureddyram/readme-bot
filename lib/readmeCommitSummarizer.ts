import axios from 'axios';
import GreptileService from './greptileService';

class ReadmeCommitSummarizer {
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

    // Get the commit history of README.md from GitHub repository
    private async getReadmeCommitHistory(repoId: string, branch: string = 'main'): Promise<any[]> {
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

    // Get the diff between two commits for README.md from GitHub
    private async getDiffBetweenCommits(repoId: string, commit1: string, commit2: string): Promise<string | []> {
        const url = `${this.githubApiUrl}/repos/${this.githubUsername}/${repoId}/compare/${commit2}...${commit1}`;
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
                return response.data.files.filter((file: any)=> file.filename.includes('README.md')).map((diff: any) => (diff.patch));
            }
            return [];
        } catch (error) {
            console.error(`Failed to get diff between commits: ${error}`);
            throw error;
        }
    }

    // Summarize the diff using Greptile
    private async summarizeDiff(diffText: string[]): Promise<any> {
        const greptileService = new GreptileService();
        const prompt = `Summarize the following git diff:\n\n${diffText}`;

        try {
            const response = await greptileService.baseQuery(this.repoId, 'main', undefined, prompt);
            return response;
        } catch (error) {
            console.error(`Failed to summarize the diff: ${error}`);
            throw error;
        }
    }

    // Main function to get README history and summarize changes
    public async summarizeReadmeChanges(branch: string = 'main'): Promise<void> {
        try {
            const commits = await this.getReadmeCommitHistory(this.repoId, branch);
            if (commits.length < 2) {
                console.log('Not enough commits found.');
                return;
            }

            // Get diff between the two latest commits
            const diff = await this.getDiffBetweenCommits(this.repoId, commits[0].sha, commits[1].sha);
            if (!diff || !diff.length) {
                console.log('No changes in README.md between the latest commits.');
                return;
            }

            // Summarize the diff
            const summary = await this.summarizeDiff(diff);
            console.log('Summary of changes in README.md:');
            console.log(summary);
        } catch (error) {
            console.error('Error summarizing README changes:', error);
        }
    }
}

export default ReadmeCommitSummarizer;
