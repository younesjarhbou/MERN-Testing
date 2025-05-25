const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.test' }); // Load test environment variables

module.exports = {
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here

      // Database cleaning task
      on('task', {
        async cleanDb() {
          const uri = process.env.MONGO_URI ;
          const dbName = 'test'; // MongoDB Atlas default database name, change if needed
          
          const client = new MongoClient(uri);
          
          try {
            await client.connect();
            console.log('Connected to MongoDB for cleaning...');
            
            const db = client.db(dbName);
            
            // Get all collections
            const collections = await db.listCollections().toArray();
            
            // Clear each collection
            for (const collection of collections) {
              await db.collection(collection.name).deleteMany({});
              console.log(`✓ Cleared collection: ${collection.name}`);
            }
            
            console.log('✓ Database cleaned successfully');
            return null; // Cypress tasks must return something
            
          } catch (error) {
            console.error('✗ Error cleaning database:', error);
            throw error;
          } finally {
            await client.close();
            console.log('MongoDB connection closed');
          }
        }
      });
    },
  },
};