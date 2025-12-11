# PoultryPal Seed Data

This directory contains scripts to populate the PoultryPal database with realistic dummy data for testing and development purposes.

## What Gets Created

The seed script creates comprehensive dummy data for all models in the system:

### Data Summary
- **2 Farms**: Green Valley Poultry Farm (Kampala) & Sunrise Farms Ltd (Entebbe)
- **8 Users**: 2 Managers + 6 Workers (4 users per farm)
- **6 Houses**: 3 houses per farm with different configurations
- **10 Batches**: 5 batches per farm with varying chicken types
- **Batch Allocations**: Links batches to houses
- **24 Stock Items**: Feed, medicine, and equipment inventory
- **Production Records**: 30 days of daily production data for layer batches
- **72 Sensor Data Records**: 3 days of hourly environmental monitoring
- **36 Immunizations**: Vaccination schedules for all houses
- **6 Diagnosis Records**: AI-based disease diagnosis history
- **8 Feed Formulas**: Nutritionally optimized feed recipes for different groups

## Prerequisites

Before running the seed script, ensure:

1. **MongoDB is running** on your system
   - Windows: `net start MongoDB`
   - macOS/Linux: `sudo systemctl start mongod`
2. **Environment variables are configured** in `API/.env`
   - Ensure `MONGODB_URI` is set (e.g., `mongodb://localhost:27017/poultrypal`)
3. **All required npm packages are installed**
   - Run `npm install` from the API directory if needed

## Installation

From the API root directory, run:

```bash
npm install
```

## Usage

### Running the Seed Script

From the API root directory:

```bash
node src/seed/seedData.js
```

Or add this script to your `package.json`:

```json
{
  "scripts": {
    "seed": "node src/seed/seedData.js"
  }
}
```

Then run:

```bash
npm run seed
```

### Warning

**This script will delete ALL existing data in the database before creating new seed data.**

Make sure you're running this on a development database, not production!

## Test Credentials

After running the seed script, you can log in with any of these accounts:

### Manager Accounts
- **Email**: `john.mugisha@greenvalley.com`
  - **Farm**: Green Valley Poultry Farm
  - **Password**: `Password123!`

- **Email**: `sarah.namukasa@sunrisefarms.com`
  - **Farm**: Sunrise Farms Ltd
  - **Password**: `Password123!`

### Worker Accounts (Green Valley)
- `peter.okello@greenvalley.com` - Password: `Password123!`
- `grace.namutebi@greenvalley.com` - Password: `Password123!`
- `david.ssemakula@greenvalley.com` - Password: `Password123!`

### Worker Accounts (Sunrise Farms)
- `mary.achieng@sunrisefarms.com` - Password: `Password123!`
- `james.ouma@sunrisefarms.com` - Password: `Password123!`
- `betty.nakato@sunrisefarms.com` - Password: `Password123!`

## Data Details

### Farms
Two fully configured poultry farms with different locations in Uganda.

### Users
- Each farm has 1 Manager and 3 Workers
- All passwords are securely hashed using bcrypt
- Default password: `Password123!` (meets all validation requirements)

### Houses
- Each farm has 3 houses (House A, B, C)
- Mix of "Caged" and "Deep Litter" house types
- Capacities range from 1000-5000 birds
- House A is monitored with sensors

### Batches
- 5 batches per farm with realistic data
- Mix of Broiler, Layer, and Dual-Purpose chicken types
- Ages and arrival dates vary
- Includes mortality data (dead, culled, offlaid birds)

### Stock Items
- 12 items per farm covering:
  - **Feed**: Starter, Grower, Layer, Finisher feeds
  - **Medicine**: Vaccines, antibiotics, vitamins, dewormer
  - **Equipment**: Feeders, drinkers, egg trays, cleaning supplies
- Includes threshold levels for low stock alerts

### Production Records
- 30 days of historical production data for each layer batch
- Realistic egg collection numbers and production rates
- Daily mortality tracking
- Calculated trays and extra eggs

### Sensor Data
- 72 hours (3 days) of environmental monitoring
- Hourly readings of:
  - Ammonia levels (5-25 ppm)
  - Temperature (20-30°C)
  - Humidity (50-75%)

### Immunizations
- Complete vaccination schedule for each house
- Mix of completed and pending vaccinations
- Includes common vaccines:
  - Marek's Disease
  - Newcastle Disease (with booster)
  - Gumboro (IBD)
  - Fowl Pox
  - Infectious Coryza

### Diagnosis Records
- AI-based disease detection history
- Various diagnoses including:
  - Coccidiosis
  - Newcastle Disease
  - Fowl Pox
  - Healthy birds
- Includes confidence levels and treatment notes

### Feed Formulas
- 4 optimized formulas per farm:
  - **Starter Formula**: For chicks (0-8 weeks)
  - **Grower Formula**: For growing birds (8-18 weeks)
  - **Layer Formula**: For egg-laying birds (18+ weeks)
  - **Broiler Finisher Formula**: For meat birds (3-6 weeks)
- Each formula includes:
  - Detailed ingredient list with quantities and costs
  - Target nutrition values (protein, energy, calcium, phosphorus)
  - Total cost calculation

## Customization

You can modify the seed data by editing `seedData.js`:

1. **Adjust quantities**: Change the number of farms, users, batches, etc.
2. **Modify data ranges**: Update random number ranges for more/less variation
3. **Add new data types**: Extend with additional models as needed
4. **Change defaults**: Update names, locations, or other default values

## Troubleshooting

### Connection Error
If you get a MongoDB connection error:
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

Make sure MongoDB is running:
```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

### Validation Errors
If you encounter validation errors, check that:
- All required environment variables are set
- The MongoDB connection string is correct
- All model schemas are properly defined

### Permission Errors
Ensure your database user has write permissions to create and delete documents.

## Development Notes

- UUIDs are used for all document IDs to maintain consistency with the application
- Passwords are hashed using bcrypt with a salt rounds of 10
- All dates are generated relative to the current date
- Production rates and other calculations follow realistic poultry farming patterns

## Clean Up

To remove all seed data and start fresh, simply run the seed script again. It automatically clears existing data before inserting new records.

Alternatively, you can manually clear specific collections using MongoDB commands:

```javascript
// In MongoDB shell
use poultrypal
db.users.deleteMany({})
db.farms.deleteMany({})
// ... etc
```

## Support

For issues or questions about the seed data:
1. Check the console output for detailed error messages
2. Verify all models are properly imported
3. Ensure database connection is stable
4. Review validation requirements in model schemas

---

**Note**: This seed data is for development and testing purposes only. Do not use in production environments.
