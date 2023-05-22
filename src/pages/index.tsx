
import type { NextPage } from 'next'

import HeadComponent from "@/components/Head";
import GitHubRepoDataTable from '@/components/DataTable/GitHubRepoDataTable';
import GitHubAppBar from '@/components/GitHubAppBar/GitHubAppBar';

// TODO: Route Github API requests via API to hide GITHUB token
const GITHUB_PARAMS = {
  token: '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'
}

const Home: NextPage = () => {
    return (
        <div>
            <HeadComponent title={'GitHub Stars'} metaData={'See recent GitHub repo\'s and their stars' } />
            <main>
              <GitHubAppBar title="GitHub Repositories - Favorites"></GitHubAppBar>
                <GitHubRepoDataTable
                  token={GITHUB_PARAMS.token}
                />
            </main>
        </div>
    )
}

export default Home