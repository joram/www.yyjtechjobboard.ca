import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
} from '@mui/material';

const Navbar: React.FC = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          YYJ Tech Job Board
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
