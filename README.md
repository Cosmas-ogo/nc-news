# Northcoders News API

To use this repo run npm install to add all the required packages

Create .env.test file and .env.development file to grogramatically connect to test and development data base from the connection.js

In order to use node-postgres to connect to different databases, the db/connection.js file needs to be configured to programmatically change which database we are connecting to based on the process.env.NODE_ENV.

Create a database by running npm run setup-dbs

Running npm test will set ENV to 'test'

To run the repo as a development server seed the dev databas with 'npm run seed'
