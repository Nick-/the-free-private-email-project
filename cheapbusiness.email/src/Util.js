const crypto = require('crypto');
const moment = require('moment-timezone');
moment().tz("America/New_York").format();

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

async function getUserData(email, key, con) {

    return new Promise(resolve => {
        //console.log("Attempting to auth with " + email + " and " + key)
        if (email == "" || key == "" || email === undefined || key === undefined) {
            resolve(-1)
            return
        }
        q = "SELECT * FROM users WHERE email = '" + email + "' AND auth_key = '" + key + "'";
        con.query(q, (error, result) => {
            if (error) {
                console.log(error)
                resolve(-1);
            }
            if (result[0] != null) {
                if (result[0].auth_key == key) {
                    let exp = new Date(result[0].auth_exp);
                    if (exp > new Date()) {
                        resolve(JSON.parse(JSON.stringify(result[0])));
                    } else {
                         console.log("Key expired:", exp)
                        resolve(-1)
                    }
                } else {
                     console.log("Invalid Key")
                    resolve(-1);
                }
            } else {
                console.log("No email and key match")
                resolve(-1);
            }
        });
    });
}
async function registerUser(e,p,c) {
	 return new Promise(resolve => {
	    var token = crypto.randomBytes(64).toString('hex');
    var exp = moment(new Date().addDays(365)).format('YYYY-MM-DD HH:mm:ss');

	 var q1 = "INSERT into users(email, password, auth_key, auth_exp, domain_ids) VALUES (?,?,?,?,'')";
    c.query(q1, [e, p, token, exp], (error, result) => {
        if (error) {
            //console.log(error)
            var clientErrorMessage = ""
            if(error.toString().includes("Duplicate entry")) {
                clientErrorMessage = "That user already exists."
            }
		resolve({status: "failed", error: clientErrorMessage})
        } else {
        	resolve({status: "success", auth_key: token, email: e})
	}
    });
	 });
}
async function loginUser(e,p,c) {

    var token = crypto.randomBytes(64).toString('hex');
    var exp = moment(new Date().addDays(365)).format('YYYY-MM-DD HH:mm:ss');

 	return new Promise(resolve => {
 		var q = "UPDATE users SET auth_key = ?, auth_exp = ? WHERE email = ? and password = ?";
         c.query(q, [token, exp, e, p], (error, result) => {
            if (error) {
                //console.log(error)
                var clientErrorMessage = "Login Failed!"
            resolve({status: "failed", error: clientErrorMessage})
            } else {

                if(result.affectedRows == 0) {
                    resolve({status: "failed", error: "Invalid Username / Password"})
                } else {
                    resolve({status: "success", auth_key: token, email: e})
                }
            }
        });
	});
}

module.exports = {
	registerUser,
	loginUser,
	getUserData,
    isJSON,
    removeAllInstances,
    getRandomString,
    getRandomNumberString,
    sendEmail,
    reportError,
    isValidDate,
    capitalizeFirstLetter
}
