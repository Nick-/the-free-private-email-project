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

var registerForm = document.getElementById("register-form");
if(registerForm) {
registerForm.addEventListener("submit", function (e) {
    e.preventDefault();
    register(registerForm);
    return false;
});
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
        setCookie("email", data.email, 30)
        setCookie("auth_key", data.auth_key, 30);
        window.location.reload();
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
