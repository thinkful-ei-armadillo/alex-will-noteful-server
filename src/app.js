require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const notesRouter = require('./notes/notesRouter');
const foldersRouter = require('./folders/foldersRouter');
const validateBearerToken = require('./validateBearerToken');
const { NODE_ENV } = require('./config');

const app = express();

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'dev';

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());
app.use(validateBearerToken);

app.use(notesRouter);
app.use(foldersRouter);

app.get('/', (req, res) => {
  res.send('Hello, boilerplate!');
});

app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === 'production') {
    response = {error: {message: 'server error' }};
  } else {
    console.log(error);
    response = {message: error.message, error};
  }
  res.status(500).json(response);
}); 

module.exports = app;