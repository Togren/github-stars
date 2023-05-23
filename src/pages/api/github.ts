import { DateTime } from 'luxon';
import { graphql } from '@octokit/graphql';
import * as dotenv from 'dotenv';

import { IGitHubRepository, IGitHubRepoStarSearchResult, IGitHubSearchResult } from '@/interfaces/github';

dotenv.config();
const graphqlWithAuth = graphql.defaults({
  headers: {
    'Authorization': `Bearer ${process.env.GITHUB_APP_TOKEN}`,
  },
});

const GITHUB_GRAPHQL_QUERIES = new Map<string, string>([
  ['searchMostStarsPast7Days', `query SearchMostStarsPast7Days($queryString: String!, $afterCursor: String) {
      search(query: $queryString, type: REPOSITORY, first: 50, after: $afterCursor) {
          repositoryCount
          edges {
              node {
                  ...on Repository {
                      name
                      description
                      stargazers {
                          totalCount
                      }
                      url
                      languages(first: 10) {
                          nodes {
                              name
                          }
                      }
                  }
              }
          }
          pageInfo {
              endCursor
              hasNextPage
          }
      }
    }`],
]);

function handleSearchMostStarsPast7Days() {
  /**
   * Call GitHub GraphQL endpoint to fetch all data at once
   * @param res Data container of fetched repositories
   * @param afterCursor String from which indicator to fetch the next 50 repositories
   */
  const getRepoData = async (res: Array<IGitHubRepository> = [], afterCursor = null) => {
    const startDate = DateTime.now().minus({ days: 7 }).toISODate();
    const query = GITHUB_GRAPHQL_QUERIES.get('searchMostStarsPast7Days');
    const { search } = await graphqlWithAuth({
      query,
      queryString: `stars:>20 size:>10 created:>${startDate}`,
      afterCursor,
    })
    // Push fetched data into data array
    res.push(...(search as IGitHubSearchResult<IGitHubRepoStarSearchResult>).edges.map((edge) => {
      const node = edge.node;
      return {
        // TODO: Favorites outside 7 days creation date are now disregarded, should be solved
        favorite: false,
        name: node.name,
        description: node.description,
        url: node.url,
        stargazers_count: node.stargazers.totalCount,
        languages: node.languages.nodes.map((node) => node.name)
      } as IGitHubRepository
    }))
    return search.pageInfo.hasNextPage ? getRepoData(res, search.pageInfo.endCursor) : res;
  }
  return getRepoData();
}

const API_HANDLER_FUNCS = new Map<string, Function>([
  ['searchMostStarsPast7Days', handleSearchMostStarsPast7Days],
]);

export default async function handler(req, res) {
  switch (req.method) {
    case 'POST':
      if (!req.body.type || !API_HANDLER_FUNCS.has(req.body.type)) {
        const msg = 'Invalid request - No or invalid POST type provided.'
        console.error(msg);
        res.status(400).json({ error: msg })
      }
      try {
        const response = await API_HANDLER_FUNCS.get( req.body.type )!()
        res.status(200).json({ data: response });
        break;
      } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
        break;
      }
    default:
      const msg = 'Invalid request - No or invalid request method provided.'
      console.error(msg);
      res.status(400).json({ error: msg })
  }
}
