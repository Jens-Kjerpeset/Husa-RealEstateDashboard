import React, { Suspense, useState } from 'react';
import { BrowserRouter, Routes, Route, Link as RouterLink } from 'react-router-dom';
import { SignedIn, SignedOut, UserButton, SignInButton } from '@clerk/clerk-react';
import { 
  AppShell, 
  Container, 
  Title, 
  Text, 
  Button, 
  Group, 
  Card, 
  Image, 
  Badge, 
  Grid, 
  Center,
  Loader,
  TextInput,
  ActionIcon
} from '@mantine/core';
import { IconSearch, IconHeart, IconBuildingCommunity, IconBed, IconBath, IconMaximize } from '@tabler/icons-react';

import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { DataErrorBoundary } from './components/ui/DataErrorBoundary';
import { useSuspenseProperties } from './hooks/useProperties';
import type { Property } from './hooks/useProperties';
import { useDebounce } from './hooks/useDebounce';
import { useSavedProperties, useSavePropertyMutation } from './hooks/useSavedProperties';
import './App.css';

function Home() {
  return (
    <Center style={{ height: '100vh', backgroundColor: '#f8fafc' }}>
      <Card shadow="md" p="xl" radius="md" withBorder style={{ textAlign: 'center', maxWidth: 500 }}>
        <IconBuildingCommunity size={64} color="#4f46e5" stroke={1.5} style={{ margin: '0 auto' }} />
        <Title order={1} mt="md" mb="xs" fw={800}>Real Estate Analytics Dashboard</Title>
        <Text c="dimmed" mb="xl">
          Secure, resilient, and blazing fast property insights. Please sign in to access your dashboard.
        </Text>
        
        <SignedOut>
          <SignInButton mode="modal">
            <Button size="lg" fullWidth color="indigo">
              Sign In
            </Button>
          </SignInButton>
        </SignedOut>
        
        <SignedIn>
          <Button component={RouterLink} to="/dashboard" size="lg" fullWidth color="indigo">
            Go to Dashboard
          </Button>
        </SignedIn>
      </Card>
    </Center>
  );
}

function PropertiesList() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useSuspenseProperties();
  const { data: savedProperties = [] } = useSavedProperties();
  const { mutate, isPending } = useSavePropertyMutation();

  const handleSave = (property: Property) => {
    mutate(property);
  };

  const isSaved = (propertyId: string) => {
    return savedProperties.some((p) => p.id === propertyId);
  };

  return (
    <>
      <Grid gutter="xl">
        {data.pages.map((page, i) => (
          <React.Fragment key={i}>
            {page.data.map((property) => (
              <Grid.Col key={property.id} span={{ base: 12, sm: 6, lg: 4 }}>
                <Card shadow="sm" padding="lg" radius="md" withBorder h="100%" style={{ display: 'flex', flexDirection: 'column' }}>
                  <Card.Section>
                    <Image
                      src={property.imageUrl}
                      height={200}
                      alt={property.address}
                    />
                  </Card.Section>

                  <Group justify="space-between" mt="md" mb="xs">
                    <Text fw={600} size="lg" lineClamp={1} style={{ flex: 1 }}>{property.address}</Text>
                    <Badge color={property.energyGrade <= 'C' ? 'teal' : 'orange'} variant="light">
                      Enova {property.energyGrade}
                    </Badge>
                  </Group>

                  <Text c="dimmed" size="sm" mb="md">
                    {property.zipCode} {property.city}
                  </Text>

                  <Group gap={15} mt="auto" mb="xl" style={{ borderTop: '1px solid #f1f5f9', paddingTop: '15px' }}>
                    <Group gap={5}>
                      <IconBed size={16} color="gray" />
                      <Text size="sm" fw={500}>{property.bedrooms}</Text>
                    </Group>
                    <Group gap={5}>
                      <IconBath size={16} color="gray" />
                      <Text size="sm" fw={500}>{property.bathrooms}</Text>
                    </Group>
                    <Group gap={5}>
                      <IconMaximize size={16} color="gray" />
                      <Text size="sm" fw={500}>{property.squareMeters} m²</Text>
                    </Group>
                  </Group>

                  <Group justify="space-between" align="center" mt="auto">
                    <Text fw={800} size="xl" c="indigo">
                      kr {property.price.toLocaleString('no-NO')}
                    </Text>
                    
                    <ActionIcon 
                      variant={isSaved(property.id) ? "filled" : "light"} 
                      color={isSaved(property.id) ? "gray" : "indigo"}
                      size="lg"
                      radius="md"
                      onClick={() => handleSave(property)}
                      disabled={isSaved(property.id) || isPending}
                    >
                      <IconHeart size={20} stroke={isSaved(property.id) ? 3 : 1.5} />
                    </ActionIcon>
                  </Group>
                </Card>
              </Grid.Col>
            ))}
          </React.Fragment>
        ))}
      </Grid>
      
      {hasNextPage && (
        <Center mt={40}>
          <Button 
            variant="outline" 
            color="indigo"
            size="md"
            onClick={() => fetchNextPage()} 
            loading={isFetchingNextPage}
          >
            Load More Properties
          </Button>
        </Center>
      )}
    </>
  );
}

function Dashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  const { data: savedProps = [] } = useSavedProperties();

  return (
    <AppShell
      header={{ height: 70 }}
      padding="md"
      style={{ backgroundColor: '#f8fafc' }}
    >
      <AppShell.Header>
        <Container size="xl" h="100%">
          <Group justify="space-between" h="100%">
            <Group>
              <IconBuildingCommunity size={28} color="#4f46e5" />
              <Title order={3} fw={700}>Husa Analytics</Title>
            </Group>
            
            <Group gap="xl">
              <Badge size="lg" variant="dot" color="indigo">
                {savedProps.length} Saved Properties
              </Badge>
              <UserButton />
            </Group>
          </Group>
        </Container>
      </AppShell.Header>

      <AppShell.Main>
        <Container size="xl" py="xl">
          <Group justify="space-between" align="flex-end" mb={40}>
            <div>
              <Title order={2} fw={800} mb="xs">Active Market Output</Title>
              <Text c="dimmed">Analyzing properties across Norwegian databases.</Text>
            </div>
            
            <TextInput
              leftSection={<IconSearch size={16} />}
              placeholder="Search by city or zip..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.currentTarget.value)}
              size="md"
              w={{ base: '100%', sm: 300 }}
              radius="md"
            />
          </Group>

          {debouncedSearch && (
            <Text size="sm" c="dimmed" mb="lg">
              Filtering properties matching: <strong>{debouncedSearch}</strong>
            </Text>
          )}

          <DataErrorBoundary>
            <Suspense fallback={<Center h={300}><Loader color="indigo" size="xl" type="bars" /></Center>}>
              <PropertiesList />
            </Suspense>
          </DataErrorBoundary>
        </Container>
      </AppShell.Main>
    </AppShell>
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
