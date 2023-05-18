
function isStrJSON(str) {
    try {
        return (JSON.parse(str) && !!str && str != "{}");
    } catch (e) {
        return false;
    }
}

function isJSON(o) {
    if(o == null) return false;
    return (o.constructor == Object)
}

function removeAllInstances(arr, item) {
    for (var i = arr.length; i--;) {
        if (arr[i] == item) arr.splice(i, 1);
    }
}

function getRandomString(length) {
    var randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var result = '';
    for (var i = 0; i < length; i++) {
        result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
    }
    return result;
}

function getRandomNumberString(length) {
    var randomChars = '0123456789';
    var result = '';
    for (var i = 0; i < length; i++) {
        result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
    }
    return result;
}

process.on('uncaughtException', function(err) {
    reportError(err.stack);
});
 
process.on('unhandledRejection', (err) => {
    reportError(err.stack);
});

function sendEmail() {
    //TODO
    console.log("SET UP EMAIL!")
}

function reportError(m) {
     if (process.env.DEV)
         console.log("[ERROR]: " + m)
     else
         sendEmail(process.env.ADMIN_EMAIL, process.env.APP_NAME + ": ERROR", m)
         
}

function isValidDate(date) {
    return date && Object.prototype.toString.call(date) === "[object Date]" && !isNaN(date);
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

 Array.prototype.remove = function () {
    var what, a = arguments,
        L = a.length,
        ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};

Date.prototype.addDays = function (days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}


module.exports = {
    isJSON,
    removeAllInstances,
    getRandomString,
    getRandomNumberString,
    sendEmail,
    reportError,
    isValidDate,
    capitalizeFirstLetter
}