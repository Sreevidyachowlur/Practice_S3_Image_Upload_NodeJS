const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const PORT = 3001;
const AWS = require('aws-sdk');
const env= require('dotenv');
env.config();

AWS.config.update({ region: 'ap-south-1' });

app.use(express.json());
app.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 }
}));

console.log(process.env.AWS_KEY);
const s3 = new AWS.S3({
    credentials: {
        accessKeyId: process.env.AWS_KEY,
        secretAccessKey: process.env.AWS_SECRET
    }
});

app.post('/', async (req, res) => {
    if (!req.files || !req.files.file) {
        return res.status(400).send('No files were uploaded.');
    }

    const file = req.files.file;

    const uploadParams = {
        Bucket: 'sreevidya',
        Key: file.name,
        Body: file.data,
        ContentType: file.mimetype,
        ACL: 'public-read'
    };

    s3.upload(uploadParams, (err, data) => {
        if (err) {
            console.error('Error', err);
            return res.status(500).send('Upload failed.');
        }
        console.log('Upload success', data.Location);
        res.send({ message: 'Stored successfully', url: data.Location });
    });
});

app.listen(PORT, () => {
    console.log('Server running at Port', PORT);
});
