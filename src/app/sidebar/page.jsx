"use client";
import { useContext } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from "@mui/material/styles";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Box,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  Dashboard as DashboardIcon,
  AccountBalance as AccountBalanceIcon,
  Receipt as ReceiptIcon,
  Savings as SavingsIcon,
  Settings as SettingsIcon,
  PieChart as PieChartIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from "@mui/icons-material";
import { SidebarContext } from '../layout';

const drawerWidth = 240;
const collapsedWidth = 72;

const StyledDrawer = styled(Drawer)(({ theme, open }) => ({
  width: open ? drawerWidth : collapsedWidth,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
  '& .MuiDrawer-paper': {
    width: open ? drawerWidth : collapsedWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    borderRight: 'none',
    boxShadow: theme.shadows[3],
    backgroundColor: theme.palette.background.default,
  },
}));

const menuItems = [
  { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
  { text: "Analytics", icon: <AccountBalanceIcon />, path: "/checker" },
  { text: "Transactions", icon: <ReceiptIcon />, path: "/transactions" },
  { text: "Investments", icon: <SavingsIcon />, path: "/investments" },
  { text: "Reports", icon: <PieChartIcon />, path: "/reports" },
];

export default function Sidebar() {
  const theme = useTheme();
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useContext(SidebarContext);

  const handleDrawerToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <StyledDrawer variant="permanent" open={sidebarOpen}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: theme.spacing(2),
          height: 64,
        }}
      >
        {sidebarOpen && (
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            FinancePro
          </Typography>
        )}
        <IconButton
          onClick={handleDrawerToggle}
          size="small"
          aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {sidebarOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
      </Box>

      <Divider />

      <List sx={{ px: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
            <Link href={item.path} passHref legacyBehavior>
              <ListItemButton
                selected={pathname === item.path}
                sx={{
                  minHeight: 48,
                  justifyContent: sidebarOpen ? 'initial' : 'center',
                  px: 2.5,
                  borderRadius: 1,
                  mb: 0.5,
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                  },
                  '&.Mui-selected': {
                    backgroundColor: theme.palette.action.selected,
                    '&:hover': {
                      backgroundColor: theme.palette.action.selected,
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: sidebarOpen ? 2 : 'auto',
                    justifyContent: 'center',
                    color: pathname === item.path
                      ? theme.palette.primary.main
                      : theme.palette.text.secondary,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{ opacity: sidebarOpen ? 1 : 0 }}
                  primaryTypographyProps={{
                    variant: 'body2',
                    fontWeight: 500,
                    color: pathname === item.path
                      ? theme.palette.primary.main
                      : theme.palette.text.primary,
                  }}
                />
              </ListItemButton>
            </Link>
          </ListItem>
        ))}
      </List>

      <Box sx={{ mt: 'auto' }}>
        <Divider />
        <List sx={{ px: 1 }}>
          <ListItem disablePadding sx={{ display: 'block' }}>
            <Link href="/settings" passHref legacyBehavior>
              <ListItemButton
                selected={pathname === '/settings'}
                sx={{
                  minHeight: 48,
                  justifyContent: sidebarOpen ? 'initial' : 'center',
                  px: 2.5,
                  borderRadius: 1,
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                  },
                  '&.Mui-selected': {
                    backgroundColor: theme.palette.action.selected,
                    '&:hover': {
                      backgroundColor: theme.palette.action.selected,
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: sidebarOpen ? 2 : 'auto',
                    justifyContent: 'center',
                    color: pathname === '/settings'
                      ? theme.palette.primary.main
                      : theme.palette.text.secondary,
                  }}
                >
                  <SettingsIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Settings"
                  sx={{ opacity: sidebarOpen ? 1 : 0 }}
                  primaryTypographyProps={{
                    variant: 'body2',
                    fontWeight: 500,
                    color: pathname === '/settings'
                      ? theme.palette.primary.main
                      : theme.palette.text.primary,
                  }}
                />
              </ListItemButton>
            </Link>
          </ListItem>
        </List>
      </Box>
    </StyledDrawer>
  );
}