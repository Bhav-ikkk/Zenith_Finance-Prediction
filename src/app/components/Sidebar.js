'use client';
import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar } from '@mui/material';
import SavingsIcon from '@mui/icons-material/Savings';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import HomeIcon from '@mui/icons-material/Home';
import Link from 'next/link';

const drawerWidth = 220;

export default function Sidebar() {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: '#f3e5f5',
        },
      }}
    >
      <Toolbar />
      <List>
        <ListItem button component={Link} href="/">
          <ListItemIcon><HomeIcon /></ListItemIcon>
          <ListItemText primary="Home" />
        </ListItem>

        <ListItem button component={Link} href="/pay">
          <ListItemIcon><AccountBalanceWalletIcon /></ListItemIcon>
          <ListItemText primary="Start Gulak" />
        </ListItem>

        <ListItem button component={Link} href="/locked_balance">
          <ListItemIcon><SavingsIcon /></ListItemIcon>
          <ListItemText primary="My Gulak" />
        </ListItem>
      </List>
    </Drawer>
  );
}
