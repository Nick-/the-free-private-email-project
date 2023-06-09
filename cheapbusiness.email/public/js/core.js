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
  var formData = {

	          domain: domain
	      };

	     $.ajax({
		             type: "POST",
		             url: "/delete-email-domain",
		             data: formData,
		             dataType: "json",
		             encode: true,
		         }).done(function (data) {
       if(data.status == "success") {
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
        setCookie("email", data.email, 30)
        setCookie("auth_key", data.auth_key, 30);
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

function showPP() {
    document.getElementById("pp").style.display = "block";
}

function showTOS() {
    document.getElementById("tos").style.display = "block";
}

function closePP() {
    document.getElementById("pp").style.display = "none";
}

function closeTOS() {
    document.getElementById("tos").style.display = "none";
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
    var domain = document.getElementById("verify-domain-name").textContent.split(" ")[1];
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
    document.getElementById("verify-domain-name").innerHTML = "For <span style='color:gold'>" + domain + "</span>";
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
            alert("Password Reset Sent!")
            closeForgotPassword()
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

function addEmailUser(domain_id) {
    var full_email = "";
    var password = "";

    var addEmailUserEmail = document.getElementsByClassName("add-email-user-input")

    for(var i = 0; i < addEmailUserEmail.length; i++) {
        if(addEmailUserEmail[i].dataset.id == domain_id) {
            if(addEmailUserEmail[i].value.includes("@")) {
                full_email = addEmailUserEmail[i].value.split("@")[0] + "@" + addEmailUserEmail[i].dataset.domain
            } else {
                full_email = addEmailUserEmail[i].value + "@" + addEmailUserEmail[i].dataset.domain    
            }
        }
    }

    var formData = {
        full_email: full_email
    };

    $.ajax({
        type: "POST",
        url: "/add-email-user",
        data: formData,
        dataType: "json",
        encode: true,
    }).done(function (data) {
        if(data.status == "success") {
            alert("Success! Your Temporary Password is: " + data.temp_pass)
            window.location.reload();
            //Modify UI without reload
        } else {
            alert(data.error)
        }
    });
}

function changeEmailUserPass(full_email) {
    var formData = {
        full_email: full_email
    };

    $.ajax({
        type: "POST",
        url: "/change-email-user-password",
        data: formData,
        dataType: "json",
        encode: true,
    }).done(function (data) {
        if(data.status == "success") {
            alert("Success! Your Temporary Password is: " + data.temp_pass)
            window.location.reload();
            //Modify UI without reload
        } else {
            alert(data.error)
        }
    });
}

function deleteEmailUser(full_email) {
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
            window.location.reload();
            //Modify UI without reload
        } else {
            alert(data.error)
        }
    });
}