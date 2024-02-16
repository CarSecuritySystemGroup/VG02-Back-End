const express = require('express');
const { connectToDb, getDb } = require('./db');
const { ObjectId } = require('mongodb');

// init app and middleware
const app = express();
app.use(express.json());

// routes
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
