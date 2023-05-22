const express = require('express');
const exphbs = require('express-handlebars');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require("path");

require('dotenv').config({ path: path.join(__dirname,'/app.env') })

const Util = require("./src/Util.js");
const DB = require("./src/DB.js");
require("./src/Daemons.js");

const app = express();

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json())
app.use(cookieParser());

app.use(express.static(__dirname + '/public'));
app.set('views', path.join(__dirname, '/views'));
app.set('partials', path.join(__dirname, '/partials'));
app.engine('hbs', exphbs.engine({
    extname: '.hbs',
    helpers: require('./config/handlebars-helpers')
}));

app.set('view engine', 'hbs');

app.listen(process.env.HTTP_PORT, () => 
    console.log(`Listening for HTTP on port ${process.env.HTTP_PORT}!`));

app.get('/', (req, res) => {
    (async function () {

        user_data = await Util.getUserData(
            req.cookies['email'], req.cookies['auth_key'], DB.con);

        res.render('index', {
            user_data: user_data,
            currentYear: new Date().getFullYear(),
        });
    })()
});

app.post('/add-email-domain', (req, res) => {
	
});
app.post('/add-email-user', (req, res) => {

});
app.post('/change-email-password', (req, res) => {

});
app.post('/register', (req, res) => {
	(async function () {
	console.log("Registering...");
        registration_response = await Util.registerUser(
            req.body.email, req.body.password, DB.con);
		res.send(registration_response);
    })()

});
app.post('/login', (req, res) => {
 (async function () {
	login_response = await Util.loginUser(
            req.body.email, req.body.password, DB.con);
                res.send(login_response);
	})()
});
