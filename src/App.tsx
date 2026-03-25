import React, { Suspense, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SignedIn, SignedOut, UserButton, SignInButton, useAuth, useClerk } from '@clerk/clerk-react';
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
  ActionIcon,
  Drawer,
  Stack
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconSearch, IconHeart, IconBuildingCommunity, IconBed, IconBath, IconMaximize, IconChartBar } from '@tabler/icons-react';



import { DataErrorBoundary } from './components/ui/DataErrorBoundary';
import { useSuspenseProperties, usePropertiesByIds } from './hooks/useProperties';
import type { Property } from './hooks/useProperties';
import { useDebounce } from './hooks/useDebounce';
import { useSavedProperties, useSavePropertyMutation, useRemovePropertyMutation } from './hooks/useSavedProperties';
import './App.css';

function PortfolioAnalytics({ ids }: { ids: string[] }) {
  const { data: properties, isLoading, error } = usePropertiesByIds(ids);

  if (ids.length === 0) {
    return <Text c="dimmed" ta="center" mt="xl">No properties in your portfolio yet. Click the heart icons to build a portfolio!</Text>;
  }

  if (isLoading) return <Center mt="xl"><Loader color="indigo" /></Center>;
  if (error || !properties) return <Text c="red">Failed to load portfolio data.</Text>;

  // Aggregation Logic
  const totalValue = properties.reduce((sum, p) => sum + p.price, 0);
  const totalSqm = properties.reduce((sum, p) => sum + p.squareMeters, 0);
  const avgSqmPrice = totalSqm > 0 ? totalValue / totalSqm : 0;
  
  const energyGrades = properties.reduce((acc, p) => {
    acc[p.energyGrade] = (acc[p.energyGrade] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Stack gap="xl" mt="md">
      <Card withBorder radius="md" p="md" shadow="sm">
        <Text size="xs" tt="uppercase" fw={700} c="dimmed">Estimated Portfolio Sum</Text>
        <Text fz="h2" fw={800} c="indigo">kr {totalValue.toLocaleString('no-NO')}</Text>
        <Text size="sm" c="dimmed" mt={4}>Across {properties.length} saved properties</Text>
      </Card>

      <Card withBorder radius="md" p="md" shadow="sm">
        <Text size="xs" tt="uppercase" fw={700} c="dimmed">Average Market Rate</Text>
        <Text fz="h2" fw={800} c="teal">kr {Math.round(avgSqmPrice).toLocaleString('no-NO')} / m²</Text>
      </Card>

      <div>
        <Text size="sm" fw={700} mb="xs">Enova Efficiency Spread</Text>
        <Stack gap="xs">
          {Object.entries(energyGrades).sort().map(([grade, count]) => (
            <Group justify="space-between" key={grade}>
              <Badge color={grade <= 'C' ? 'teal' : 'orange'} variant="dot" size="lg">Grade {grade}</Badge>
              <Text size="sm" fw={500}>{count} {(count === 1) ? 'property' : 'properties'}</Text>
            </Group>
          ))}
        </Stack>
      </div>
    </Stack>
  );
}

function PropertiesList({ searchTerm }: { searchTerm: string }) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useSuspenseProperties(searchTerm);
  const { data: savedProperties = [] } = useSavedProperties();
  const { mutate: saveProperty } = useSavePropertyMutation();
  const { mutate: removeProperty } = useRemovePropertyMutation();
  const [pendingId, setPendingId] = useState<string | null>(null);
  
  const { isSignedIn } = useAuth();
  const { openSignIn } = useClerk();

  // Market calculation
  const allLoadedProperties = data.pages.flatMap(page => page.data);
  const marketTotalVal = allLoadedProperties.reduce((sum, p) => sum + p.price, 0);
  const marketTotalSqm = allLoadedProperties.reduce((sum, p) => sum + p.squareMeters, 0);
  const marketAvgSqm = marketTotalSqm > 0 ? marketTotalVal / marketTotalSqm : 0;

  const handleToggleSave = (property: Property) => {
    if (!isSignedIn) {
      openSignIn();
      return;
    }
    setPendingId(property.id);
    if (isSaved(property.id)) {
      removeProperty(property.id, { onSettled: () => setPendingId(null) });
    } else {
      saveProperty(property, { onSettled: () => setPendingId(null) });
    }
  };

  const isSaved = (propertyId: string) => {
    return savedProperties.some((p) => p.id === propertyId);
  };

  return (
    <>
      <Grid gutter="xl">
        {data.pages.map((page, i) => (
          <React.Fragment key={i}>
            {page.data.map((property) => {
              const propSqmPrice = property.squareMeters > 0 ? property.price / property.squareMeters : 0;
              const diffPct = marketAvgSqm > 0 ? ((propSqmPrice - marketAvgSqm) / marketAvgSqm) * 100 : 0;
              const isGoodDeal = diffPct < -5;

              return (
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

                  <Group justify="space-between" align="flex-end" mt="auto">
                    <div>
                      <Text fw={800} size="xl" c="indigo">
                        kr {property.price.toLocaleString('no-NO')}
                      </Text>
                      {isGoodDeal && (
                        <Badge color="green" variant="light" size="xs" mt={4}>
                          {Math.abs(diffPct).toFixed(0)}% Below Market Avg
                        </Badge>
                      )}
                    </div>
                    
                    <ActionIcon 
                      variant={isSaved(property.id) ? "filled" : "light"} 
                      color={isSaved(property.id) ? "gray" : "indigo"}
                      size="lg"
                      radius="md"
                      onClick={() => handleToggleSave(property)}
                      disabled={pendingId === property.id}
                    >
                      <IconHeart size={20} stroke={isSaved(property.id) ? 3 : 1.5} />
                    </ActionIcon>
                  </Group>
                </Card>
              </Grid.Col>
            );
            })}
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
  const [analyticsOpened, { open: openAnalytics, close: closeAnalytics }] = useDisclosure(false);

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
              <SignedIn>
                <Button 
                  variant="light" 
                  color="indigo" 
                  leftSection={<IconChartBar size={18} />}
                  onClick={openAnalytics}
                  radius="xl"
                >
                  {savedProps.length} Saved Properties
                </Button>
                <UserButton />
              </SignedIn>
              
              <SignedOut>
                <SignInButton mode="modal">
                  <Button variant="outline" color="indigo" radius="xl">Sign In to Save Properties</Button>
                </SignInButton>
              </SignedOut>
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
              <PropertiesList searchTerm={debouncedSearch} />
            </Suspense>
          </DataErrorBoundary>
        </Container>
      </AppShell.Main>

      <Drawer
        opened={analyticsOpened}
        onClose={closeAnalytics}
        title={<Title order={3} fw={800}>Portfolio Analytics</Title>}
        position="right"
        size="md"
      >
        <PortfolioAnalytics ids={savedProps.map(p => p.id)} />
      </Drawer>
    </AppShell>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
