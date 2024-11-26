const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

//MongoDB connection
mongoose.connect('mongodb://localhost:27017/aggregatedb', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => console.log('Connected to MongoDB'));

// Define schema and model
const DataSchema = new mongoose.Schema({
    name: String,
    category: String,
    value: Number,
})

const DataModel = mongoose.model('Data', DataSchema);

app.post('/data', async (req, res) => {
    try {
        const newData = new DataModel(req.body);
        await newData.save();
        res.status(201).send('Data saved successfully');

    } catch (err) {
        res.status(500).send(err.message);
    }
})

app.get('/aggregate', async (req, res) => {
    try {

        const groupByCategory = await DataModel.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 }, avgValue: { $avg: '$value' } } },
            { $sort: { _id: 1 } },
        ]);
        res.status(200).json(groupByCategory);

    } catch (err) {
        res.status(500).send(err.message);
    }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
