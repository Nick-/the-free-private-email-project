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
app.engine('html', exphbs.engine({
    extname: '.html',
    helpers: require('./config/handlebars-helpers')
}));
app.set('view engine', 'html');

app.listen(process.env.HTTP_PORT, () => 
    console.log(`Listening for HTTP on port ${process.env.HTTP_PORT}!`));

app.get('/', (req, res) => {
    (async function () {

        user_data = await Util.getUserData(
            req.cookies['email'], req.cookies['auth_key'], DB.con);

        my_domains = await Util.getDomainsForUID(user_data, DB.con);

        my_email_users = await Util.getEmailUsersForDomain(my_domains, DB.con)
        
        res.render('index', {
            my_email_users: JSON.stringify(my_email_users),
            my_domains: my_domains,
            user_data: user_data,
            currentYear: new Date().getFullYear(),
        });
    })()
});



app.post('/add-email-domain', (req, res) => {
    (async function () {

        user_data = await Util.getUserData(
            req.cookies['email'], req.cookies['auth_key'], DB.con);

            add_domain_response = await Util.addEmailDomain(
                user_data, req.body.domain, DB.con);
            res.send(add_domain_response);
    })()

});
app.post('/delete-email-domain', (req, res) => {
    (async function () {

        user_data = await Util.getUserData(
            req.cookies['email'], req.cookies['auth_key'
], DB.con); 
	    remove_domain_response = await Util.removeEmailDomain(user_data, req.body.domain, DB.con);
            res.send(remove_domain_response);                  })()

});

app.post('/verify-email-domain', (req, res) => {
    (async function () {

        user_data = await Util.getUserData(
            req.cookies['email'], req.cookies['auth_key'], DB.con);

            verify_domain_response = await Util.verifyEmailDomain(
                user_data, req.body.domain, DB.con);
            res.send(verify_domain_response);
    })()

});

app.post('/add-email-user', (req, res) => {
    (async function () {

        user_data = await Util.getUserData(
            req.cookies['email'], req.cookies['auth_key'], DB.con);


            aeu_response = await Util.addEmailUser(
                user_data, req.body.full_email, DB.con);
            res.send(aeu_response);
    })()

});
app.post('/change-email-user-password', (req, res) => {
    (async function () {

        user_data = await Util.getUserData(
            req.cookies['email'], req.cookies['auth_key'], DB.con);


            cpeu_response = await Util.changeEmailUserPass(
                user_data, req.body.full_email, DB.con);
            res.send(cpeu_response);
    })()
});
app.post('/delete-email-user', (req, res) => {
    (async function () {

        user_data = await Util.getUserData(
            req.cookies['email'], req.cookies['auth_key'], DB.con);


            deu_response = await Util.deleteEmailUser(
                user_data, req.body.full_email, DB.con);
            res.send(deu_response);
    })()
});

app.post('/forgot-password', (req, res) => {
	(async function () {
        fp_response = await Util.sendForgotPassword(
            req.body.email, DB.con);
		res.send(fp_response);
    })()

});

app.get('/reset-password', (req, res) => {
    (async function () {
        var email = req.query.email;
        var pk = req.query.pk;

        res.render('reset-password', {
            email: email,
            pk: pk,
            user_data: -1
        });
    })()
});

app.post('/create-new-password', (req, res) => {
    (async function () {
    const email = req.body.email;
    const fpk = req.body.pk;
    const password = req.body.password;

    rp_response = await Util.submitResetPassword(
        email, fpk, password, DB.con);
    res.send(rp_response);
    })()
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
