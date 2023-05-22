import { Typography, AppBar, styled, Toolbar } from '@mui/material';

type GitHubAppBarComponentProps = {
  title: string
}

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  alignItems: 'flex-end',
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(0.5),
  // Override media queries injected by theme.mixins.toolbar
  '@media all': {
    minHeight: 128,
  },
}));

const GitHubAppBar = ({title}: AppBarComponentProps) => {

  return (
    <AppBar position='static'>
      <StyledToolbar>
        <Typography variant="h4"
        className="font-thin">
          {title}
        </Typography>
      </StyledToolbar>
    </AppBar>
  )
}

export default GitHubAppBar;