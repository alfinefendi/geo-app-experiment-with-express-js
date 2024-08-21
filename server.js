require('dotenv').config();
const express = require('express');
const Nedb = require('nedb');
const bodyParser = require('body-parser');
const path = require('path');
const { error } = require('console');
const { create } = require('domain');

const app = express();
const host = process.env.HOST || 'localhost';
const port = process.env.PORT || 3000;
const dbGeo = new Nedb({filename: 'geo.db', autoload: true});
const dbWaypoint = new Nedb({filename: 'waypoint.db', autoload: true});
app.use(express.static('public'));
app.use('/leaflet', express.static(path.join(__dirname, 'node_modules/leaflet/dist')));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());



app.get('/create-location', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'create.html'));
});

app.post('/set-location', (req, res) => {  
    const post = {
        ...req.body,
        createdAt: new Date()
    };

    dbGeo.insert(post,(err, data) => {
        if(err) {
            res.status(500).json({message: "error", error: err});
        } else {
            res.status(201).json({message: 'succesfuly inserted', data: data});
            console.log({
                post: data
            });
        }
    });
});


app.get('/show-location', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'show.html'));
});


app.get('/get-location', (req,res) => {
    dbGeo.find({}, (err, data)=> {
        if(err) {
            res.status(500).json({error: err});
        } else {
            res.status(200).json({data : data});
        }
    });
});


// V2

app.post('/set-waypoint', (req, res) => {  
    const post = {
        ...req.body,
        createdAt: new Date()
    };
    try {
        // Check if the same waypoint already exists
        dbWaypoint.findOne({
            latitude: post.latitude,
            longitude: post.longitude
        }, (err, existingWaypoint) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ message: "Error checking existing waypoint", error: err });
            }

            if (existingWaypoint) {
                return res.status(200).json({ message: 'skiping duplication waypoints' });
            }

            // Insert new waypoint if it does not exist
            dbWaypoint.insert(post, (err, data) => {
                if (err) {
                    return res.status(500).json({ message: "error", error: err });
                }

                console.log({
                    message: 'waypoint successfuly inserted',
                    post: data
                });
                return res.status(201).json({ message: 'waypoint successfuly inserted', data: data });
            });
        });
    } catch (error) {
        res.status(500).json({ message: "An unexpected error occurred", error: error });
    }
});


app.get('/show-waypoint', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'show-v2.html'));
});


// app.get('/get-waypoint', (req,res) => {
//     dbWaypoint.find({}, (err, data)=> {
//         if(err) {
//             res.status(500).json({error: err});
//         } else {
//             res.status(200).json({data : data});
//         }
//     });
// });

app.get('/get-waypoint', (req, res) => {
    dbWaypoint.find({}).sort({ createdAt: -1 }).limit(1).exec((err, data) => {
        if (err) {
            res.status(500).json({ error: err });
        } else {
            res.status(200).json({ waypoint: data });
        }
    });
});




if(host == '') {
    host = 'localhost';
}
app.listen(port,host, () => {
    console.log(`server running on http://${host}:${port}`);
})