console.log("Loaded Application JS");

function getCookie(cookie_name) {
    var search_cookie = cookie_name + "="
    if (document.cookie.length > 0) {
        var start_position = document.cookie.indexOf(search_cookie)
        if (start_position != -1) {
            start_position += search_cookie.length
            var end_position = document.cookie.indexOf(";", start_position)
            if (end_position == -1)
                end_position = document.cookie.length
            return (decodeURIComponent(document.cookie.substring(start_position, end_position)))
        }
    }
}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function logout() {
    document.cookie.split(";").forEach(function(c) { document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); });
    window.location.reload();
}

var packetProtocol = 'ws://localhost:8093';
if (window.location.protocol === 'https:') {
    packetProtocol = 'wss://app.com/secure';
}

var webServer = new WebSocket(packetProtocol);

function send(message) {
    webServer.send(JSON.stringify(message));
}

webServer.onopen = function () {
    send({
        type: 'auth-ws',
        email: email,
        auth_key: auth_key
    });
};

webServer.onmessage = function (message) {
    try {
        var data = JSON.parse(message.data);
        switch (data.type) {
            case "login-success":
                if(data.set_cookie) {
                    setCookie("email", data.email, 365);
                    setCookie("auth_key", data.auth_key, 365);
                }
                window.location.reload();
                break;
            case "load":
                    loadGame(data.user_data, data.players, data.npcs)
                break;
            case "fullscreen-dialog-message":
                showDialog(data.message)
            break;
            case "fullscreen-dialog-options":
                showOptions(data.prompt, data.options)
            break;
            case "prompt-input":
                promptInput(data.prompt)
            break;
            case "close-interface":
                closeFullscreenInterface();
                break;
                case "username-exists":
                alert("That username already exists!")
                break;
            case "m":
                if(data.user_id == myPID) {
                    //hero.x = data.x * 16;
                    //hero.y = data.y * 16;

                    if(myMovementTween == null) {

                    
                    myMovementTween = gameRef.tweens.add({
                        targets: hero,
                        x: data.x * 16,
                        y: data.y * 16,
                        duration:250,
                        ease: "Linear",
                        onComplete: function() {
                            myMovementTween = null;
                        }

                    })
                } else if(myMovementTween.isPlaying()) {
                    console.log("Updating")
                    myMovementTween.updateTo("x", data.x * 16, false)
                    myMovementTween.updateTo("y", data.y * 16, false)
                }
                }
            break;
        }
    } catch (error) {
        console.log(error)
    }
}

