import React, { Suspense, useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { SignedIn, SignedOut, UserButton, SignInButton } from '@clerk/clerk-react';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { DataErrorBoundary } from './components/ui/DataErrorBoundary';
import { useSuspenseProperties } from './hooks/useProperties';
import { PropertiesSkeleton } from './components/ui/PropertiesSkeleton';
import { useDebounce } from './hooks/useDebounce';
import './App.css';

function Home() {
  return (
    <div className="home" style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Real Estate Analytics Dashboard</h1>
      <p>Please sign in to access the dashboard.</p>
      <SignedOut>
        <SignInButton mode="modal">
          <button className="base-btn">Sign In</button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <Link to="/dashboard">
          <button className="base-btn">Go to Dashboard</button>
        </Link>
      </SignedIn>
    </div>
  );
}

function PropertiesList() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useSuspenseProperties();

  return (
    <div>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {data.pages.map((page, i) => (
          <React.Fragment key={i}>
            {page.data.map((property) => (
              <li key={property.id} style={{ border: '1px solid #eee', padding: '1rem', marginBottom: '1rem', borderRadius: '4px' }}>
                <h3 style={{ margin: '0 0 0.5rem 0' }}>{property.address}</h3>
                <p style={{ margin: 0, fontWeight: 'bold' }}>
                  ${property.price.toLocaleString()}
                </p>
              </li>
            ))}
          </React.Fragment>
        ))}
      </ul>
      
      {hasNextPage && (
        <button 
          onClick={() => fetchNextPage()} 
          disabled={isFetchingNextPage}
          style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}
        >
          {isFetchingNextPage ? 'Loading more...' : 'Load More'}
        </button>
      )}
    </div>
  );
}

function Dashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);

  return (
    <div className="dashboard">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid #ccc' }}>
        <h2>Dashboard</h2>
        <UserButton />
      </header>
      <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <p>Welcome to your secure real estate dashboard!</p>
        
        <div style={{ marginBottom: '2rem' }}>
          <label>
            <strong>Search Properties: </strong>
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Start typing..."
              style={{ padding: '0.5rem', width: '300px' }}
            />
          </label>
          {debouncedSearch && <p style={{ color: 'gray', fontSize: '0.9rem' }}>Searching for: "{debouncedSearch}"</p>}
        </div>

        <DataErrorBoundary>
          <Suspense fallback={<PropertiesSkeleton />}>
            <PropertiesList />
          </Suspense>
        </DataErrorBoundary>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
