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
        } catch (error: any) {  // eslint-disable-line
            console.error('Error indexing repository:', error.response?.data || error.message);
            throw error
        }
    }

    public async checkIndexStatus(repoId: string, githubUsername: string = this.githubUsername, branch: string = 'main'): Promise<AxiosResponse<any, any>> {
        const repositoryIdentifier = encodeURIComponent(`github:${branch}:${githubUsername}/${repoId}`);
        try {
            const response = await axios.get(`${this.baseUrl}/repositories/${repositoryIdentifier}`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'X-Github-Token': this.githubToken
                }
            })
            return response;
        } catch (error: any) {
            console.error('Error fetching repository index status:', error.response?.data || error.message);
            throw error
        }
    }

    public async checkReadmeHistory(repoId: string, branch: string = 'main', githubUsername: string = this.githubUsername): Promise<void> {
        try {
            const queryPayload = {
                messages: [
                    {
                        id: "readme-history-query",
                        content: "Show the README history",
                        role: "user"
                    }
                ],
                repositories: [
                    {
                        remote: 'github',
                        repository: `${githubUsername}/${repoId}`,
                        branch
                    }
                ],
            };

            const response = await axios.post(
                `${this.baseUrl}/query`,
                queryPayload,
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'X-Github-Token': this.githubToken,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const readmeHistory = response.data;  // Assuming this API returns a diff of the README history
            console.log('README History:', readmeHistory);

            // Here you can store the history changes and diffs in the database
            // You can write logic to compare the current README with the previous one
            // and store the difference as a new ReadmeVersion record.
        } catch (error: any) {
            console.error('Error fetching README history:', error.response?.data || error.message);
            throw error;
        }
    }

    


}

export default GreptileService;

