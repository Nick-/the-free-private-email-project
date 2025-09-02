console.log("Welcome to Cheap Business Email!");

function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    let expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }

  function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }


var copyDivs = document.getElementsByClassName("copy-div");

for(var i = 0; i < copyDivs.length; i++) {
    copyDivs[i].onclick = function(e) {
        navigator.clipboard.writeText(e.target.innerHTML);
    }
}

var copyButtons = document.getElementsByClassName("copy-button");

for(var i = 0; i < copyButtons.length; i++) {
    copyButtons[i].onclick = function(e) {
        navigator.clipboard.writeText(document.getElementById(e.target.dataset.id).innerHTML);
    }
}

var registerForm = document.getElementById("register-form");
if(registerForm) {
registerForm.addEventListener("submit", function (e) {
    e.preventDefault();
    register(registerForm);
    return false;
});
}
function deleteDomain(domain) {
    if(confirm("Are you sure you wish to delete "+domain+"?")) {
        var formData = { domain: domain };
        $.ajax({
            type: "POST",
            url: "/delete-email-domain",
            data: formData,
            dataType: "json",
            encode: true,
        }).done(function (data) {
            if(data.status == "success") {
                alert("Domain deleted successfully")
                    window.location.reload();
            } else {
                alert(data.error)
            }
        });
    }
}
function register(form) {
    var un = form.email.value;
    var pw = form.password.value;
    var formData = {
        email: un,
        password: pw
    };

    $.ajax({
        type: "POST",
        url: "/register",
        data: formData,
        dataType: "json",
        encode: true,
    }).done(function (data) {
        if(data.status == "success") {
            if(host != "localhost")
            {
            gtag('event', 'sign_up', {
                'email': data.email
              });
            }
        setCookie("email", data.email, 30)
        setCookie("auth_key", data.auth_key, 30);
        alert("Success!")
        window.location.reload();
        } else {
            alert(data.error)
        }
    });
    console.log("Submitting Registration")
}


var loginForm = document.getElementById("login-form");

if(loginForm) {
loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    login(loginForm);
    return false;
});
}

function login(form) {
    var un = form.email.value;
    var pw = form.password.value;
    var formData = {
        email: un,
        password: pw
    };

    $.ajax({
        type: "POST",
        url: "/login",
        data: formData,
        dataType: "json",
        encode: true,
    }).done(function (data) {
        if(data.status == "success") {
            setCookie("email", data.email, 30)
            setCookie("auth_key", data.auth_key, 30);
            window.location.reload();
        } else {
            alert(data.error)
        }
    });
}

function showLogin() {
    document.getElementById("login-form").style.display = "block"
    document.getElementById("register-form").style.display = "none"
}
function showRegister() {
    document.getElementById("login-form").style.display = "none"
    document.getElementById("register-form").style.display = "block"
}

function logout() {
    setCookie("email", "", -1)
    setCookie("auth_key", "", -1);
    window.location.reload();
}

function addDomain() {
    var domain = prompt("What is the new domain?")
    if(domain == "" || domain == null) return;
    var formData = {
        domain: domain
    };

    $.ajax({
        type: "POST",
        url: "/add-email-domain",
        data: formData,
        dataType: "json",
        encode: true,
    }).done(function (data) {
        if(data.status == "success") {
            //Show instructions for verifying domain
       //     showDomainVerificationInstructions(data.domain,data.token)
window.location.reload();
        } else {
            alert(data.error)
        }
    });
}

function validateDomain() {
    var domain = document.getElementById("verify-domain-name-span").innerHTML;
    var formData = {
        domain: domain
    };

    $.ajax({
        type: "POST",
        url: "/verify-email-domain",
        data: formData,
        dataType: "json",
        encode: true,
    }).done(function (data) {
        if(data.status == "success") {
            alert(data.domain + " was successfully validated!")
            window.location.reload()
        } else {
            alert(data.error)
        }
    });
}

var headerPrompt = document.getElementById("prompt")
var domainVerificationInstructionScreen = document.getElementById("dvis");
var bottomButton = document.getElementById("bottom-button");
var my_domains = document.getElementsByClassName("my_domain");


