import axios, { AxiosResponse } from 'axios';

class GreptileService {
    private baseUrl: string = 'https://api.greptile.com/v2';

    constructor(
        private apiKey: string = process.env.GREPTILE_API_KEY || '',
        private githubToken: string = process.env.GITHUB_PAT || '',
        private githubUsername: string = process.env.GITHUB_USERNAME || ''
    ) {}

    public async indexRepository(repoId: string, githubUsername: string = this.githubUsername, branch: string = 'main'): Promise<AxiosResponse<any, any>> {
        try {
            const response = await axios.post(
                `${this.baseUrl}/repositories`,
                {
                    remote: 'github',
                    repository: `${githubUsername}/${repoId}`,
                    branch,
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

    public async checkIndexStatus(repoId: string, githubUsername: string = this.githubUsername, branch: string = 'main'): Promise<AxiosResponse<any, any>> {
        const greptileIdentifier = encodeURIComponent(`github:${branch}:${githubUsername}/${repoId}`);
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

    public async getReadmeRelatedSummaries(repoId: string, branch: string = 'main', githubUsername: string = this.githubUsername): Promise<AxiosResponse<any, any>> {
        const greptileQuery = "Show me changes a developer would like to know about, ie what should go into the README.md";
        try {
            const readmeFromQuery = await this.baseQuery(repoId, branch, githubUsername, greptileQuery);
            const summaries = readmeFromQuery.data?.sources.map((source: any) => (source.summary) )
            return summaries;
        } catch (error: any) {
            this.logError('Error creating README', error);
            throw error;
        }
    }

    public async baseQuery(repoId: string, branch: string = 'main', githubUsername: string = this.githubUsername, query: string = ''): Promise<AxiosResponse<any, any>> {
        try {
            const queryPayload = {
                messages: [
                    {
                        id: "readme-history-query",
                        content: query,
                        role: "user",
                    },
                ],
                repositories: [
                    {
                        remote: 'github',
                        repository: `${githubUsername}/${repoId}`,
                        branch,
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
            console.log('README History:', response);
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
