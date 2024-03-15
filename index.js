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
    const timestamp = new Date();
    const db = getDb();
    db.collection('Images')
        .insertOne({ 
            data: image,
            time: timestamp 
        })
        .then((result) => {
            res.status(201).json({ message: 'Image uploaded successfully' });
        })
        .catch((err) => {
            res.status(500).json({ error: 'Could not upload image' });
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

// db connection and server start
connectToDb((err) => {
    if (err) {
        console.error('Error connecting to MongoDB:', err);
    } else {
        app.listen(3000, () => {
            console.log('App listening on port 3000');
        });
    }
});
//work