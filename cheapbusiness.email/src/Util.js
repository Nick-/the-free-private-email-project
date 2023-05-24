const { Resolver } = require('dns');
const { exec } = require("child_process");
var resolver = new Resolver()
resolver.setServers(['8.8.8.8']) //Google's
const crypto = require('crypto');
const moment = require('moment-timezone');
const fastFolderSizeSync = require('fast-folder-size/sync')
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

async function addEmailDomain(user_data, domain, c) {
    return new Promise(resolve => {
        if(user_data == -1) {
            resolve({status: "failed", error:"Failed to authenticate request."})
        } else if(domain == "") {
            resolve({status: "failed", error:"Please Specify a domain"})
        } else {

            var token = crypto.randomBytes(64).toString('hex');

            var q = "INSERT INTO virtual_domains(name, owner_uid, dns_txt_code) VALUES(?, ?, ?)";
            c.query(q, [domain, user_data.uid, token], (error, result) => {
                if (error) {
                    //console.log(error)
                    var clientErrorMessage = ""
                    if(error.toString().includes("Duplicate entry")) {
                        clientErrorMessage = "That domain already exists."
                    }
                resolve({status: "failed", error: clientErrorMessage})
                } else {
                    resolve({status: "success", domain: domain, token: token})
            }
            });
        }


    });
}
function getDomainsForUID(user_data, c) {
    return new Promise(resolve => {
        if(user_data == -1) {
            resolve(-1)
        } else {
            var q = "SELECT * FROM virtual_domains WHERE owner_uid = ?";
            c.query(q, [user_data.uid], (error, results) => {
                if (error) {
                    console.log(error)
                    resolve(-1)
                } else {
                    resolve(results)
                }
            });
        }
    });
}

async function verifyEmailDomain(user_data, domain, c) {
    console.log("Validating " + domain + " for user: " + user_data.email)
    console.log("RESOLVER:", resolver.getServers())
    return new Promise(resolve => {
        if(user_data == -1) {
            resolve({status: "failed", error: "Authentification Error"})
        } else {
            var q = "SELECT * FROM virtual_domains WHERE name = ?";
            
            c.query(q, [domain], (error, results) => {
                if (error) {
                    console.log(error)
                    resolve({status: "failed", error: "Error looking up domain info in DB"})
                } else {
                    var dns_txt_key = results[0].dns_txt_code;
                    
                    resolver.resolve(domain, "TXT", function(err, txt_records) {
                        if(err) {
                            resolve({status: "failed", error: "Error looking up DNS.."});
                        } else {
                            var txt_verification_exists = false;
                            var spf_record_exists = false;
                            for(var i = 0; i < txt_records.length; i++) {
                                console.log(txt_records[i])
                                if(txt_records[i] == dns_txt_key) {
                                    txt_verification_exists = true;
                                }
                                //TODO: Validate SPF?
                            }
                            if(!txt_verification_exists) {
                                resolve({status: "failed", error: "TXT verification not set"})
                            } else {

                                console.log("STEP " + domain)
                                //check MX record
                                resolver.resolve(domain, "MX", function(err, mx_records) {
                                    var mx_record_exists = false;
                                    for(var i = 0; i < mx_records.length; i++) {
                                        console.log(mx_records[i])
                                        if(mx_records[i].exchange == "cheapbusiness.email") {
                                            mx_record_exists = true;
                                            break;
                                        }
                                    }
                                    if(!mx_record_exists) {
                                        resolve({status: "failed", error: "MX verification not set"})
                                    } else {
                                        console.log("STEPf " + domain)
                                        //update verification status in DB
                                        var q = "UPDATE virtual_domains SET dns_verified = 1 WHERE name = ?";
                                        c.query(q, [domain], (error, results) => {
                                            if (error) {
                                                console.log(error)
                                                resolve({status: "failed", error: "DNS Valid but failed to update status in DB"})
                                            } else {
                                                resolve({status: "success", domain: domain})
                                            }
                                        });
                                        
                                    }
                                });
                            }
                        }
                    })

                }
            });
        }
    })
}
async function addEmailUser(user_data, full_email, password, c) {
    return new Promise(resolve => {
        if (full_email == "" || password == "" || full_email === undefined || password === undefined) {
            resolve({status: "failed", error: "Empty Data"})
            return
        }
        if(user_data == -1) {
            resolve({status: "failed", error: "Authentification Error"})
        } else {
            //first, get encrypted password via script..
            exec("doveadm pw -s SHA512-CRYPT -p "+password+" | cut -c 15-", (error, stdout, stderr) => {
                if (error) {
                    console.log(`error: ${error.message}`);
                    resolve({status: "failed", error: "Failed to Generate Password"})
                    return;
                }
                if (stderr) {
                    console.log(`stderr: ${stderr}`);
                    resolve({status: "failed", error: "Failed to Generate Password"})
                    return;
                }
                var hashedPass = (`${stdout}`).trim();

                var q = "SELECT id FROM virtual_domains WHERE name = ?"
                c.query(q, [full_email.split("@")[1]], (error, results) => {
                    if (error) {
                        console.log(error)
                        resolve({status: "failed", error: "Error looking up domain info in DB"})
                    } else {
                        console.log("Got email id " + results[0].id + " and hash " + hashedPass + " for email " + full_email)
                        var ceuq = "INSERT INTO mailserver.virtual_users (domain_id, password , email) VALUES (?, ?, ?)"
                        c.query(ceuq, [results[0].id, hashedPass, full_email], (error, results) => {
                            if (error) {
                                console.log(error)
                                resolve({status: "failed", error: "Error creating mail user!"})
                            } else {
                                resolve({status: "success"})
                            }
                        });
                    }
                })   
            });
        }
    });
}
async function getEmailUsersForUser(domains, c) {
    return new Promise(resolve => {

        if(domains == -1) {
            resolve(-1)
            return;
        }

        var my_domain_ids = "";
        for(var i = 0; i < domains.length; i++) {
            my_domain_ids = my_domain_ids + domains[i].id + ","
        }
        my_domain_ids = my_domain_ids.substring(0, my_domain_ids.length - 1)

        var q = "SELECT email, domain_id, created_at from virtual_users WHERE domain_id IN ("+my_domain_ids+")";
 
        c.query(q, [], (error, results) => {
            if (error) {
                console.log(error)
                resolve({status: "failed", error: "Error looking up domain users in DB"})
            } else {
                console.log("Got emails:", results)
                for(var i = 0; i < results.length; i++) {
                    var storage_used = "?GB";
                    var uname = results[i].email.split("@")[0]
                    var domain = results[i].email.split("@")[1]
                    var email_storage_path = '/var/mail/vhosts/' + domain + "/" + uname + "/"
                    console.log("Getting size for " + email_storage_path)

                    try {
                    storage_used = fastFolderSizeSync(email_storage_path)
                    } catch(e) {
                        console.log("Failed to get folder size for " + results[i].email)
                    }
                    results[i].storage_used = storage_used;
                }
                console.log("Done Getting Email Users")
                resolve(results)
            }
        });
    });
}
module.exports = {
    getEmailUsersForUser,
    addEmailUser,
    verifyEmailDomain,
    getDomainsForUID,
    addEmailDomain,
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