function showDomainVerificationInstructions(domain,txt_key) {
    document.getElementById("dns-txt-key").innerHTML = txt_key;
    document.getElementById("verify-domain-name").innerHTML = "Update DNS for <span style='color:gold' id='verify-domain-name-span'>" + domain + "</span>";
document.getElementById("delete-unverified-domain").onclick = function() { 
	deleteDomain(domain);
}
	domainVerificationInstructionScreen.style.display = "block";

}
function closeValidateDomain() {
    domainVerificationInstructionScreen.style.display = "none"
}

function gotoDomainList() {
    headerPrompt.innerHTML = "Select a Domain";
    bottomButton.innerHTML = "Add Domain";
    bottomButton.onclick = addDomain;

    for(var i = 0; i < my_domains.length; i++) {
            my_domains[i].style.display = "block"
    }

    for(var i = 0; i < my_domain_panels.length; i++) {
            my_domain_panels[i].style.display = "none"
    }

}

function showMembershipPlans() {
    document.getElementById("membership-plans").style.display = "block"
}

function closeMembershipPlans() {
    document.getElementById("membership-plans").style.display = "none"
}

function showForgotPassword() {
    document.getElementById("forgot-password-screen").style.display = "block";
}
function closeForgotPassword() {
    document.getElementById("forgot-password-screen").style.display = "none";
}

function sendPasswordReset() {
    var fp_email = document.getElementById("forgot-password-email").value;
    var formData = {
        email:fp_email
    };

    $.ajax({
        type: "POST",
        url: "/forgot-password",
        data: formData,
        dataType: "json",
        encode: true,
    }).done(function (data) {
        if(data.status == "success") {
            alert("A password reset has been sent to that email if it exists.")
            closeForgotPassword()
        } else {
            alert(data.error)
        }
    });
}

function sendEmailLoginInstructions() {
    var new_email = document.getElementById("email-created-username").textContent;
    var new_password = document.getElementById("email-created-password").textContent;
    var to_email = document.getElementById("send-email-instructions-email").value;

    var formData = {
        new_email: new_email,
        new_password: new_password,
        to_email: to_email
    };

    $.ajax({
        type: "POST",
        url: "/send-email-login-instructions",
        data: formData,
        dataType: "json",
        encode: true,
    }).done(function (data) {
        if(data.status == "success") {
            alert("Login instructions have been emailed successfully.")
        } else {
            alert(data.error)
        }
    });
}

function showDomainPanel(id) {
    headerPrompt.innerHTML = "Domain Management";
    bottomButton.innerHTML = "Back";
    bottomButton.onclick = gotoDomainList;
    
    for(var i = 0; i < my_domains.length; i++) {
        if(my_domains[i].dataset.id != id) {
            my_domains[i].style.display = "none"
        } 
    }

    for(var i = 0; i < my_domain_panels.length; i++) {
        if(my_domain_panels[i].dataset.id == id) {
            my_domain_panels[i].style.display = "block"
        } 
    }

}

var addEmailUserScreen = document.getElementById("add-email-user")
var addEmailUserInput = document.getElementById("add-email-user-input")
var addEmailUserMBSize = document.getElementById("add-email-user-mailbox-size")
var addEmailUserDomain = ""

function showAddEmailUser(domain_name) {
addEmailUserDomain = domain_name;
addEmailUserInput.placeholder = "user@" + domain_name;
//Set Mailbox Options based on gb remaining

var gb_allowed = 1; //free users

if(user_plan == "1") {
    gb_allowed == 100
}

var gb_used = parseInt(mailbox_gb_allocated);
var gb_remaining = gb_allowed - gb_used;

if(gb_remaining <= 0) {
    alert("Please upgrade for more storage.")
    return;
}

addEmailUserMBSize.innerHTML = "";

if(gb_remaining >= 1) {
    var option = document.createElement("option")
    option.value = 1;
    option.innerHTML = "1GB"
    addEmailUserMBSize.appendChild(option)
}

if(gb_remaining >= 5) {
    var option = document.createElement("option")
    option.value = 5;
    option.innerHTML = "5GB"
    addEmailUserMBSize.appendChild(option)
}

if(gb_remaining >= 10) {
    var option = document.createElement("option")
    option.value = 10;
    option.innerHTML = "10GB"
    addEmailUserMBSize.appendChild(option)
}

addEmailUserScreen.style.display = "block"
}

function hideAddEmailUser() {
    addEmailUserScreen.style.display = "none"
}


