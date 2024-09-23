import axios, { AxiosResponse } from 'axios';

class GreptileService {
    private baseUrl: string = 'https://api.greptile.com/v2';

    constructor(
        private apiKey: string = process.env.GREPTILE_API_KEY || '',
        private githubToken: string = process.env.GITHUB_PAT || '',
        private githubUsername: string = process.env.GITHUB_USERNAME || ''
    ) {}

    public async indexRepository(repoName: string, githubUsername: string = this.githubUsername, branchName: string = 'main'): Promise<AxiosResponse<any, any>> {
        try {
            const response = await axios.post(
                `${this.baseUrl}/repositories`,
                {
                    remote: 'github',
                    repository: `${githubUsername}/${repoName}`,
                    branch: branchName,
                },
                {
                    headers: {
                        Authorization: `Bearer ${this.apiKey}`,
                        'X-Github-Token': this.githubToken,
                    },
                }
            );
            return response;
        } catch (error) { 
            this.logError('Error indexing repository', error);
            throw error;
        }
    }

    public async checkIndexStatus(repoName: string, githubUsername: string = this.githubUsername, branchName: string = 'main'): Promise<AxiosResponse<any, any>> {
        const greptileIdentifier = encodeURIComponent(`github:${branchName}:${githubUsername}/${repoName}`);
        try {
            const response = await axios.get(`${this.baseUrl}/repositories/${greptileIdentifier}`, {
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    'X-Github-Token': this.githubToken,
                },
            });
            return response;
        } catch (error: any) {
            this.logError('Error fetching repository index status', error);
            throw error;
        }
    }

    public async getReadmeRelatedSummaries(repoName: string, branchName: string, latestCommit?: string, githubUsername: string = this.githubUsername): Promise<AxiosResponse<any, any>> {
        const greptileQuery = `Show me changes a developer for ${repoName} would like to know about, ie what should go into the README.md`;
        try {
            const readmeFromQuery = await this.baseQuery(`readme-related-summaries${latestCommit}`, repoName, branchName, githubUsername, greptileQuery);
            const summaries = readmeFromQuery.data?.sources.map((source: any) => (source.summary) )
            return summaries;
        } catch (error: any) {
            this.logError('Error creating README', error);
            throw error;
        }
    }

    public async baseQuery(greptileQueryIdentifier: string, repoName: string, branchName: string = 'main', githubUsername: string = this.githubUsername, query: string = ''): Promise<AxiosResponse<any, any>> {
        try {
            const queryPayload = {
                messages: [
                    {
                        id: greptileQueryIdentifier,
                        content: query,
                        role: "user",
                    },
                ],
                repositories: [
                    {
                        remote: 'github',
                        repository: `${githubUsername}/${repoName}`,
                        branch: branchName,
                    },
                ],
            };

            const response = await axios.post(
                `${this.baseUrl}/query`,
                queryPayload,
                {
                    headers: {
                        Authorization: `Bearer ${this.apiKey}`,
                        'X-Github-Token': this.githubToken,
                        'Content-Type': 'application/json',
                    },
                }
            );
            console.log('Greptile query output:', response);
            return response;
        } catch (error: any) {
            this.logError('Error fetching README history', error);
            throw error;
        }
    }

    private logError(message: string, error: any): void {
        console.error(`${message}:`, error.response?.data || error.message);
    }
}

export default GreptileService;
