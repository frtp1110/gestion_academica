const express = require('express');
const app = express();

//Captura los datos del formulario
app.use(express.urlencoded({extended:false}));
app.use(express.json());

const dotenv = require('dotenv');
dotenv.config({path:'./env/.env'});

app.use('/resources', express.static('public'));
app.use('resources', express.static(__dirname + '/public'));

//Motor de plantillas ejs
app.set('view engine', 'ejs');

const bcryptjs = require('bcryptjs');

const session = require('express-session');
 
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

const connection = require('./database/db');

app.get('/', (req, res) => {
    res.render('index');
})

app.get('/register', (req, res) => {
    res.render('register');
})

app.listen(3000, (req, res) => {
    console.log('Server running in http://localhost:3000');
})