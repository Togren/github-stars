
export interface IGitHubRepository {
  favorite: boolean,
  name: string,
  description: string,
  url: string,
  stargazers_count: number,
  languages_url: string,
}

export interface IGitHubRepoStarSearchResult {
  node: {
    name: string
    description: string
    url: string
    stargazers: {
      totalCount: number
    }
    languages: {
      nodes: Array<{name: string}>
    }
  }
}

export interface IGitHubSearchResult<T> {
  repositoryCount: number
  edges: Array<T>
  pageInfo: {
    endCursor: string
    hasNextPage: boolean
  }
}