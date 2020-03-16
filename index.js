const express = require('express');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const { spawnSync } = require('child_process');
const path = require('path');
const { sample, remove } = require('lodash');
const fs = require('fs');
const moment = require('moment-timezone');

const app = express();

app.use(fileUpload({
	createParentPath: true,
}));

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));

const port = process.env.PORT || 3000;

// TODO: Save and load this variables from a file
const city = 'La Plata';
const school = 'Bachillerato de Bellas Artes';
const age = 17;

const day = moment.tz("America/Argentina/Buenos_Aires").format("YYYY-MM-DD");

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
			const filepath = path.join(__dirname + `/uploads/${photo.name}`);
			await photo.mv(filepath);

			const python = spawnSync(
				'bash',
				['-e', path.join(__dirname + '/runProcess.sh'), filepath, `${city}`, `${school}`, `${age}`]);
			console.log("stdout: ",python.stdout.toString('utf8'));
			console.log("stderr: ",python.stderr.toString('utf8'));

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

let lastFile = undefined;

app.get('/random', function(req, res) {
	const files = fs.readdirSync(path.join(__dirname + `/process/processed/${day}`));
	
	if (lastFile) {
		remove(files, f => ( f === lastFile ));
		console.log(`removing ${lastFile}`);
	}

	const file = sample(files);
	lastFile = file;

	res.json({ url: `/processed/${file}` });

});

app.use('/processed', express.static(path.join(__dirname + `/process/processed/${day}`)));

app.use(express.static(path.join(__dirname) + '/website/build'));
app.get('/', function(req, res) {
	res.sendFile(path.join(__dirname + '/website/build'));
});


app.listen(port, () => {
	console.log(`App is listening on port ${port}.`);
});
