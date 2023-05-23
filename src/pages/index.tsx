
import type { NextPage } from 'next'

import HeadComponent from "@/components/Head";
import GitHubRepoDataTable from '@/components/DataTable/GitHubRepoDataTable';
import GitHubAppBar from '@/components/GitHubAppBar/GitHubAppBar';

const Home: NextPage = () => {
    return (
        <div>
            <HeadComponent title={'GitHub Stars'} metaData={'See recent GitHub repo\'s and their stars' } />
            <main>
              <GitHubAppBar title="GitHub Repositories - Favorites"></GitHubAppBar>
              <GitHubRepoDataTable/>
            </main>
        </div>
    )
}

export default Home