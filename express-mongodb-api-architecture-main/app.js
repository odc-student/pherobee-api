/* -------------------------------------------------------------------------- */
/*                                Dependencies                                */
/* -------------------------------------------------------------------------- */

// Packages
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const bodyParser = require('body-parser');
var cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
// Firebase
require('firebase/auth');
require('firebase/firestore');

// Swagger
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./src/swagger.json');

// config
dotenv.config();

// const
const app = express();

// DATABASE CONNECTION
mongoose.connect(
  process.env.NODE_ENV === 'production'
    ? process.env.PROD_DATABASE
    : process.env.DEV_DATABASE,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log('Connected to the database');
    }
  },
);

// Middleware
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'uploads')));
app.use(cors());

// Require APIs
const userRoutes = require('./src/routes/auth');

// local APIs
app.use('/v1/api', userRoutes);

// API for uploads file (photo, galleries)
app.get('/uploads/:id', (req, res) => {
  res.sendFile(path.join(__dirname, `./uploads/${req.params.id}`));
});

// API for swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

module.exports = app;
