const { Resolver } = require('dns');
const { exec } = require("child_process");
var resolver = new Resolver()
resolver.setServers(['8.8.8.8']) //Google's
const crypto = require('crypto');
const bcrypt = require("bcrypt")
const moment = require('moment-timezone');
moment().tz("America/New_York").format();
var nodemailer = require('nodemailer');
const ejs = require("ejs")
const fastFolderSizeSync = require('fast-folder-size/sync');
const fs = require("fs");
const { send, report } = require('process');
const path = require("path");
const { convert } = require('html-to-text');


function isStrJSON(str) {
    try {
        return (JSON.parse(str) && !!str && str != "{}");
    } catch (e) {
        return false;
    }
}

function isJSON(o) {
    if (o == null) return false;
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

process.on('uncaughtException', function (err) {
    reportError(err.stack);
});

process.on('unhandledRejection', (err) => {
    reportError(err.stack);
});

function reportError(m) {
    if (process.env.REPORT_ERROR_TO_EMAIL)
        sendEmail(process.env.ADMIN_EMAIL, process.env.APP_NAME + ": ERROR", m)
    else
        console.log("[ERROR]: " + m)
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
async function registerUser(e, p, c) {
    return new Promise(resolve => {
        var token = crypto.randomBytes(64).toString('hex');
        var exp = moment(new Date().addDays(365)).format('YYYY-MM-DD HH:mm:ss');
        bcrypt.hash(p, 11).then(hash => {
            var q1 = "INSERT into users(email, password, auth_key, auth_exp, domain_ids) VALUES (?,?,?,?,'')";
            c.query(q1, [e, hash, token, exp], (error, result) => {
                if (error) {
                    //console.log(error)
                    var clientErrorMessage = ""
                    if (error.toString().includes("Duplicate entry")) {
                        clientErrorMessage = "That user already exists."
                    }
                    resolve({ status: "failed", error: clientErrorMessage })
                } else {
                    sendEmail(process.env.ADMIN_EMAIL, "New User!", e)
                    resolve({ status: "success", auth_key: token, email: e })
                }
            });
        }).catch(err => resolve({ status: "failed", error: "Error hashing password" }))
    });
}
async function loginUser(e, p, c) {
    return new Promise(resolve => {

        var passCheckQ = "SELECT password from users WHERE email = ?";
        c.query(passCheckQ, [e], (error, result) => {
            if (error) {
                //console.log(error)
                var clientErrorMessage = "Error connecting to database! Please contact an admin."
                resolve({ status: "failed", error: clientErrorMessage })
            } else {

                if(result.length == 0) {
                    resolve({ status: "failed", error: "Invalid Username / Password" })
                    return;
                }

                bcrypt.compare(p, result[0].password).then(res => {
                    if (res == false) {
                        resolve({ status: "failed", error: "Invalid Username / Password" })
                    } else {
                        var token = crypto.randomBytes(64).toString('hex');
                        var exp = moment(new Date().addDays(365)).format('YYYY-MM-DD HH:mm:ss');

                        var q = "UPDATE users SET auth_key = ?, auth_exp = ? WHERE email = ?";
                        c.query(q, [token, exp, e], (error, result) => {
                            if (error) {
                                //console.log(error)
                                var clientErrorMessage = "Login Failed!"
                                resolve({ status: "failed", error: clientErrorMessage })
                            } else {

                                if (result.affectedRows == 0) {
                                    resolve({ status: "failed", error: "Failed to update auth key in DB" })
                                } else {
                                    resolve({ status: "success", auth_key: token, email: e })
                                }
                            }
                        });
                    }
                })
                    .catch(err => resolve({ status: "failed", error: "Error Decrypting Password" }))



            }

        });

    });
}

function canAddMoreDomains(plan_id, num_current_domains) {
switch(plan_id) {
    case 0:
        if(num_current_domains == 1)
            return false;
    break;
}
return true;
}
function canAddMoreEmailUsers(plan_id, num_current_users) {
    switch(plan_id) {
        case 0:
            if(num_current_users == 1)
                return false;
        break;
    }
    return true;
    }
async function addEmailDomain(user_data, domain, c) {

    var my_domains = await getDomainsForUID(user_data, c) 
    return new Promise(resolve => {
        if (user_data == -1) {
            resolve({ status: "failed", error: "Failed to authenticate request." })
        } else if (domain == "") {
            resolve({ status: "failed", error: "Please Specify a domain" })
        } else if(!canAddMoreDomains(user_data.plan, my_domains.length)) {
            resolve({ status: "failed", error: "Maximum Domains Reached" })
        } else {

            var token = "cbev=" + crypto.randomBytes(64).toString('hex');

            var q = "INSERT INTO virtual_domains(name, owner_uid, dns_txt_code) VALUES(?, ?, ?)";
            c.query(q, [domain, user_data.uid, token], (error, result) => {
                if (error) {
                    //console.log(error)
                    var clientErrorMessage = ""
                    if (error.toString().includes("Duplicate entry")) {
                        //replace domain owner if domain is not verified
                        var cq = "SELECT dns_verified FROM virtual_domains WHERE name = ?";
                        c.query(cq, [domain], (error, results) => {
                            if (error) {
                                resolve({ status: "failed", error: "Error looking up domain in DB" })

                            } else {
                                if (results[0].dns_verified == 1) {
                                    var clientErrorMessage = "That domain has been verified by another user already."
                                    resolve({ status: "failed", error: clientErrorMessage })
                                } else {
                                    var uq = "UPDATE virtual_domains SET owner_uid = ? WHERE name = ?"
                                    c.query(uq, [user_data.uid, domain], (error, results) => {
                                        if (error) {
                                            resolve({ status: "failed", error: "Error looking up domain in DB" })
                                        } else {
                                            resolve({ status: "success", domain: domain, token: token })
                                        }
                                    })
                                }
                            }
                        });



                    } else {
                        resolve({ status: "failed", error: clientErrorMessage })

                    }
                } else {
                    resolve({ status: "success", domain: domain, token: token })
                }
            });
        }


    });
}
async function getDomainsForUID(user_data, c) {
    return new Promise(resolve => {
        if (user_data == -1) {
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
        if (user_data == -1) {
            resolve({ status: "failed", error: "Authentification Error" })
        } else {
            var q = "SELECT * FROM virtual_domains WHERE name = ?";

            c.query(q, [domain], (error, results) => {
                if (error) {
                    console.log(error)
                    resolve({ status: "failed", error: "Error looking up domain info in DB" })
                } else {
                    var dns_txt_key = results[0].dns_txt_code;

                    resolver.resolve(domain, "TXT", function (err, txt_records) {
                        if (err) {
                            resolve({ status: "failed", error: "Error looking up DNS.." });
                        } else {
                            var txt_verification_exists = false;
                            var spf_record_exists = false;
                            for (var i = 0; i < txt_records.length; i++) {
                                console.log(txt_records[i])
                                if (txt_records[i] == dns_txt_key) {
                                    txt_verification_exists = true;
                                }
                                //TODO: Validate SPF
                                //TODO: Validate DKIM
                                //TODO: Validate DMARC
                            }
                            if (!txt_verification_exists) {
                                resolve({ status: "failed", error: "TXT verification not set" })
                            } else {
                                //check MX record
                                resolver.resolve(domain, "MX", function (err, mx_records) {
                                    var mx_record_exists = false;
                                    for (var i = 0; i < mx_records.length; i++) {
                                        console.log(mx_records[i])
                                        if (mx_records[i].exchange == "cheapbusiness.email") {
                                            mx_record_exists = true;
                                            break;
                                        }
                                    }
                                    if (!mx_record_exists) {
                                        resolve({ status: "failed", error: "MX verification not set" })
                                    } else {
                                        //update verification status in DB
                                        var q = "UPDATE virtual_domains SET dns_verified = 1 WHERE name = ?";
                                        c.query(q, [domain], (error, results) => {
                                            if (error) {
                                                console.log(error)
                                                resolve({ status: "failed", error: "DNS Valid but failed to update status in DB" })
                                            } else {
                                                resolve({ status: "success", domain: domain })
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

function checkIfEmail(str) {
    // Regular expression to check if string is email
    const regexExp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/gi;
  
    return regexExp.test(str);
  }

async function addEmailUser(user_data, full_email, mailbox_size_gb, c) {

    var numUsersForDomain = await getEmailUsersLengthForDomainName([full_email.split("@")[1]], c);

    return new Promise(resolve => {

        if(process.env.DEV) {
            resolve({ status: "failed", error: "Cannot perform this action in developer mode" })
            return;
        }

        if (full_email == "" || full_email === undefined) {
            resolve({ status: "failed", error: "Empty Data" })
            return
        }

        try {
        var mailbox_size_gb_int = parseInt(mailbox_size_gb);
        } catch (e) {
            resolve({ status: "failed", error: "Invalid mailbox size parameter >:(" })
            return 
        }

        var mailbox_gb_allowed = 1; //free users get 1gb total storage

        if(user_data.plan == 1) {
            mailbox_gb_allowed = 100; //premium users are allowed 100gb
        }

        var mailbox_gb_remaining = mailbox_gb_allowed - user_data.mailbox_gb_allocated;
        if(mailbox_gb_remaining - mailbox_size_gb_int < 0) {
            resolve({ status: "failed", error: "Not enough storage, please upgrade!" })
            return 
        }

        if(!checkIfEmail(full_email)) {
            resolve({ status: "failed", error: "Invalid Email Address" })
            return
        }
        if (user_data == -1) {
            resolve({ status: "failed", error: "Authentification Error" })
        } else if(!canAddMoreEmailUsers(user_data.plan, numUsersForDomain)) {
            resolve({ status: "failed", error: "Maximum Users Created for Plan" })
        } else {

            var password = getRandomString(12);
            //get encrypted password via script..
            exec("doveadm pw -s SHA512-CRYPT -p " + password + " | cut -c 15-", (error, stdout, stderr) => {
                if (error) {
                    console.log(`error: ${error.message}`);
                    resolve({ status: "failed", error: "Failed to Generate Password" })
                    return;
                }
                if (stderr) {
                    console.log(`stderr: ${stderr}`);
                    resolve({ status: "failed", error: "Failed to Generate Password" })
                    return;
                }
                var hashedPass = (`${stdout}`).trim();
                //Make sure owner UID matches from auth
                var q = "SELECT id FROM virtual_domains WHERE name = ? and owner_uid = ?"
                c.query(q, [full_email.split("@")[1], user_data.uid], (error, results) => {
                    if (error) {
                        console.log(error)
                        resolve({ status: "failed", error: "Error looking up domain info in DB" })
                    } else {

                        if(results.length == 0) {
                            resolve({ status: "failed", error: "Error authenticating domain info in DB" })
                        } else {
                        console.log("Got domain id " + results[0].id + " and hash " + hashedPass + " for email " + full_email)
                        var ceuq = "INSERT INTO mailserver.virtual_users (domain_id, password , email, mailbox_size_gb) VALUES (?, ?, ?, ?)"
                        c.query(ceuq, [results[0].id, hashedPass, full_email, mailbox_size_gb_int], (error, result) => {
                            if (error) {
                                console.log(error)
                                var clientErrorMessage = "Error creating mail user!"
                                if (error.toString().includes("Duplicate entry")) {
                                    clientErrorMessage = "That user already exists."
                                }
                                resolve({ status: "failed", error: clientErrorMessage })
                            } else {

                                var email_user_id = result.insertId;

                                var q = "SELECT email, domain_id, created_at, mailbox_size_gb from virtual_users WHERE id = ?";

                                c.query(q, [email_user_id], (error, results) => {
                                    if(error) {
                                        resolve({ status: "failed", error: "Error returning new user data" })
                                    } else {
                                        var email_user = results[0];
                                        var ualuq = "UPDATE users SET mailbox_gb_allocated = ? WHERE uid = ?";
                                        var gb_alloc = user_data.mailbox_gb_allocated + mailbox_size_gb_int;
                                        c.query(ualuq, [gb_alloc, user_data.uid], (error, results) => {
                                            if(error) {
                                                resolve({ status: "failed", error: "Error updating user mailbox GB allocation." })
                                            } else {
                                                resolve({ status: "success", temp_pass: password, email_user: email_user, gb_alloc: gb_alloc })
                                            }
                                        })
                                    }   
                                });

                            }
                        });
                    }

                    }
                })
            });
        }
    });
}


async function getEmailUsersLengthForDomainName(domain_name, c) {
    return new Promise(resolve => {

        if (domain_name == "" || domain_name === undefined) {
            resolve(-1)
            return;
        }


        var q1 = "SELECT id from virtual_domains WHERE name = ?";

        c.query(q1, [domain_name], (error, results) => {
            if (error) {
                console.log(error)
                resolve({ status: "failed", error: "Error getting domain ID" })
            } else {

                var q = "SELECT email, domain_id, created_at from virtual_users WHERE domain_id = ?";

                c.query(q, [results[0].id], (error, results) => {
                    if (error) {
                        console.log(error)
                        resolve({ status: "failed", error: "Error looking up domain users in DB" })
                    } else {
                        resolve(results.length)
                    }
                });
            }
        });
    });
}


async function getEmailUsersForDomain(domains, c) {
    return new Promise(resolve => {

        if (domains == -1) {
            resolve(-1)
            return;
        }


        if (domains.length == 0) {
            resolve([])
            return;
        }
        var my_domain_ids = "";
        for (var i = 0; i < domains.length; i++) {
            my_domain_ids = my_domain_ids + domains[i].id + ","
        }
        my_domain_ids = my_domain_ids.substring(0, my_domain_ids.length - 1)

        var q = "SELECT email, domain_id, created_at, mailbox_size_gb from virtual_users WHERE domain_id IN (" + my_domain_ids + ")";

        c.query(q, [], (error, results) => {
            if (error) {
                console.log(error)
                resolve({ status: "failed", error: "Error looking up domain users in DB" })
            } else {
                console.log("Got emails:", results)
                for (var i = 0; i < results.length; i++) {
                    var storage_used = 0;
                    var uname = results[i].email.split("@")[0]
                    var domain = results[i].email.split("@")[1]
                    var email_storage_path = '/var/mail/vhosts/' + domain + "/" + uname + "/"
                    console.log("Getting size for " + email_storage_path)

                    try {
                        storage_used = fastFolderSizeSync(email_storage_path)
                    } catch (e) {
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


async function removeEmailDomain(user_data, domain, c) {

    var email_storage_path = '/var/mail/vhosts/' + domain + "/"
    var domain_gb = await getDomainGBalloc(domain, c);
    console.log("Domain gb allocated (del): " + domain_gb)
    return new Promise(resolve => {
        if (user_data == -1) {
            resolve({ status: "failed", error: "Authentification Error" })
        } else {
            //Auth Check request uid
            var dq = "DELETE FROM virtual_domains WHERE name = ? AND owner_uid = ?";
            c.query(dq, [domain, user_data.uid], (error, results) => {
                if (error) {
                    resolve({ status: "failed", error: "Error deleting domain in DB" })

                } else {
                    //Delete Users and their storage
                    var dq2 = "DELETE FROM virtual_users WHERE email LIKE '%"+domain+"'"
                    c.query(dq2, (error, results) => {
                        if (error) {
                            resolve({ status: "failed", error: "Error deleting domain users in DB" })
                        } else {

                            console.log("Deleteing domain folder..")
                            //Stops working here?

                            if (fs.existsSync(email_storage_path)) {
                                fs.rmSync(email_storage_path, { recursive: true, force: true });
                            }
                            //Finally, update user gb alloc
                            var ualuq = "UPDATE users SET mailbox_gb_allocated = ? WHERE uid = ?";
                            var new_gb_alloc = user_data.mailbox_gb_allocated - domain_gb;
                            console.log("Deleting domain.. Updating Storage alloc to " + new_gb_alloc)
                            c.query(ualuq, [new_gb_alloc, user_data.uid], (error, results) => {
                                if (error) {
                                    console.log(error)
                                    resolve({ status: "failed", error: "Error updating GB allocated for user" })
                                } else {
                                    resolve({ status: "success" }) //Just reload for now...
                                }
                            });
                        }
                    });
                }
            })
        }
    });
}

async function getEmailDomainOwnerUID(full_email, c) {
    return new Promise(resolve => {
    var domain = full_email.split("@")[1];
    var q = "SELECT owner_uid FROM virtual_domains WHERE name = ?";

    c.query(q, [domain], (error, results) => {
        if (error) {
            resolve(-1)
        } else {
            resolve(results[0].owner_uid)
        }
    });
    });
}

async function getEmailGBalloc(full_email, c) {
    return new Promise(resolve => {
    var q = "SELECT mailbox_size_gb FROM virtual_users WHERE email = ?";

    c.query(q, [full_email], (error, results) => {
        if (error) {
            resolve(-1)
        } else {
            resolve(parseInt(results[0].mailbox_size_gb))
        }
    });
    });
}

async function getDomainGBalloc(domain, c) {
    return new Promise(resolve => {
    var q = "SELECT mailbox_size_gb FROM virtual_users WHERE email LIKE '%"+domain+"'";

    c.query(q, (error, results) => {
        if (error) {
            console.log("Error getting domain GB size:", error)
            resolve(-1)
        } else {
            var gb = 0;
            for(var i = 0; i < results.length; i++) {
                gb = gb + parseInt(results[i].mailbox_size_gb)
            }
            resolve(gb)
        }
    });
    });
}

async function deleteEmailUser(user_data, full_email, c) {

    console.log("Deleting email user " + full_email)
    var owner_uid = await getEmailDomainOwnerUID(full_email, c)
    var mailbox_size_gb_int = await getEmailGBalloc(full_email, c)
    var uname = full_email.split("@")[0]
    var domain = full_email.split("@")[1]
    var email_storage_path = '/var/mail/vhosts/' + domain + "/" + uname + "/"

    return new Promise(resolve => {
        if (user_data == -1) {
            resolve({ status: "failed", error: "Authentification Error" })
        } else if(user_data.uid != owner_uid) {
            resolve({ status: "failed", error: "You don't own that domain..." })
        } else {
            var dq = "DELETE FROM virtual_users WHERE email = ?";
            c.query(dq, [full_email], (error, results) => {
                if (error) {
                    resolve({ status: "failed", error: "Error deleting email user in DB" })
                } else {

                    var ualuq = "UPDATE users SET mailbox_gb_allocated = ? WHERE uid = ?";
                    var new_gb_alloc = user_data.mailbox_gb_allocated - mailbox_size_gb_int;

                    c.query(ualuq, [new_gb_alloc, user_data.uid], (error, results) => {
                        if (error) {
                            resolve({ status: "failed", error: "Error deleting email user in DB" })
                        } else {
                            //Remove files, mv these to a trash in the future for compliance purposes
                            
                            var storage_used = 0;
                            if (fs.existsSync(email_storage_path)) {
                                storage_used = fastFolderSizeSync(email_storage_path)
                                fs.rmSync(email_storage_path, { recursive: true, force: true });
                            }
                            resolve({ status: "success", gb_alloc: new_gb_alloc, del_email: full_email, storage_cleared: storage_used})
                        }
                    });

                }
            })
        }
    });
}

async function resetEmailUserPass(user_data, full_email, c) {

    owner_uid = await getEmailDomainOwnerUID(full_email, c)

    return new Promise(resolve => {

        if(process.env.DEV) {
            resolve({ status: "failed", error: "Cannot perform this action in developer mode" })
            return;
        }

        if (user_data == -1) {
            resolve({ status: "failed", error: "Authentification Error" })
        } else if(user_data.uid != owner_uid) {
            resolve({ status: "failed", error: "You don't own that domain..." })
        } else {
            var password = getRandomString(12);
            exec("doveadm pw -s SHA512-CRYPT -p " + password + " | cut -c 15-", (error, stdout, stderr) => {
                if (error) {
                    console.log(`error: ${error.message}`);
                    resolve({ status: "failed", error: "Failed to Generate Password" })
                    return;
                }
                if (stderr) {
                    console.log(`stderr: ${stderr}`);
                    resolve({ status: "failed", error: "Failed to Generate Password" })
                    return;
                }
                var hashedPass = (`${stdout}`).trim();
                var upq = "UPDATE virtual_users SET password = ? WHERE email = ?";
                c.query(upq, [hashedPass, full_email], (error, result) => {
                    if (error) {
                        resolve({ status: "failed", error: "Failed to reset password.." })
                    } else {
                        resolve({ status: "success", tmp_pass:password, email: full_email })
                    }
                });
            })
        }
    });
}



var transporter = nodemailer.createTransport({
    host: "cheapbusiness.email",
    port: 587,
    auth: {
      user: process.env.NOREPLY_EMAIL,
      pass: process.env.NOREPLY_EMAIL_PASSWORD
    }
  });

  var lead_transporter = nodemailer.createTransport({
    host: "cheapbusiness.email",
    port: 587,
    auth: {
      user: process.env.NICK_EMAIL,
      pass: process.env.NICK_PASSWORD
    }
  });

function sendEmail(to_email, subject, message) {
    var mailOptions = {
        from: '"Cheap Business Email 💸" <' + process.env.NOREPLY_EMAIL + '>',
        to: to_email,
        subject: subject,
        text: message
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
}

function sendLeadEmail(to_email, subject, message) {
    var mailOptions = {
        from: '"Cheap Business Email 💸" <' + process.env.NICK_EMAIL + '>',
        to: to_email,
        subject: subject,
        text: message
      };
      
      lead_transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
}

function sendHTMLEmail(template_name, template_data, to_email) {
    console.log("Sending HTML Email: ", to_email)
    var subject = "Cheap Business Email"
    switch(template_name) {
        case "forgot_password":
            subject = "Reset Your Password"
            break;
        case "forgot_password":
            subject = "Email Login Instructions"
            break;
    }

    ejs.renderFile(path.join(__dirname, "../views/email/" + template_name + ".html"), template_data)
        .then(result => {

            var mailOptions = {
                from: '"Cheap Business Email 💸" <' + process.env.NOREPLY_EMAIL + '>',
                to: to_email,
                subject: subject,
                html: result
            };

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });
        })


}

async function generateForgotPasswordKey(email, con) {
    return new Promise(resolve => {
        var token = crypto.randomBytes(64).toString('hex');
        var exp = moment(new Date().addDays(1)).format('YYYY-MM-DD HH:mm:ss');
        var q = "UPDATE users SET forgot_password_key = '" + token + "', forgot_password_expiration = '" + exp + "' WHERE email = '" + email + "'";
        con.query(q, (error, result) => {
            if (error) throw error;
            resolve(token);
        });
    });
}

async function userExists(email, con) {
    return new Promise(resolve => {
        var q = "SELECT * FROM users WHERE email = ?"
        con.query(q, [email], (error, results) => {
           if(error) {
                resolve(false)
           } else {
            if(results.length == 0) {
                resolve(false)
            } else {
                resolve(true)
            }
           }
        });
    })
}

async function sendForgotPassword(email, c) {
    console.log("Reseting user password for " + email)
    var user_exists = await userExists(email, c);

    if(!user_exists) {
        return { status: "failed", error: "That user doesn't exist" };
    }

    var reset_key = await generateForgotPasswordKey(email, c);

    return new Promise(resolve => {
         try {
            
            sendHTMLEmail("forgot_password", {email: email, pk: reset_key}, email)
            resolve({ status: "success"})
         } catch(e) {
            console.log(e)
            resolve({ status: "failed", error: "There was an error on our end.. Please contact an admin!" })
         }
    });
}

async function submitResetPassword(email, fpk, password, con) {
    return new Promise(resolve => {
    bcrypt.hash(password, 11, function (err, hash) {
        if(err) {
            resolve({ status: "failed", error: "There was an error creating your new password.." })
        } else {
        var q = "UPDATE users SET password = ?, forgot_password_key = '' WHERE email = ? AND forgot_password_key = ? AND forgot_password_expiration >= CURDATE()";
        con.query(q, [hash, email, fpk], (error, email_results) => {
            if (error) {
                console.log(error)
                resolve({ status: "failed", error: "There was an error resetting your password.." })
            } else {
                resolve({ status: "success"})
            }
        });
    }
    });
});
}

function timeSince(date) {

    var seconds = Math.floor((new Date() - date) / 1000);
  
    var interval = seconds / 31536000;
  
    if (interval > 1) {
      return Math.floor(interval) + " years";
    }
    interval = seconds / 2592000;
    if (interval > 1) {
      return Math.floor(interval) + " months";
    }
    interval = seconds / 86400;
    if (interval > 1) {
      return Math.floor(interval) + " days";
    }
    interval = seconds / 3600;
    if (interval > 1) {
      return Math.floor(interval) + " hours";
    }
    interval = seconds / 60;
    if (interval > 1) {
      return Math.floor(interval) + " minutes";
    }
    return Math.floor(seconds) + " seconds";
  }

  async function sendEmailLoginInstructions(new_email, new_password, to_email) {
    return new Promise(resolve => {
        try {
           sendHTMLEmail("email_instructions", {email: new_email, password: new_password, to_email:to_email}, to_email)
           resolve({ status: "success"})
        } catch(e) {
           console.log(e)
           resolve({ status: "failed", error: "There was an error on our end.. Please contact an admin!" })
        }
   });
  }
  
  async function getBlogPostPreviews(con) {
    return new Promise(resolve => {
        var q = "SELECT * FROM blog_posts";
        con.query(q, (error, results) => {
            if (error) {
                resolve({ status: "failed", error: "Error getting blog posts..." })
            } else {
                resolve(results)
            }
        });
    });
  }

  function saveImageDataToFileSystemBuffer(buffer, slug) {

    var imgPath = path.join(__dirname, '../public/img/uploads/')


    fs.writeFile(imgPath + slug+ ".webp", buffer, {
        flag: 'w',
    }, function (err) {
        if (err)
            console.log("Image write error: " + err);
    });
}

  async function createBlogPost(con, body, file_buffer) {
    return new Promise(resolve => {

        saveImageDataToFileSystemBuffer(file_buffer, body.slug)

        var slug = body.slug;
        var title = body.title;
        var cover_url = "/img/uploads/" + slug + ".webp";
        var excerpt = body.excerpt;
        var post_date = new Date();
        var post_content = body.content;
        var seo_keywords = body.seo_keywords;
        var seo_description = body.seo_description;

        var q = "INSERT INTO blog_posts (slug, title, cover_url, excerpt, post_date, post_content, seo_keywords, seo_description) VALUES (?,?,?,?,?,?,?,?)"
        con.query(q, [slug, title, cover_url, excerpt, post_date, post_content, seo_keywords, seo_description], (error, results) => {
            if (error) {
                console.log(error)
                resolve({ status: "failed", error: "Error creating blog post..." })
            } else {
                resolve({ status: "success" })
            }
        });

    });
  }

  async function getBlogSlug(con, edit_id) {
    return new Promise(resolve => {
        var q = "SELECT slug FROM blog_posts WHERE id = ?";
        con.query(q, [edit_id], (error, results) => {
            if (error) {
                console.log(error)
                resolve(-1)
            } else {
                resolve(results[0].slug)
            }
        });
    });
  }
  
  async function updateBlogPost(con, body, file_buffer) {

    var old_slug = await getBlogSlug(con, body.id)

    return new Promise(resolve => {

        if(file_buffer == null) {
            console.log("Updating blog post, no new image")
            if(old_slug != body.slug) {
                console.log("But slug is updated")
                var oldPath = path.join(__dirname, '../public/img/uploads/' + old_slug + ".webp")
                var newPath = path.join(__dirname, '../public/img/uploads/' + body.slug + ".webp")
                fs.rename(oldPath, newPath, function (err) {
                    if (err) {
                        reportError("Error updating blog post image from slug change")
                    } else {
                        console.log('Successfully renamed - AKA moved!')
                    }
                  })
            }

        } else {
            saveImageDataToFileSystemBuffer(file_buffer, body.slug)
            if(old_slug != body.slug) {
                console.log("Deleting Old Slug Image")
                var imgPath = path.join(__dirname, '../public/img/uploads/' + old_slug + ".webp")
                fs.unlinkSync(imgPath)
            }
        }

        var edit_id = body.id;
        var slug = body.slug;
        var title = body.title;
        var cover_url = "/img/uploads/" + slug + ".webp";
        var excerpt = body.excerpt;
        var post_date = new Date();
        var post_content = body.content;
        var seo_keywords = body.seo_keywords;
        var seo_description = body.seo_description;

        var q = "UPDATE blog_posts SET slug = ?, title = ?, cover_url = ?, excerpt = ?, post_date = ?, post_content = ?, seo_keywords = ?, seo_description = ? WHERE id = ?"
        con.query(q, [slug, title, cover_url, excerpt, post_date, post_content, seo_keywords, seo_description, edit_id], (error, results) => {
            if (error) {
                console.log(error)
                resolve({ status: "failed", error: "Error editing blog post..." })
            } else {
                resolve({ status: "success" })
            }
        });

    });
  }

  async function loadBlogPost(con, slug) {
    return new Promise(resolve => {
        var q = "SELECT * FROM blog_posts WHERE slug = ?";
        con.query(q, [slug], (error, results) => {
            if (error) {
                console.log(error)
                resolve(-1)
            } else {
                if(results.length == 0) {
                    resolve(-1)
                } else {
                    resolve(results[0])
                }
            }
        });
    });
  }

  async function deleteBlogPost(con, slug) {
    return new Promise(resolve => {
        var q = "DELETE FROM blog_posts WHERE slug = ?"
        con.query(q, [slug], (error, results) => {
            if (error) {
                console.log(error)
                resolve({ status: "failed", error: "Error removing blog post..." })
            } else {
                var imgPath = path.join(__dirname, '../public/img/uploads/' + slug + ".webp")
                fs.unlinkSync(imgPath)
                resolve({ status: "success" })
            }
        })
    });
}

async function getLeads(con) {
    return new Promise(resolve => {
        var q = "SELECT * FROM leads ORDER BY email DESC"
        con.query(q, (error, results) => {
            if (error) {
                console.log(error)
                resolve([])
            } else {
                resolve(results)
            }
        })
    });
}

async function getLeadEmailTemplates(con) {
    return new Promise(resolve => {
        var q = "SELECT * FROM lead_email_templates"
        con.query(q, (error, results) => {
            if (error) {
                console.log(error)
                resolve([])
            } else {
                resolve(results)
            }
        })
    });
}

async function createEmailTemplate(con, subject, body) {
    return new Promise(resolve => {
        var q = "INSERT INTO lead_email_templates (subject, body) VALUES (?,?)"
        con.query(q, [subject, body], (error, results) => {
            if (error) {
                console.log(error)
                resolve({ status: "failed", error: "Error creating email template..." })
            } else {
                resolve({ status: "success"})
            }
        })
    });
}

async function updateEmailTemplate(con, subject, body, id) {
    return new Promise(resolve => {
        var q = "UPDATE lead_email_templates SET subject = ?, body = ? WHERE id = ?"
        con.query(q, [subject, body, id], (error, results) => {
            if (error) {
                console.log(error)
                resolve({ status: "failed", error: "Error creating email template..." })
            } else {
                resolve({ status: "success"})
            }
        })
    });
}

async function leadExists(con, email) {
    return new Promise(resolve => {
        var q = "SELECT email FROM leads WHERE email = ?"
        con.query(q, [email], (error, results) => {
            if (error) {
                console.log(error)
                resolve(-1);
            } else {
                if(results.length == 0) {
                    resolve(0)
                } else {
                    resolve(1)
                }
                
            }
        })
    });
}


async function createLead(con, data) {

    var email = data.email.toLowerCase();

    var lead_exists = await leadExists(con, email)

    if(lead_exists == -1) {
        return { status: "failed", error: "Error checking lead existance..." }
    } else if(lead_exists == 1) {
        return { status: "failed", error: "That lead already exists" }
    }

    return new Promise(resolve => {
        var q = "INSERT INTO leads (first_name, last_name, email, url) VALUES (?,?,?,?)"
        con.query(q, [data.first_name, data.last_name, email, data.url], (error, results) => {
            if (error) {
                console.log(error)
                resolve({ status: "failed", error: "Error creating lead..." })
            } else {
                resolve({ status: "success"})
            }
        })
    });
}

async function contactLead(con, lead_id, template_id) {
    return new Promise(resolve => {
        var q = "SELECT * FROM leads WHERE lead_id = ?"
        con.query(q, [lead_id], (error, results) => {
            if (error) {
                console.log(error)
                resolve({ status: "failed", error: "Error contacting lead..." })
            } else {
                var lead_data = results[0];
                var lead_interaction_data = results[0].interaction_data;
                var etq = "SELECT * FROM lead_email_templates WHERE id = ?";
                con.query(etq, [template_id], (error, tresults) => {
                    if (error) {
                        console.log(error)
                        resolve({ status: "failed", error: "Error contacting lead..." })
                    } else {
                        var body = convert(tresults[0].body, {wordwrap: false});
                        body = body.replace(/first_name/g, lead_data.first_name)
                        sendLeadEmail(lead_data.email, tresults[0].subject, body)

                        //Lock the template
                        var ltq = "UPDATE lead_email_templates SET locked = 1 WHERE id = ?"
                        con.query(ltq, [template_id], (error, tresults) => {
                            if (error) {
                                console.log(error)
                                resolve({ status: "failed", error: "Error locking lead template..." })
                            } else {
                                //console.log("Updating Interaction Data:", lead_interaction_data)
                                //Add to interaction data
                                if(lead_interaction_data == null) {
                                    lead_interaction_data = {
                                        interactions: [
                                            {
                                                template_id:template_id,
                                                date: new Date()
                                            }
                                        ]
                                    }
                                } else {
                                    lead_interaction_data = JSON.parse(lead_interaction_data);
                                    lead_interaction_data.interactions.push({template_id:template_id,date: new Date()})
                                }

                                lead_interaction_data = JSON.stringify(lead_interaction_data);

                                var uuiq = "UPDATE leads SET interaction_data = ? WHERE lead_id = ?"
                                con.query(uuiq, [lead_interaction_data, lead_id], (error, tresults) => {
                                    if (error) {
                                        console.log(error)
                                        resolve({ status: "failed", error: "Error updating lead interaction data..." })
                                    } else {
                                        resolve({ status: "success", lead_interaction_data: lead_interaction_data})
                                    }
                                });
                            }
                        });
                    }
                });
            }
        })
    });
}
module.exports = {
    contactLead,
    createLead,
    updateEmailTemplate,
    createEmailTemplate,
    getLeadEmailTemplates,
    getLeads,
    updateBlogPost,
    deleteBlogPost,
    loadBlogPost,
    createBlogPost,
    getBlogPostPreviews,
    sendEmailLoginInstructions,
    timeSince,
    submitResetPassword,
    sendForgotPassword,
    sendEmail,
    resetEmailUserPass,
    deleteEmailUser,
    removeEmailDomain,
    getEmailUsersForDomain,
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
