import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

// Import models
import User from '../users/users.model.js';
import Farm from '../farm/farm.model.js';
import { Batch, BatchAllocation } from '../batch/batch.model.js';
import House from '../house/house.model.js';
import Stock from '../stock/stock.model.js';
import Production from '../production/production.model.js';
import SensorData from '../monitoring/monitoring.model.js';
import Immunization from '../immunization/immunization.model.js';
import Diagnosis from '../diagnosis/diagnosis.model.js';
import FeedFormula from '../feed-formula/feed-formula.model.js';

// Database connection
import connectDB from '../../config/db.js';

// Helper function to hash passwords
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Helper function to get random element from array
const getRandomElement = (array) => array[Math.floor(Math.random() * array.length)];

// Helper function to get random number between min and max
const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Helper function to get random date within last N days
const getRandomDate = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  return date;
};

// Helper function to get future date
const getFutureDate = (daysAhead) => {
  const date = new Date();
  date.setDate(date.getDate() + Math.floor(Math.random() * daysAhead));
  return date;
};

const seedData = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log('Connected to MongoDB...');

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Farm.deleteMany({});
    await Batch.deleteMany({});
    await BatchAllocation.deleteMany({});
    await House.deleteMany({});
    await Stock.deleteMany({});
    await Production.deleteMany({});
    await SensorData.deleteMany({});
    await Immunization.deleteMany({});
    await Diagnosis.deleteMany({});
    await FeedFormula.deleteMany({});
    console.log('Existing data cleared.');

    // ========================================
    // 1. CREATE FARMS
    // ========================================
    console.log('\nCreating farms...');
    const farms = [
      {
        id: uuidv4(),
        name: 'Green Valley Poultry Farm',
        location: 'Kampala, Uganda'
      },
      {
        id: uuidv4(),
        name: 'Sunrise Farms Ltd',
        location: 'Entebbe, Uganda'
      }
    ];

    const createdFarms = await Farm.insertMany(farms);
    console.log(`Created ${createdFarms.length} farms`);

    // ========================================
    // 2. CREATE USERS
    // ========================================
    console.log('\nCreating users...');
    const users = [];
    const hashedPassword = await hashPassword('Password123!'); // Default password for all users

    for (const farm of createdFarms) {
      // Manager
      users.push({
        id: uuidv4(),
        farmId: farm.id,
        firstName: farm.name.includes('Green Valley') ? 'John' : 'Sarah',
        lastName: farm.name.includes('Green Valley') ? 'Mugisha' : 'Namukasa',
        role: 'Manager',
        email: farm.name.includes('Green Valley') ? 'john.mugisha@greenvalley.com' : 'sarah.namukasa@sunrisefarms.com',
        contact: farm.name.includes('Green Valley') ? '+256700123456' : '+256700654321',
        password: hashedPassword
      });

      // Workers
      const workerNames = farm.name.includes('Green Valley')
        ? [
            { firstName: 'Peter', lastName: 'Okello', email: 'peter.okello@greenvalley.com', contact: '+256701234567' },
            { firstName: 'Grace', lastName: 'Namutebi', email: 'grace.namutebi@greenvalley.com', contact: '+256702345678' },
            { firstName: 'David', lastName: 'Ssemakula', email: 'david.ssemakula@greenvalley.com', contact: '+256703456789' }
          ]
        : [
            { firstName: 'Mary', lastName: 'Achieng', email: 'mary.achieng@sunrisefarms.com', contact: '+256704567890' },
            { firstName: 'James', lastName: 'Ouma', email: 'james.ouma@sunrisefarms.com', contact: '+256705678901' },
            { firstName: 'Betty', lastName: 'Nakato', email: 'betty.nakato@sunrisefarms.com', contact: '+256706789012' }
          ];

      for (const worker of workerNames) {
        users.push({
          id: uuidv4(),
          farmId: farm.id,
          firstName: worker.firstName,
          lastName: worker.lastName,
          role: 'Worker',
          email: worker.email,
          contact: worker.contact,
          password: hashedPassword
        });
      }
    }

    const createdUsers = await User.insertMany(users);
    console.log(`Created ${createdUsers.length} users`);

    // ========================================
    // 3. CREATE HOUSES
    // ========================================
    console.log('\nCreating houses...');
    const houses = [];

    for (const farm of createdFarms) {
      const houseCount = 3;
      for (let i = 1; i <= houseCount; i++) {
        houses.push({
          id: uuidv4(),
          farmId: farm.id,
          name: `House ${String.fromCharCode(64 + i)}`, // House A, House B, House C
          capacity: getRandomNumber(1000, 5000),
          houseType: getRandomElement(['Caged', 'Deep Litter']),
          isMonitored: i === 1 // Only first house is monitored
        });
      }
    }

    const createdHouses = await House.insertMany(houses);
    console.log(`Created ${createdHouses.length} houses`);

    // ========================================
    // 4. CREATE BATCHES
    // ========================================
    console.log('\nCreating batches...');
    const batches = [];

    for (const farm of createdFarms) {
      const batchCount = 5;
      for (let i = 1; i <= batchCount; i++) {
        const arrivalDate = getRandomDate(180); // Within last 6 months
        const originalCount = getRandomNumber(500, 3000);
        const dead = getRandomNumber(0, Math.floor(originalCount * 0.05)); // Max 5% mortality
        const culled = getRandomNumber(0, Math.floor(originalCount * 0.02)); // Max 2% culled
        const offlaid = getRandomNumber(0, Math.floor(originalCount * 0.03)); // Max 3% offlaid

        batches.push({
          id: uuidv4(),
          farmId: farm.id,
          name: `Batch-${new Date().getFullYear()}-${String(i).padStart(3, '0')}`,
          arrivalDate: arrivalDate,
          ageAtArrival: getRandomNumber(1, 21), // Usually arrive as chicks (1-21 days)
          chickenType: getRandomElement(['Broiler', 'Layer', 'Dual-Purpose']),
          originalCount: originalCount,
          supplier: getRandomElement(['ABC Hatchery', 'Premium Chicks Ltd', 'Golden Eggs Suppliers', 'Best Breeds Inc']),
          dead: dead,
          culled: culled,
          offlaid: offlaid
        });
      }
    }

    const createdBatches = await Batch.insertMany(batches);
    console.log(`Created ${createdBatches.length} batches`);

    // ========================================
    // 5. CREATE BATCH ALLOCATIONS
    // ========================================
    console.log('\nCreating batch allocations...');
    const batchAllocations = [];

    for (const farm of createdFarms) {
      const farmBatches = createdBatches.filter(b => b.farmId === farm.id);
      const farmHouses = createdHouses.filter(h => h.farmId === farm.id);

      for (const batch of farmBatches) {
        // Allocate each batch to 1-2 houses
        const numAllocations = getRandomNumber(1, 2);
        const selectedHouses = farmHouses.sort(() => 0.5 - Math.random()).slice(0, numAllocations);

        const currentCount = batch.originalCount - (batch.dead + batch.culled + batch.offlaid);
        const quantityPerHouse = Math.floor(currentCount / numAllocations);

        for (let i = 0; i < selectedHouses.length; i++) {
          batchAllocations.push({
            id: uuidv4(),
            batchId: batch.id,
            houseId: selectedHouses[i].id,
            quantity: i === selectedHouses.length - 1 ? currentCount - (quantityPerHouse * (numAllocations - 1)) : quantityPerHouse
          });
        }
      }
    }

    const createdBatchAllocations = await BatchAllocation.insertMany(batchAllocations);
    console.log(`Created ${createdBatchAllocations.length} batch allocations`);

    // ========================================
    // 6. CREATE STOCK ITEMS
    // ========================================
    console.log('\nCreating stock items...');
    const stockItems = [];

    const stockTemplates = [
      // Feed items
      { item: 'Chick Starter Feed', category: 'Feed', quantity: 1500, threshold: 500 },
      { item: 'Grower Feed', category: 'Feed', quantity: 2000, threshold: 800 },
      { item: 'Layer Feed', category: 'Feed', quantity: 3500, threshold: 1000 },
      { item: 'Broiler Finisher Feed', category: 'Feed', quantity: 1200, threshold: 400 },
      // Medicine items
      { item: 'Newcastle Disease Vaccine', category: 'Medicine', quantity: 50, threshold: 20 },
      { item: 'Antibiotics (Ampicillin)', category: 'Medicine', quantity: 30, threshold: 10 },
      { item: 'Multivitamins', category: 'Medicine', quantity: 40, threshold: 15 },
      { item: 'Dewormer', category: 'Medicine', quantity: 25, threshold: 10 },
      // Equipment items
      { item: 'Feeders (Large)', category: 'Equipment', quantity: 15, threshold: 5 },
      { item: 'Drinkers (Automatic)', category: 'Equipment', quantity: 20, threshold: 8 },
      { item: 'Egg Trays', category: 'Equipment', quantity: 500, threshold: 100 },
      { item: 'Cleaning Supplies', category: 'Equipment', quantity: 10, threshold: 3 }
    ];

    for (const farm of createdFarms) {
      for (const template of stockTemplates) {
        stockItems.push({
          id: uuidv4(),
          farmId: farm.id,
          item: template.item,
          category: template.category,
          quantity: Math.floor(template.quantity * (0.7 + Math.random() * 0.6)), // Vary quantity by ±30%
          threshold: template.threshold
        });
      }
    }

    const createdStockItems = await Stock.insertMany(stockItems);
    console.log(`Created ${createdStockItems.length} stock items`);

    // ========================================
    // 7. CREATE PRODUCTION RECORDS
    // ========================================
    console.log('\nCreating production records...');
    const productionRecords = [];

    // Only create production records for Layer and Dual-Purpose batches
    const layerBatches = createdBatches.filter(b => b.chickenType === 'Layer' || b.chickenType === 'Dual-Purpose');

    for (const batch of layerBatches) {
      // Create 30 days of production records
      const daysOfRecords = 30;

      for (let i = 0; i < daysOfRecords; i++) {
        const recordDate = new Date();
        recordDate.setDate(recordDate.getDate() - (daysOfRecords - i));

        const currentCount = batch.originalCount - (batch.dead + batch.culled + batch.offlaid);
        const expectedProductionRate = getRandomNumber(75, 95) / 100; // 75-95% production rate
        const expectedEggs = Math.floor(currentCount * expectedProductionRate);
        const trays = Math.floor(expectedEggs / 30);
        const extraEggs = expectedEggs % 30;

        productionRecords.push({
          id: uuidv4(),
          batchId: batch.id,
          date: recordDate,
          numberOfDeadBirds: getRandomNumber(0, 3), // 0-3 deaths per day
          numberOfEggsCollected: expectedEggs,
          numberOfTrays: trays,
          extraEggs: extraEggs,
          notes: i % 7 === 0 ? 'Weekly inspection completed' : ''
        });
      }
    }

    const createdProductionRecords = await Production.insertMany(productionRecords);
    console.log(`Created ${createdProductionRecords.length} production records`);

    // ========================================
    // 8. CREATE SENSOR DATA
    // ========================================
    console.log('\nCreating sensor data...');
    const sensorDataRecords = [];

    // Create 3 days of hourly sensor readings
    for (let i = 0; i < 72; i++) { // 72 hours = 3 days
      const timestamp = new Date();
      timestamp.setHours(timestamp.getHours() - (72 - i));

      sensorDataRecords.push({
        id: uuidv4(),
        ammonia: parseFloat((getRandomNumber(5, 25) + Math.random()).toFixed(2)), // 5-25 ppm
        temperature: parseFloat((getRandomNumber(20, 30) + Math.random()).toFixed(1)), // 20-30°C
        humidity: parseFloat((getRandomNumber(50, 75) + Math.random()).toFixed(1)), // 50-75%
        timestamp: timestamp
      });
    }

    const createdSensorData = await SensorData.insertMany(sensorDataRecords);
    console.log(`Created ${createdSensorData.length} sensor data records`);

    // ========================================
    // 9. CREATE IMMUNIZATIONS
    // ========================================
    console.log('\nCreating immunizations...');
    const immunizations = [];

    const vaccineSchedule = [
      { vaccineName: 'Marek\'s Disease Vaccine', daysAhead: 0, status: 'completed' },
      { vaccineName: 'Newcastle Disease Vaccine (Day 7)', daysAhead: 7, status: 'completed' },
      { vaccineName: 'Infectious Bursal Disease (Gumboro)', daysAhead: 14, status: 'completed' },
      { vaccineName: 'Newcastle Disease Booster', daysAhead: 21, status: 'pending' },
      { vaccineName: 'Fowl Pox Vaccine', daysAhead: 42, status: 'pending' },
      { vaccineName: 'Infectious Coryza Vaccine', daysAhead: 56, status: 'pending' }
    ];

    for (const farm of createdFarms) {
      const farmHouses = createdHouses.filter(h => h.farmId === farm.id);

      for (const house of farmHouses) {
        for (const vaccine of vaccineSchedule) {
          const scheduledDate = getFutureDate(vaccine.daysAhead);
          const endDate = new Date(scheduledDate);
          endDate.setDate(endDate.getDate() + 1); // Vaccination takes 1 day

          immunizations.push({
            id: uuidv4(),
            house: house._id, // Use MongoDB ObjectId
            scheduledStartDate: scheduledDate,
            scheduledEndDate: endDate,
            vaccineName: vaccine.vaccineName,
            status: vaccine.status,
            reminderSent: vaccine.status === 'completed',
            notes: vaccine.status === 'completed' ? 'Vaccination completed successfully' : 'Upcoming vaccination'
          });
        }
      }
    }

    const createdImmunizations = await Immunization.insertMany(immunizations);
    console.log(`Created ${createdImmunizations.length} immunizations`);

    // ========================================
    // 10. CREATE DIAGNOSIS RECORDS
    // ========================================
    console.log('\nCreating diagnosis records...');
    const diagnosisRecords = [];

    const diseases = [
      { disease: 'Coccidiosis', confidence: '89%' },
      { disease: 'Newcastle Disease', confidence: '92%' },
      { disease: 'Fowl Pox', confidence: '85%' },
      { disease: 'Infectious Bronchitis', confidence: '78%' },
      { disease: 'Healthy', confidence: '95%' }
    ];

    for (const farm of createdFarms) {
      const numDiagnoses = 3;
      for (let i = 0; i < numDiagnoses; i++) {
        const diagnosisData = getRandomElement(diseases);
        diagnosisRecords.push({
          id: uuidv4(),
          farmId: farm.id,
          imageUrl: `https://firebasestorage.googleapis.com/v0/b/poultrypal/o/diagnosis${i + 1}.jpg`,
          disease: diagnosisData.disease,
          confidence: diagnosisData.confidence,
          notes: diagnosisData.disease === 'Healthy'
            ? 'Birds appear healthy with no visible symptoms'
            : `Treatment recommended. Isolate affected birds and consult veterinarian.`
        });
      }
    }

    const createdDiagnosisRecords = await Diagnosis.insertMany(diagnosisRecords);
    console.log(`Created ${createdDiagnosisRecords.length} diagnosis records`);

    // ========================================
    // 11. CREATE FEED FORMULAS
    // ========================================
    console.log('\nCreating feed formulas...');
    const feedFormulas = [];

    const formulaTemplates = [
      {
        name: 'Starter Formula',
        targetGroup: 'chicks',
        ingredients: [
          { name: 'Maize', quantity: 50, unit: 'kg', cost: 25000 },
          { name: 'Soybean Meal', quantity: 30, unit: 'kg', cost: 45000 },
          { name: 'Fish Meal', quantity: 10, unit: 'kg', cost: 35000 },
          { name: 'Limestone', quantity: 5, unit: 'kg', cost: 2500 },
          { name: 'Salt', quantity: 0.5, unit: 'kg', cost: 500 },
          { name: 'Premix', quantity: 0.5, unit: 'kg', cost: 5000 }
        ],
        targetNutrition: { protein: 20, energy: 2900, calcium: 1.0, phosphorus: 0.45 }
      },
      {
        name: 'Grower Formula',
        targetGroup: 'growers',
        ingredients: [
          { name: 'Maize', quantity: 55, unit: 'kg', cost: 27500 },
          { name: 'Soybean Meal', quantity: 25, unit: 'kg', cost: 37500 },
          { name: 'Wheat Bran', quantity: 10, unit: 'kg', cost: 8000 },
          { name: 'Fish Meal', quantity: 5, unit: 'kg', cost: 17500 },
          { name: 'Limestone', quantity: 4, unit: 'kg', cost: 2000 },
          { name: 'Premix', quantity: 0.5, unit: 'kg', cost: 5000 }
        ],
        targetNutrition: { protein: 18, energy: 2850, calcium: 0.9, phosphorus: 0.40 }
      },
      {
        name: 'Layer Formula',
        targetGroup: 'layers',
        ingredients: [
          { name: 'Maize', quantity: 60, unit: 'kg', cost: 30000 },
          { name: 'Soybean Meal', quantity: 20, unit: 'kg', cost: 30000 },
          { name: 'Sunflower Cake', quantity: 8, unit: 'kg', cost: 9600 },
          { name: 'Limestone', quantity: 8, unit: 'kg', cost: 4000 },
          { name: 'Bone Meal', quantity: 2, unit: 'kg', cost: 3000 },
          { name: 'Salt', quantity: 0.3, unit: 'kg', cost: 300 },
          { name: 'Premix', quantity: 0.5, unit: 'kg', cost: 5000 }
        ],
        targetNutrition: { protein: 16, energy: 2750, calcium: 3.5, phosphorus: 0.35 }
      },
      {
        name: 'Broiler Finisher Formula',
        targetGroup: 'broilers',
        ingredients: [
          { name: 'Maize', quantity: 58, unit: 'kg', cost: 29000 },
          { name: 'Soybean Meal', quantity: 28, unit: 'kg', cost: 42000 },
          { name: 'Fish Meal', quantity: 8, unit: 'kg', cost: 28000 },
          { name: 'Vegetable Oil', quantity: 3, unit: 'kg', cost: 7500 },
          { name: 'Limestone', quantity: 2, unit: 'kg', cost: 1000 },
          { name: 'Premix', quantity: 0.5, unit: 'kg', cost: 5000 }
        ],
        targetNutrition: { protein: 19, energy: 3100, calcium: 0.9, phosphorus: 0.40 }
      }
    ];

    for (const farm of createdFarms) {
      for (const template of formulaTemplates) {
        const totalCost = template.ingredients.reduce((sum, ing) => sum + ing.cost, 0);

        feedFormulas.push({
          id: uuidv4(),
          farmId: farm.id,
          name: template.name,
          ingredients: template.ingredients,
          targetNutrition: template.targetNutrition,
          targetGroup: template.targetGroup,
          totalCost: totalCost,
          notes: `Optimized formula for ${template.targetGroup}. Provides balanced nutrition for optimal growth and production.`,
          isActive: true
        });
      }
    }

    const createdFeedFormulas = await FeedFormula.insertMany(feedFormulas);
    console.log(`Created ${createdFeedFormulas.length} feed formulas`);

    // ========================================
    // SUMMARY
    // ========================================
    console.log('\n========================================');
    console.log('SEED DATA CREATION COMPLETED!');
    console.log('========================================');
    console.log(`Farms: ${createdFarms.length}`);
    console.log(`Users: ${createdUsers.length}`);
    console.log(`Houses: ${createdHouses.length}`);
    console.log(`Batches: ${createdBatches.length}`);
    console.log(`Batch Allocations: ${createdBatchAllocations.length}`);
    console.log(`Stock Items: ${createdStockItems.length}`);
    console.log(`Production Records: ${createdProductionRecords.length}`);
    console.log(`Sensor Data Records: ${createdSensorData.length}`);
    console.log(`Immunizations: ${createdImmunizations.length}`);
    console.log(`Diagnosis Records: ${createdDiagnosisRecords.length}`);
    console.log(`Feed Formulas: ${createdFeedFormulas.length}`);
    console.log('========================================');
    console.log('\nTest Credentials (all users):');
    console.log('Password: Password123!');
    console.log('\nManager Accounts:');
    console.log('- john.mugisha@greenvalley.com (Green Valley Poultry Farm)');
    console.log('- sarah.namukasa@sunrisefarms.com (Sunrise Farms Ltd)');
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedData();
