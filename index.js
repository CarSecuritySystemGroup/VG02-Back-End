const express = require('express');
const cors = require('cors')
const { connectToDb, getDb } = require('./db');
const { ObjectId } = require('mongodb');

// init app and middleware
const app = express();
app.use(express.json());
app.use(express.raw({ type: 'image/jpeg', limit: '10mb' }));
app.use(cors({ origin: "*" }));

// routes
app.post('/images', (req, res) => {
    const image = req.body; // Access the image data
    const timestamp = new Date(); // Timestamp for when image is entered in database
    const timestampEST = new Date(timestamp.toLocaleString('en-US', { timeZone: 'America/New_York' })); // Adjust timestamp to EST
    const db = getDb();
    db.collection('Images')
        .insertOne({ 
            data: image,
            time: timestampEST 
        })
        .then((result) => {
            res.status(201).json({ message: 'Image uploaded successfully' });
        })
        .catch((err) => {
            res.status(500).json({ error: 'Could not upload image' });
        });
});

app.get('/images/latest', (req, res) => {
    const db = getDb();
    db.collection('Images')
        .find()
        .sort({ time: -1 }) // Sort by timestamp in descending order to get the latest image
        .limit(1) // Limit to 1 document, which will be the latest image
        .toArray()
        .then((docs) => {
            if (docs.length > 0) {
                const latestImage = docs[0];
                const binaryData = Buffer.from(latestImage.data.buffer, 'base64');
                res.set('Content-Type', 'image/jpeg');
                res.status(200).send(binaryData);
            } else {
                res.status(404).json({ error: 'No images found' });
            }
        })
        .catch((err) => {
            res.status(500).json({ error: 'Could not fetch the latest image' });
        });
});

app.get('/images/latest/timestamp', (req, res) => {
    const db = getDb();
    db.collection('Images')
        .find({}, { projection: { time: 1 } }) // Project only the time field
        .sort({ time: -1 }) // Sort by timestamp in descending order to get the latest image
        .limit(1) // Limit to 1 document, which will be the latest image
        .toArray()
        .then((docs) => {
            if (docs.length > 0) {
                const latestImageTimestamp = docs[0].time;
                res.status(200).json({ timestamp: latestImageTimestamp });
            } else {
                res.status(404).json({ error: 'No images found' });
            }
        })
        .catch((err) => {
            res.status(500).json({ error: 'Could not fetch the latest image timestamp' });
        });
});

app.get('/images/latest-three', (req, res) => {
    const db = getDb();
    db.collection('Images')
        .find({}, { projection: { _id: 1, time: 1 } }) // Project only the _id and time fields
        .sort({ time: -1 }) // Sort by timestamp in descending order to get the latest images
        .limit(3) // Limit to 3 documents to get the 3 latest images
        .toArray()
        .then((docs) => {
            if (docs.length > 0) {
                const latestImagesInfo = docs.map(doc => ({
                    id: doc._id,
                    timestamp: doc.time
                }));
                res.status(200).json(latestImagesInfo);
            } else {
                res.status(404).json({ error: 'No images found' });
            }
        })
        .catch((err) => {
            res.status(500).json({ error: 'Could not fetch the latest images info' });
        });
});



app.get('/images/:id', (req, res) => {
    const db = getDb();
    if (ObjectId.isValid(req.params.id)) {
        db.collection('Images')
            .findOne({ _id: new ObjectId(req.params.id) })
            .then((doc) => {
                if (doc) {
                    const binaryData = Buffer.from(doc.data.buffer, 'base64');
                    res.set('Content-Type', 'image/jpeg'); // Set the content type for response
                    res.status(200).send(binaryData); // Send the image data
                } else {
                    res.status(404).json({ error: 'Image not found' });
                }
            })
            .catch((err) => {
                res.status(500).json({ error: 'Could not fetch image' });
            });
    } else {
        res.status(400).json({ error: 'Invalid image ID' });
    }
});

app.get('/Vehicles', (req, res) => {
    let vehicles = [];
    const db = getDb();
    db.collection('Vehicles')
        .find()
        .sort({ vehicleId: 1 })
        .toArray()
        .then((result) => {
            res.status(200).json(result);
        })
        .catch(() => {
            res.status(500).json({ error: 'Could not fetch the documents' });
        });
});

app.get('/Vehicles/:id', (req, res) => {
    const db = getDb();
    if (ObjectId.isValid(req.params.id)) {
        db.collection('Vehicles')
            .findOne({ _id: new ObjectId(req.params.id) })
            .then((doc) => {
                res.status(200).json(doc);
            })
            .catch((err) => {
                res.status(500).json({ error: 'Could not fetch document' });
            });
    } else {
        res.status(500).json({ error: 'Not a valid document ID' });
    }
});

app.post('/Vehicles', (req, res) => {
    const vehicle = req.body;
    const db = getDb();
    db.collection('Vehicles')
        .insertOne(vehicle)
        .then((result) => {
            res.status(201).json(result);
        })
        .catch((err) => {
            res.status(500).json({ err: 'Could not create new document' });
        });
});

// GET request to retrieve GPS data
app.get('/gps', (req, res) => {
    const db = getDb();
    db.collection('GPS')
        .find()
        .toArray()
        .then((data) => {
            res.status(200).json(data);
        })
        .catch((err) => {
            res.status(500).json({ error: 'Could not fetch GPS data' });
        });
});

// POST request to add new GPS data
app.post('/gps', (req, res) => {
    const gpsData = req.body;
    const db = getDb();
    db.collection('GPS')
        .insertOne(gpsData)
        .then((result) => {
            res.status(201).json({ message: 'GPS data added successfully' });
        })
        .catch((err) => {
            res.status(500).json({ error: 'Could not add GPS data' });
        });
});

// PATCH request to update the security flag
app.patch('/updateSecurityFlag', (req, res) => {
    const db = getDb();
    const { flag } = req.body;
    const timestamp = new Date();
    const timestampEST = new Date(timestamp.toLocaleString('en-US', { timeZone: 'America/New_York' }));
    db.collection('Flags')
        .updateOne(
            { flagName: "security_Status" },
            {
                $set: {
                    status: flag,
                    lastUpdated: timestampEST
                }
            }
        )
        .then(result => {
            if (result.modifiedCount === 1) {
                res.status(200).json({ message: "Flag updated successfully" });
            } else {
                res.status(404).json({ message: "Flag not found or no changes made" });
            }
        })
        .catch(err => {
            res.status(500).json({ error: 'Could not update flag' });
        });
});

// db connection and server start
connectToDb((err) => {
    if (err) {
        console.error('Error connecting to MongoDB:', err);
    } else {
        app.listen(process.env.PORT || 3000, () => {
            console.log('App listening on port 3000');
        });
    }
});
