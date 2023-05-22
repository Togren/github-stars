import { useEffect, useState, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUpRightFromSquare, faStar as faSolidStar } from '@fortawesome/free-solid-svg-icons';
import { faStar as faRegularStar } from '@fortawesome/free-regular-svg-icons';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-material.css';
import { CellClickedEvent } from 'ag-grid-community';
import { DateTime } from 'luxon';
import { IGitHubRepoStarSearchResult, IGitHubSearchResult } from '@/interfaces/github';

type GitHubRepoDataTableProps = {
  url: string,
  token: string,
}

type GitHubRepository = {
  favorite: boolean,
  name: string,
  description: string,
  url: string,
  stargazers_count: number,
  languages_url: string,
}

const GitHubRepoDataTable = ( props: GitHubRepoDataTableProps ) => {
  const gridRef = useRef();
  // TODO: Explicit type checking could be extracted to mock WINDOW
  const favoriteRepos: Array<string> = (typeof window !== 'undefined' && JSON.parse(window.localStorage.getItem( 'favoriteRepos' )) as Array<string>) || [];

  /**
   * Specifically add/remove repository from localstorage and browser cache
   * @param name Name of the repository
   * @param isFavorite Set/unset as favorite repository
   */
  function setFavoriteRepo(name: string, isFavorite: boolean) {
    if (isFavorite) {
      // Add repo as favorite
      if (!favoriteRepos.includes(name)) {
        // Add repo to favorites
        favoriteRepos.push(name)
        // Add repo to localstorage
        window.localStorage.setItem('favoriteRepos', JSON.stringify(favoriteRepos));
      }
    } else {
      // Remove repo as favorite
      if (favoriteRepos.includes(name)) {
        // Remove repo from favorites
        favoriteRepos.splice(favoriteRepos.indexOf(name), 1);
        // Remove repo from localstorage
        window.localStorage.setItem('favoriteRepos', JSON.stringify(favoriteRepos));
      }
    }
  }

  /**
   * Handle the (de)selection of a repository, adding/removing it from localstorage
   * @param event AG Grid cell clicked event
   */
  function handleFavoriteRepoChange(event: CellClickedEvent) {
    const rowNode = event.node;
    if (rowNode) {
      const { name, favorite } = rowNode.data;
      // Update local cache and storage
      setFavoriteRepo(name, !favorite);
      // Update table data and trigger refresh
      rowNode.setDataValue('favorite', !favorite);
      event.api.applyTransaction({ update: [rowNode.data] })
    }
  }

  /**
   * Generic cell click event handler
   * @param event AG Grid cell clicked event
   */
  function handleCellClick(event: CellClickedEvent) {
    if (event.column.getColId() === 'favorite') {
      handleFavoriteRepoChange(event);
    }
  }

  /**
   * Call GitHub GraphQL endpoint to fetch all data at once
   * @param res Data container of fetched repositories
   * @param afterCursor String from which indicator to fetch the next 50 repositories
   */
  const getRepoData = async (res: Array<GitHubRepository> = [], afterCursor = null) => {
    const startDate = DateTime.now().minus({ days: 7 }).toISODate();
    const query = `query SearchMostStarsPast7Days($afterCursor: String) {
      search(query: "stars:>20 size:>10 created:>${startDate}", type: REPOSITORY, first: 50, after: $afterCursor) {
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
    }`

    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      body: JSON.stringify({
        query,
        variables: { afterCursor }
      }),
      headers: {
        'Authorization': `Bearer ${props.token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      }
    });
    const responseObj = await response.json();

    // Push fetched data into data array
    res.push(...(responseObj.data.search as IGitHubSearchResult<IGitHubRepoStarSearchResult>).edges.map((edge) => {
      const node = edge.node;
      return {
        // TODO: Favorites outside 7 days creation date are now disregarded, should be solved
        favorite: favoriteRepos.includes(node.name),
        name: node.name,
        description: node.description,
        url: node.url,
        stargazers_count: node.stargazers.totalCount,
        languages: node.languages.nodes.map((node) => node.name)
      } as GitHubRepository
    }))
    return responseObj.data.search.pageInfo.hasNextPage ? getRepoData(res, responseObj.data.search.pageInfo.endCursor) : res;
  }

  const [rowData, setRowData] = useState( null );
  useEffect( () => {
    // Define asynchronous data fetching from api
    const getData = async () => {
      // Fetch repositories
      const data = await getRepoData();
      setRowData( data );
    }
    // Call the function
    getData()
      .catch( console.error );
  }, [] );

  const defaultColDef = {
    resizable: true,
    sortable: true,
  };
  const [columnDefs] = useState( [
    {
      field: 'favorite',
      headerName: '',
      width: 75,
      cellClass: ['text-center'],
      sortable: false,
      sort: 'desc',
      cellRenderer: ( params ) => {
        return <FontAwesomeIcon
          id={params.node.rowIndex}
          icon={params.data.favorite ? faSolidStar : faRegularStar}
        />
      }
    },
    {
      field: 'name',
      flex: 1,
    },
    { field: 'description', flex: 2 },
    {
      field: 'stargazers_count',
      headerName: 'Stars',
      filter: 'agNumberColumnFilter',
      width: 125,
      cellClass: ['text-right']
    },
    {
      field: 'languages',
      filter: 'agTextColumnFilter',
      flex: 1
    },
    {
      field: 'url',
      width: 100,
      cellRenderer: ( params ) => {
        return <a href={params.value} target={'_blank'}><FontAwesomeIcon icon={faArrowUpRightFromSquare}/></a>
      },
      cellClass: ['text-center'],
    }
  ] );

  return (
    <div className="ag-theme-material" style={{ height: '100vh' }}>
      <AgGridReact
        id="star_grid"
        ref={gridRef}
        rowData={rowData}
        defaultColDef={defaultColDef}
        columnDefs={columnDefs}
        rowSelection={'multiple'}
        suppressRowClickSelection
        style={{ height: '100%', width: '100%' }}
        onCellClicked={handleCellClick}
        suppressMenuHide
        animateRows
        pagination
        paginationAutoPageSize
      ></AgGridReact>
    </div>
  );
}

export default GitHubRepoDataTable;