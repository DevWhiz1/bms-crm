const db = require('../config/database');

const apartments = [
  // Floor 1
  { apartment_no: '1', floor_no: 1 },
  { apartment_no: '2', floor_no: 1 },
  { apartment_no: '3', floor_no: 1 },
  { apartment_no: '4', floor_no: 1 },
  { apartment_no: '5', floor_no: 1 },
  { apartment_no: '6', floor_no: 1 },
  { apartment_no: '7', floor_no: 1 },
  // Floor 2
  { apartment_no: '1', floor_no: 2 },
  { apartment_no: '2', floor_no: 2 },
  { apartment_no: '3', floor_no: 2 },
  { apartment_no: '4', floor_no: 2 },
  { apartment_no: '5', floor_no: 2 },
  { apartment_no: '6', floor_no: 2 },
  { apartment_no: '7', floor_no: 2 },
];

async function populateApartments() {
  try {
    console.log('Starting apartment population...');
    
    // Check if apartments already exist
    const existingApartments = await db.query('SELECT COUNT(*) as count FROM apartments');
    if (existingApartments[0].count > 0) {
      console.log('Apartments already exist. Skipping population.');
      return;
    }

    // Insert apartments
    for (const apartment of apartments) {
      await db.query(
        'INSERT INTO apartments (apartment_no, floor_no) VALUES (?, ?)',
        [apartment.apartment_no, apartment.floor_no]
      );
      console.log(`Inserted apartment ${apartment.apartment_no} on floor ${apartment.floor_no}`);
    }

    console.log('Apartment population completed successfully!');
  } catch (error) {
    console.error('Error populating apartments:', error);
  } finally {
    db.end();
  }
}

populateApartments();
