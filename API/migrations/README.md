# Database Migrations

This directory contains database migrations for the PoultryPal API.

## What are Migrations?

Database migrations are version-controlled scripts that modify the database schema. They allow:
- Tracking schema changes over time
- Reverting changes if needed
- Ensuring consistent schema across environments
- Safe deployment of database changes

## Commands

### Check Migration Status
```bash
npm run migrate:status
```

### Apply Pending Migrations
```bash
npm run migrate:up
```

### Rollback Last Migration
```bash
npm run migrate:down
```

### Create New Migration
```bash
npm run migrate:create <migration-name>
```

## Migration Checklist

Before running migrations in production:

- [ ] Test migration on local database
- [ ] Test rollback (down) works correctly
- [ ] Document any breaking changes
- [ ] Update API version if schema changes affect API contracts
- [ ] Backup production database
- [ ] Run during maintenance window if downtime expected
- [ ] Monitor application logs after migration

## Migration Naming Convention

Migrations should be named with the pattern:
```
YYYYMMDDHHMMSS-descriptive-name.js
```

Example:
```
20251216120000-add-user-roles.js
```

## Writing Migrations

Each migration file exports two functions:

```javascript
export const up = async (db) => {
  // Apply changes
  await db.collection('users').updateMany(
    {},
    { $set: { newField: 'defaultValue' } }
  );
};

export const down = async (db) => {
  // Revert changes
  await db.collection('users').updateMany(
    {},
    { $unset: { newField: '' } }
  );
};
```

## Best Practices

1. **Idempotency**: Migrations should be safe to run multiple times
2. **Atomicity**: Keep migrations focused on a single change
3. **Testing**: Always test both `up` and `down` migrations
4. **Data Preservation**: Never delete data without backup
5. **Performance**: Consider impact on large collections
6. **Documentation**: Add comments explaining complex changes

## Existing Migrations

### 20251216000001-initial-schema.js
- **Purpose**: Documents initial database schema
- **Changes**: Creates indexes for users and farms collections
- **Impact**: Improves query performance
- **Reversible**: Yes

## Troubleshooting

### Migration Fails
1. Check database connection in `.env`
2. Verify migration syntax
3. Check for conflicting indexes
4. Review error logs

### Migration Stuck
```bash
# Check current status
npm run migrate:status

# If needed, manually update changelog collection
```

### Rollback Not Working
Ensure `down` function properly reverses `up` changes.

## Production Deployment

1. **Pre-deployment**:
   ```bash
   # Backup database
   mongodump --uri="$MONGODB_URI" --out=backup-$(date +%Y%m%d)

   # Check migration status
   npm run migrate:status
   ```

2. **Deploy**:
   ```bash
   # Run migrations
   npm run migrate:up

   # Verify application health
   curl http://localhost:3000/api/v1/health
   ```

3. **Rollback** (if needed):
   ```bash
   # Revert last migration
   npm run migrate:down

   # Restore from backup if necessary
   mongorestore --uri="$MONGODB_URI" backup-20251216/
   ```

## Configuration

Migrations are configured in `migrate-mongo-config.js`:
- MongoDB connection URL from `.env`
- Migrations directory: `./migrations`
- Changelog collection: `changelog`

## Support

For issues or questions about migrations:
1. Check migration status: `npm run migrate:status`
2. Review migration logs
3. Contact development team
