import fs from 'fs';

const PROJECT_ID = 'dmr6zdyg';
const TOKEN = 'skq5wcx8YhH972haVQIlk10HYA3KClYYu29FUOfhzXhVte4nkg4osS6eeSuRvQmfNURNASrcZ2qpjFRo3UdoOsrHwytkSQftHYk68e5ZU7TyCnKbUSLUSQAbaeXANMvVlxzTeq8xN6Lx4PwwA0tBof00EW4XrG5dzjFpQHeRIpAwUFa3ykOw';

console.log('Reading local properties.json...');
const properties = JSON.parse(fs.readFileSync('./src/data/properties.json', 'utf8'));

const mutations = properties.map(prop => {
  return {
    createOrReplace: {
      _type: 'property',
      _id: `prop-${prop.id}`,
      propId: prop.id,
      address: prop.address,
      zipCode: prop.zipCode,
      city: prop.city,
      price: prop.price,
      squareMeters: prop.squareMeters,
      bedrooms: prop.bedrooms,
      bathrooms: prop.bathrooms,
      energyGrade: prop.energyGrade,
      imageUrl: prop.imageUrl,
      lat: prop.lat,
      lng: prop.lng
    }
  };
});

async function run() {
  console.log(`Prepared ${mutations.length} mutations. Connecting to Sanity.io Data Lake...`);
  try {
    const res = await fetch(`https://${PROJECT_ID}.api.sanity.io/v2023-01-01/data/mutate/production`, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        Authorization: `Bearer ${TOKEN}`
      },
      body: JSON.stringify({ mutations })
    });

    const data = await res.json();
    if (res.ok) {
      console.log('SUCCESS! Sanity Cloud populated:', data.results.length, 'documents created.');
    } else {
      console.error('ERROR from Sanity:', data);
    }
  } catch (err) {
    console.error('Network Error:', err);
  }
}

run();
