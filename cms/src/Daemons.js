const schedule = require('node-schedule');
const Util = require("./Util.js");
const DB = require("./DB.js");
const moment = require('moment-timezone');
moment().tz("America/New_York").format();

schedule.scheduleJob('0 12 * * *', () => {
    dayDaemon(); // runs everyday at noon
})
schedule.scheduleJob('0 * * * *', () => {
    hourDaemon();
})
schedule.scheduleJob('* * * * *', () => {
    minuteDaemon();
})

var serverStartTime = new Date();

function dayDaemon() {
Util.sendEmail(process.env.ADMIN_EMAIL, "Mail Web Server Online!", "Server has been online for: " + Util.timeSince(serverStartTime))

var cpeq = "SELECT subscription_exp FROM users";
DB.con.query(cpeq, (error, results) => {
    if (error) {
        console.log(error)
    } else {
        for(var i = 0; i < results.length; i++) {
            if(results[i].subscription_exp != null) {
                //TODO, check with moment if user is past premium expiration date..
            }
        }
    }
});

}

function hourDaemon() {
    var ka = "SELECT uid FROM users LIMIT 1"; //keepAlive
    DB.con.query(ka, (error, results) => {
        if (error) {
            Util.reportError(error.stack)
        } else {
            console.log("Heartbeat")
        }
    });
}

function minuteDaemon() {
    
}