webServer.onerror = function(err) {
    console.error('Socket encountered error: ', err.message, 'Closing socket');
    webServer.close();
  };

  webServer.onclose = function(e) {

  };

  var fullScreenDialog = document.getElementById("full-screen-dialog");
  var fullScreenDialogText = document.getElementById("full-screen-dialog-text");
  var fullScreenDialogOptions = document.getElementById("full-screen-dialog-options")
  var fullScreenDialogInput = document.getElementById("full-screen-dialog-input")

  var showingOptions = false;
  var showingInput = false;

  function closeFullscreenInterface() {
    fullScreenDialog.style.display = "none"
  }

  if(fullScreenDialog) {
  fullScreenDialog.onclick = function() {
    if(!showingOptions && !showingInput) {
        send({
            type: 'continue-dialog'
        });
        fullScreenDialogText.innerHTML = "";
    }
  }
  }
  function selectOption(option) {
    send({
        type: 'select-option',
        selected_option:option
    });
    showingOptions = false;
    fullScreenDialogOptions.innerHTML = "";
  }

  function submitInput(input) {
    if(input == "") return;

    send({
        type: 'submit-input',
        input:input
    });
    showingInput = false;
    fullScreenDialogInput.innerHTML = "";
  }

  function showDialog(message) {
    fullScreenDialog.style.display = "inherit";
    fullScreenDialogText.innerHTML = "";
    $("#full-screen-dialog-text").typeText(message, {
        typeSpeed: 50,
        lineWait: 1000,
        then: function() {}
      });
  }

  function promptInput(prompt) {
    showingInput = true;
    fullScreenDialog.style.display = "inherit";
    fullScreenDialogText.innerHTML = "";
    $("#full-screen-dialog-text").typeText(prompt, {
        typeSpeed: 50,
        lineWait: 1000,
        then: function() {
                let inputElem = document.createElement("input");
                var submitInputElem = document.createElement("div")
                submitInputElem.innerHTML = "Continue";
                submitInputElem.classList.add("full-screen-dialog-option")
                submitInputElem.onclick = function(e) {
                    submitInput(inputElem.value);
                    e.stopPropagation();
                }
                fullScreenDialogInput.appendChild(inputElem);
                fullScreenDialogInput.appendChild(submitInputElem)
            
        }
      });
  }

  function showOptions(prompt, options) {
    showingOptions = true;
    fullScreenDialog.style.display = "inherit";
    fullScreenDialogText.innerHTML = "";
    var options = options;
    $("#full-screen-dialog-text").typeText(prompt, {
        typeSpeed: 50,
        lineWait: 1000,
        then: function() {
            for(var i = 0; i < options.length; i++) {
                var optionElem = document.createElement("div");
                optionElem.innerHTML = options[i];
                optionElem.classList.add("full-screen-dialog-option")
                let option = options[i];
                optionElem.onclick = function(e) {
                    selectOption(option)
                    e.stopPropagation();
                }
                fullScreenDialogOptions.appendChild(optionElem)
            }
        }
      });
  }

  var usernameDiv = document.getElementById("username")
  var goldValueDiv = document.getElementById("gold-value")
  var silverValueDiv = document.getElementById("silver-value")
  var healthValueDiv = document.getElementById("health-value")
  var energyValueDiv = document.getElementById("energy-value")


  var currentAction = document.getElementById("current-action-value")
  var currentActionTimeRemaining = document.getElementById("current-action-time-remaining");

  var onlinePlayersHolder = document.getElementById("online-players-holder")

  var myPID = -1;

  function spawnNPC(data) {
    console.log("Spawning", data)
    var newNPC = gameRef.physics.add.sprite(data.x * 16, data.y * 16, 'characters' + data.id, 0);
    newNPC.setOrigin(0,0);
  }

  function loadGame(user_data, players, npcs) {


    console.log("Loading Game:", user_data);
    myPID = user_data.user_id;
    usernameDiv.innerHTML = user_data.username;
    goldValueDiv.innerHTML = +user_data.currencies.gold;
    silverValueDiv.innerHTML = user_data.currencies.silver;

    healthValueDiv.innerHTML = user_data.stats.health + "/" + user_data.stats.max_health;
    energyValueDiv.innerHTML = user_data.stats.energy + "/" + user_data.stats.max_energy;

    currentAction.innerHTML = user_data.current_action;

    myXTile = user_data.position.x;
    myYTile = user_data.position.y;

    //load other players
    for(var i = 0; i < players.length; i++) {
        var onlinePlayerDiv = document.createElement("Div")
        onlinePlayerDiv.innerHTML = players[i].username + "(" + players[i].gold + " Gold) ["+players[i].silver+" Silver]";
        onlinePlayerDiv.classList.add("online-player-div")
        onlinePlayersHolder.appendChild(onlinePlayerDiv)
    }

    this.npcs = npcs;

    game = new Phaser.Game(phconfig);
    
  }

  var npcs;

  var loginButton = document.getElementById("google-login-button");
  var loginStatusMessage = document.getElementById("login-status-message");

  function googleAuth(response) {
    loginButton.style.display = "none";
    loginStatusMessage.innerHTML = "Logging in.."
    console.log(response.credential)
    send({
        type: 'login-with-google',
        credential: response.credential
    });
  }

  //START PHASER

  const phconfig = {
    width:  160,//window.innerWidth,// * window.devicePixelRatio,
    height: 160,//window.innerHeight,// * window.devicePixelRatio,
    antialias: false,
    resolution: window.devicePixelRatio,
    backgroundColor: '#000000',
    type: Phaser.CANVAS,
    parent: 'gameCanvasHolder',
    scene: {
        preload: preload,
        create: create,
        update:update,
        render: render
    },
    /**scale: {
        zoom: 2,
        mode: Phaser.Scale.ENVELOP,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },**/
    physics: {
        default: 'arcade',
        arcade: {
        debug: false,
        gravity: {y:0}
        }
    }
}