function KeyPress(e) {
    var evtobj = window.event? event : e
    if (evtobj.keyCode == 90 && evtobj.ctrlKey) //z
        showEmailUserCreatedInstructions("fdsafdsffx", {email:"test@test.com", domain_id:-1}, -1)

    if(evtobj.keyCode == 68 && evtobj.ctrlKey) //d
        showDomainVerificationInstructions("test.com","examplekey")
}

//document.onkeydown = KeyPress; //DEBUG ONLY

function showEmailUserCreatedInstructions(tmp_pass, my_email_user, gb_alloc) {
    hideAddEmailUser();

    //Update New Mailbox GB allocated
    if(gb_alloc != -1) { //Reset Password has no size update
        document.getElementById("total-email-user-storage-allocated").innerHTML = gb_alloc + "GB";
        mailbox_gb_allocated = gb_alloc; //Used when populating add email mailbox size select options
    }

    //Update Users Length
    if(my_email_user.domain_id != -1)
        document.getElementById("my_email_users_length").innerHTML = (parseInt(document.getElementById("my_email_users_length").textContent) + 1)

    //Add Email User Div
    for (var d = 0; d < my_domain_panels.length; d++) {
          if (my_email_user.domain_id == my_domain_panels[d].dataset.id) {
              addEmailUserToPanel(my_email_user, my_domain_panels[d])
          }
      }

    document.getElementById("email-created-username").innerHTML = my_email_user.email
    document.getElementById("email-created-password").innerHTML = tmp_pass
    document.getElementById("email-user-created-instructions").style.display = "block"
}

function closeEmailLoginInstructions() {
    document.getElementById("email-user-created-instructions").style.display = "none"
}

function addEmailUser() {
    var full_email = "";

    if(addEmailUserInput.value.includes("@")) {
        full_email = addEmailUserInput.value.split("@")[0] + "@" + addEmailUserDomain;
    } else {
        full_email = addEmailUserInput.value + "@" + addEmailUserDomain; 
    }


    var formData = {
        full_email: full_email,
        mailbox_size_gb: addEmailUserMBSize.value
    };

    $.ajax({
        type: "POST",
        url: "/add-email-user",
        data: formData,
        dataType: "json",
        encode: true,
    }).done(function (data) {
        if(data.status == "success") {
            showEmailUserCreatedInstructions(data.temp_pass, data.email_user, data.gb_alloc)
        } else {
            alert(data.error)
        }
    });
}

function resetEmailUserPass(full_email) {

    if(confirm("Are you sure you'd like to reset " + full_email + "'s password?")) {
        var formData = {
            full_email: full_email
        };

        $.ajax({
            type: "POST",
            url: "/reset-email-user-password",
            data: formData,
            dataType: "json",
            encode: true,
        }).done(function (data) {
            if(data.status == "success") {
                showEmailUserCreatedInstructions(data.tmp_pass, {email:data.email, domain_id:-1}, -1)
            } else {
                alert(data.error)
            }
        });
    }
}

function deleteEmailUser(full_email) {

    if(confirm("Are you sure you'd like to delete " + full_email)) {

        var formData = {
            full_email: full_email
        };

        $.ajax({
            type: "POST",
            url: "/delete-email-user",
            data: formData,
            dataType: "json",
            encode: true,
        }).done(function (data) {
            if(data.status == "success") {
                alert("Email User Deleted Successfully")

                //Update New Mailbox GB allocated
                document.getElementById("total-email-user-storage-allocated").innerHTML = data.gb_alloc + "GB";
                mailbox_gb_allocated = data.gb_alloc; //Used when populating add email mailbox size select options

                //Update Users Length
                document.getElementById("my_email_users_length").innerHTML = (parseInt(document.getElementById("my_email_users_length").textContent) - 1)

                //Update Storage Used
                total_email_user_storage_used = total_email_user_storage_used - data.storage_cleared;
                teus.innerHTML = formatBytes(total_email_user_storage_used);

                //Delete Email User Div
                var emailUserDivs = document.getElementsByClassName("email-user");
                for(var i = 0; i < emailUserDivs.length; i++) {
                    if(emailUserDivs[i].dataset.email == data.del_email) {
                        emailUserDivs[i].remove()
                        break;
                    }
                }

            } else {
                alert(data.error)
            }
        });
    }
}