require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Nedb = require('nedb');
const bodyParser = require('body-parser');

const app = express();
const host = process.env.HOST || 'localhost';
const port = process.env.PORT || 3000;
const dbImage = new Nedb({filename: 'image-coord.db', autoload: true});
const dbCoord = new Nedb({filename: 'coord.db', autoload: true});
const dbWaypoint = new Nedb({filename: 'waypoint.db', autoload: true});

app.use(express.static('public'));
app.use('/leaflet', express.static(path.join(__dirname, 'node_modules/leaflet/dist')));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());


// V1

app.get('/show-location', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'show-v1.html'));
});

app.get('/get-location', (req,res) => {
    dbCoord.find({}, (err, data)=> {
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

app.get('/get-waypoint', (req, res) => {
    dbWaypoint.find({}).sort({ createdAt: -1 }).limit(1).exec((err, data) => {
        if (err) {
            res.status(500).json({ error: err });
        } else {
            res.status(200).json({ waypoint: data });
        }
    });
});

// V3


app.get('/create-location', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'create-v3.html'));
});

app.get('/show-images', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'show-v3.html'));
});

app.get('/get-images', (req, res) => {
    dbImage.find({}, (err, docs) => {
        if (err) {
            return res.status(500).json({ message: 'Error retrieving data from database.', error: err });
        }
        res.json(docs);
    });
});



// Configure multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, 'public', 'uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true }); // Ensure the directory structure is created
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const filename = Date.now() + ext;
        cb(null, filename);
    }
});

const upload = multer({ storage });

// Serve static files from the public/uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Middleware to parse JSON request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Handle image upload and store metadata
app.post('/set-location', upload.single('image'), (req, res) => {
    try {
        // Check if file is uploaded
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded.' });
        }

        // Prepare the data to store in NeDB
        const post = {
            latitude: req.body.latitude,
            longitude: req.body.longitude,
            keterangan: req.body.keterangan,
            imageUrl: `/uploads/${req.file.filename}`, // URL to access the uploaded file
            createdAt: new Date()
        };

        // Insert data into NeDB
        dbImage.insert(post, (err, data) => {
            if (err) {
                return res.status(500).json({ message: 'Error saving data to database.', error: err });
            }
            res.status(201).json({ message: 'Successfully inserted.', data });
        });

    } catch (error) {
        res.status(500).json({ message: 'An error occurred.', error });
    }
});
  



app.listen(port,host, () => {
    console.log(`server running on http://${host}:${port}`);
})