window.addEventListener('resize', () => {
    //gameRef.scale.resize(window.innerWidth, window.innerHeight);
});

var cursors;
var gameRef;
var game;
var hero;
var myMovementTween;
var leftDown = false;
var rightDown = false;
var upDown = false;
var downDown = false;
var myXTile = -1;
var myYTile = -1;

function render() {

}

const CHAR_LENGTH = 5;

function preload() {
    console.log("Loading...")
    cursors = this.input.keyboard.createCursorKeys();
    this.time.advancedTiming = true;
    this.load.image('map_tiles', '../img/fantasy-kingdom-map.png');
    this.load.tilemapTiledJSON('world', '../fantasy-kingdom-map-base.json');

    for(var i = 0; i < CHAR_LENGTH; i++) {
        this.load.spritesheet('characters' + i, ('../img/characters/'+i+'.png'), {frameWidth: 16, frameHeight:16});
    }
}
function create() {
    gameRef = this;
    const map = this.make.tilemap({key: 'world'});
    const mapTileset = map.addTilesetImage('fk-16x16_tileset', 'map_tiles');
    
    map.createStaticLayer('Grass', mapTileset);
    var treeLayer = map.createStaticLayer('Trees', mapTileset);
    treeLayer.setCollisionByProperty( {collides: true});

    hero = this.physics.add.sprite(myXTile * 16, myYTile * 16, 'characters0', 0);
    hero.setOrigin(0,0);

    this.physics.add.collider(hero, treeLayer);

    this.cameras.main.startFollow(hero, true);
    this.cameras.main.roundPixels = false;
    //this.cameras.main.zoom = 4;

    for(var i = 0; i < npcs.length; i++) {
        spawnNPC(npcs[i])
    }

    this.anims.create( {
        key: '1',
        frames: this.anims.generateFrameNames('characters0', {start: 0, end: 1}),
        repeat: -1,
        frameRate: 4
    });

    hero.play('1');


    console.log("Loaded")
}

var xDebug = document.getElementById("xPos");
var yDebug = document.getElementById("yPos")
function update() {
  if(!cursors || !hero) return;
    
   // const deltaT = (delta * this.sys.game.loop.actualFps) / 1000
    const speed = 64;// * deltaT
    

    xDebug.innerHTML = Math.round(hero.x / 16);
    yDebug.innerHTML = Math.round(hero.y / 16);

}

window.addEventListener("keydown", onKeyDown, false);
window.addEventListener("keyup", onKeyUp, false);

function onKeyDown(event) {
      if (event.repeat) { return }
  var keyCode = event.keyCode;
  switch (keyCode) {
    case 8: //back
        send({type:'i',inputType: 'b'});
    break;
    case 49: //space
        send({type:'i',inputType: 'a'});
    break;
    case 68: //d
      send({type:'i',inputType: 'kd', dir:"r" });
          rightDown = true;
      break;
    case 83: //s
      send({type:'i',inputType: 'kd', dir:"d" });
          downDown = true;
      break;
    case 65: //a
      send({type:'i',inputType: 'kd', dir:"l" });
          leftDown = true;
      break;
    case 87: //w
      send({type:'i',inputType: 'kd', dir:"u" });
          upDown = true;
      break;
  }
}

function onKeyUp(event) {
    if (event.repeat) { return }
  var keyCode = event.keyCode;
  switch (keyCode) {
  case 68: //d
      send({type:'i',inputType: 'ku', dir:"r" });
          rightDown = false;
      break;
    case 83: //s
      send({type:'i',inputType: 'ku', dir:"d" });
          downDown = false;
      break;
    case 65: //a
      send({type:'i',inputType: 'ku', dir:"l" });
          leftDown = false;
      break;
    case 87: //w
      send({type:'i',inputType: 'ku', dir:"u" });
          upDown = false;
      break;
  }
}

//POLYFILL
(function() {
    var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
      window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    window.requestAnimationFrame = requestAnimationFrame;
  })();