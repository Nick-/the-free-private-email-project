const express = require('express');
const exphbs = require('express-handlebars');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require("path");

require('dotenv').config({ path: './app.env' })

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

        user_data = await User.getUserData(
            req.cookies['email'], req.cookies['auth_key']);

        res.render('index', {
            user_data: user_data,
            currentYear: new Date().getFullYear(),
        });
    })()
});
