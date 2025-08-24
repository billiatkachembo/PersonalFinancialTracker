import React from 'react';

// The Layout component acts as a wrapper for all pages, providing a consistent
// header, main content area, and footer.
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans antialiased">
      {/* Header section with a brand name */}
     

      {/* Main content area */}
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer with a copyright notice */}
      <footer className="w-full border-t bg-muted px-4 py-6 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} Billiat. All rights reserved.
      </footer>
    </div>
  );
};

export default Layout;
