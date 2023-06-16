const express = require('express');
const exphbs = require('express-handlebars');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require("path");
const stripe = require('stripe')('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');

require('dotenv').config({ path: path.join(__dirname,'/app.env') })

const Util = require("./src/Util.js");
const DB = require("./src/DB.js");
require("./src/Daemons.js");

const app = express();

app.use(bodyParser.urlencoded({
    extended: true
}));
//app.use(bodyParser.json())
app.use(cookieParser());
app.use(express.json({
    limit: '5mb',
    verify: (req, res, buf) => {
      req.rawBody = buf.toString();
    }
}));
app.use(express.static(__dirname + '/public'));
app.set('views', path.join(__dirname, '/views'));
app.set('partials', path.join(__dirname, '/partials'));
app.engine('html', exphbs.engine({
    extname: '.html',
    helpers: require('./config/handlebars-helpers')
}));
app.set('view engine', 'html');

process.argv.forEach(function (val, index, array) {
    if(val == "--DEV") {
        process.env.DEV = true;
        console.log("Starting Server in Development Mode")
    }
  });

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

//invoice.payment_succeeded
app.post('/payment-succeeded', (request, response) => {

const sig = request.headers['stripe-signature'];

    let event;

    try {
        event = stripe.webhooks.constructEvent(request.rawBody, sig, "whsec_ESGEkajxEziTUVTSyKqolAaRhoxQOPNi");
    } catch (err) {
        response.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }

    // Handle the event
    switch (event.type) {
        case 'invoice.payment_succeeded':
        const invoicePaymentSucceeded = event.data.object;
        // Then define and call a function to handle the event checkout.session.completed
        console.log("Got Invoice payment.")

        var customer_id = invoicePaymentSucceeded.customer;
        var sub_exp = invoicePaymentSucceeded.lines.data[0].period.end;

        var q = "UPDATE users SET plan = 1, subscription_exp = ? WHERE stripe_customer_id = ?";
        DB.con.query(q, [sub_exp, customer_id], (error, result) => {
            if (error) {
                Util.reportError(error)
            } else {
                console.log("Invoice Paid: User membership extended successfully.")
            }
        });
        break;
        // ... handle other event types
        default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    response.send();

});

//https://stripe.com/docs/api/events/types#event_types-checkout.session.completed
//checkout.session.completed
app.post('/subscription-created', (request, response) => {
    const sig = request.headers['stripe-signature'];

    let event;

    try {
        event = stripe.webhooks.constructEvent(request.rawBody, sig, "whsec_z94mfxT6Q3azgYfFHsERXjYsMkLDDqwo");
    } catch (err) {
        response.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
        const checkoutSessionCompleted = event.data.object;
        // Then define and call a function to handle the event checkout.session.completed

        var customer_id = checkoutSessionCompleted.customer;
        var sub_exp = checkoutSessionCompleted.expires_at;
        var ref_uid = checkoutSessionCompleted.client_reference_id;

        var q = "UPDATE users SET stripe_customer_id = ?, subscription_exp = ?, plan = 1 WHERE uid = ?";

        DB.con.query(q, [customer_id, sub_exp, ref_uid], (error, result) => {
            if (error) {
                Util.reportError(error)
            } else {
                console.log("Checkout Completed: User upgraded successfully.")
            }
        });

        break;
        // ... handle other event types
        default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    response.send();

    });

app.post('/send-email-login-instructions', (req, res) => {
    (async function () {

        user_data = await Util.getUserData(
            req.cookies['email'], req.cookies['auth_key'], DB.con);

            if(user_data == -1) {
                res.send("Suspicious Activity Logged..")
            } else {
                si_response = await Util.sendEmailLoginInstructions(
                    req.body.new_email, req.body.new_password, req.body.to_email);
                res.send(si_response);
            }

            
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
                user_data, req.body.full_email, req.body.mailbox_size_gb, DB.con);
            res.send(aeu_response);
    })()

});
app.post('/reset-email-user-password', (req, res) => {
    (async function () {

        user_data = await Util.getUserData(
            req.cookies['email'], req.cookies['auth_key'], DB.con);


            cpeu_response = await Util.resetEmailUserPass(
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

