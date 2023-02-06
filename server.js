// Import the express modules
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");

// Read the database properties from a properties file
let propertiesReader = require("properties-reader");
let propertiesPath = path.resolve(__dirname, "conf/db.properties");
let properties = propertiesReader(propertiesPath);

// Get the database connection details
let dbPprefix = properties.get("db.prefix");

// URL-Encoding of User and PWD for potential special characters
let dbUsername = encodeURIComponent(properties.get("db.user"));
let dbPwd = encodeURIComponent(properties.get("db.pwd"));
let dbName = properties.get("db.dbName");
let dbUrl = properties.get("db.dbUrl");
let dbParams = properties.get("db.params");

// Construct the URI for the database connection
const uri = dbPprefix + dbUsername + ":" + dbPwd + dbUrl + dbParams;

// Import the MongoClient module and create a client connection
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });
let db = client.db(dbName);

// Initialize the express app
const app = express();

// Set the JSON response format
app.set('json spaces', 3);

// Enable CORS for the app
app.use(cors());

// Use morgan middleware for request logging
app.use(morgan("short"));

// Use express.json() middleware for parsing JSON requests
app.use(express.json());

// Define a middleware for setting the collection for the request
app.param('collectionName', function (req, res, next, collectionName) {
    req.collection = db.collection(collectionName);
    return next();
});

// Define a root route for the app
app.get('/', function (req, res, next) {
    res.send('Select a collection, e.g., /collections/products');
});

// Define a route for retrieving all documents in a collection
app.get('/collections/:collectionName', function (req, res, next) {
    req.collection.find({}).toArray(function (err, results) {
        if (err) {
            return next(err);
        }
        res.send(results);
    });
});

// POST request handler to insert a document into the specified collection
app.post('/collections/:collectionName', function (req, res, next) {
    // TODO: Validate req.body
    // Insert a document into the specified collection
    req.collection.insertOne(req.body, function (err, results) {
        if (err) {
            // Call the next middleware with an error if there is an error
            return next(err);
        }
        // Send the results to the client
        res.send(results);
    });
});

// PUT request handler to update a document in the specified collection
app.put('/collections/:collectionName/:id', function (req, res, next) {
    // TODO: Validate req.body
    // Update a document in the specified collection by its id
    req.collection.updateOne({ _id: new ObjectId(req.params.id) },
        { $set: req.body },
        { safe: true, multi: false }, function (err, results) {
            if (err) {
                // Call the next middleware with an error if there is an error
                return next(err);
            } else {
                // Send a success message if the update was successful
                res.send((results.matchedCount === 1) ? { msg: "success" } : { msg: "error" });
            }
        });
});

// Middleware to handle 404 errors
app.use(function (req, res) {
    // Send a "Resource not found" error response
    res.status(404).send("Resource not found!");
});

// Listen on the specified port or 3000 if not specified
const port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log("App started on port: " + port);
});