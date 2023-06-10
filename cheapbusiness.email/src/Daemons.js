const schedule = require('node-schedule');
const Util = require("./Util.js");

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
}

function hourDaemon() {

}

function minuteDaemon() {
    
}

