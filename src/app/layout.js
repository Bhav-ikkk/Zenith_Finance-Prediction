"use client"
import './globals.css';
import Navbar from './components/Navbar';
import { ClerkProvider } from '@clerk/nextjs';
import Sidebar from '../app/sidebar/page';
import { Box } from '@mui/material';
import { createContext, useState } from 'react';

// Create a context for sidebar state
export const SidebarContext = createContext();

export default function RootLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <html lang="en">
      <body>
        <ClerkProvider>
          <SidebarContext.Provider value={{ sidebarOpen, setSidebarOpen }}>
            <Box sx={{ display: 'flex', minHeight: '100vh' }}>
              {/* Sidebar */}
              <Sidebar />
              {/* Main Content */}
              <Box
                component="main"
                sx={{
                  flexGrow: 1,
                  width: sidebarOpen ? 'calc(100% - 240px)' : 'calc(100% - 72px)',
                  marginLeft: 0, // Remove margin to eliminate gap
                  transition: 'width 0.3s ease', // Smooth transition
                  backgroundColor: '#f8fafc',
                }}
              >
                <Navbar />
                {children}
              </Box>
            </Box>
          </SidebarContext.Provider>
        </ClerkProvider>
      </body>
    </html>
  );
}