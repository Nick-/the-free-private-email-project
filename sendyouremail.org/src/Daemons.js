const schedule = require('node-schedule');

schedule.scheduleJob('0 12 * * *', () => {
    dayDaemon(); // runs everyday at noon
})
schedule.scheduleJob('0 * * * *', () => {
    hourDaemon();
})
schedule.scheduleJob('* * * * *', () => {
    minuteDaemon();
})

function dayDaemon() {

}

function hourDaemon() {

}

function minuteDaemon() {
    
}

