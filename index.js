const express = require('express');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const { spawnSync } = require('child_process');

const app = express();

const port = process.env.PORT || 3000;

// TODO: Save and load this variables from a file
const city = 'La Plata';
const school = 'Bachillerato de Bellas Artes';
const age = 17;

app.use(fileUpload({
  createParentPath: true,
}));

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));


app.post('/upload-photo', async (req, res) => {
  try {
    if (!req.files && !req.files.photo) {
      res.send({
        status: false,
        message: 'No file uploaded',
      });
    } else {
      const { photo } = req.files;

      const data = {
        name: photo.name,
        mimetype: photo.mimetype,
        size: photo.size,
      };

      // move photo to uploads directory
      const filepath = `./uploads/${photo.name}`;
      photo.mv(filepath);

      const python = spawnSync('python3',
        ['./main.py', `${filepath}`, `${city}`, `${school}`, `${age}`]);

      if (python.status === 0) {
        res.send({
          status: true,
          message: 'Photo uploaded and processed succesfully',
          data,
        });
      } else {
        res.status(500).send();
      }
    }
  } catch (err) {
    res.status(500).send(err);
    throw err;
  }
});

// TODO: Remove this line. Only use for testing purposes
app.use(express.static('uploads'));

app.listen(port, () => {
  console.log(`App is listening on port ${port}.`);
});
