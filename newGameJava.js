const password = localStorage.getItem("riskNewGameCode");
var players = [];
var constPlayer;
var potentialPlayers = ["yellow", "green", "blue", "red", "white", "purple"];
var playerNum = 0;
var done = [];
var numTroops = [];
var playerIndex;
var countryList = JSON.parse('[{"name":"alaska","whoOwns":"","troops":0,"adjascent":["alberta","nwt","kamchatka"]},{"name":"nwt","whoOwns":"","troops":0,"adjascent":["alaska","greenland","alberta","ontario"]},{"name":"greenland","whoOwns":"","troops":0,"adjascent":["quebec","ontario","nwt","iceland"]},{"name":"alberta","whoOwns":"","troops":0,"adjascent":["alaska","nwt","ontario","WesternUS"]},{"name":"ontario","whoOwns":"","troops":0,"adjascent":["alberta","nwt","greenland","quebec","EasternUS","WesternUS"]},{"name":"quebec","whoOwns":"","troops":0,"adjascent":["ontario","greenland","EasternUS"]},{"name":"WesternUS","whoOwns":"","troops":0,"adjascent":["alberta","ontario","EasternUS","centralAmerica"]},{"name":"EasternUS","whoOwns":"","troops":0,"adjascent":["WesternUS","ontario","quebec","centralAmerica"]},{"name":"centralAmerica","whoOwns":"","troops":0,"adjascent":["WesternUS","EasternUS","venezuela"]},{"name":"venezuela","whoOwns":"","troops":0,"adjascent":["centralAmerica","peru","brazil"]},{"name":"peru","whoOwns":"","troops":0,"adjascent":["venezuela","brazil","argentina"]},{"name":"brazil","whoOwns":"","troops":0,"adjascent":["northAfrica","argentina","peru","venezuela"]},{"name":"argentina","whoOwns":"","troops":0,"adjascent":["peru","brazil"]},{"name":"madagascar","whoOwns":"","troops":0,"adjascent":["southAfrica","eastAfrica"]},{"name":"southAfrica","whoOwns":"","troops":0,"adjascent":["madagascar","congo","eastAfrica"]},{"name":"congo","whoOwns":"","troops":0,"adjascent":["northAfrica","eastAfrica","southAfrica"]},{"name":"eastAfrica","whoOwns":"","troops":0,"adjascent":["northAfrica","egypt","congo","madagascar","southAfrica"]},{"name":"northAfrica","whoOwns":"","troops":0,"adjascent":["brazil","westernEurope","southernEurope","egypt","eastAfrica","congo"]},{"name":"egypt","whoOwns":"","troops":0,"adjascent":["northAfrica","southernEurope","middleEast","eastAfrica"]},{"name":"westernEurope","whoOwns":"","troops":0,"adjascent":["greatBritian","northernEurope","southernEurope","northAfrica"]},{"name":"southernEurope","whoOwns":"","troops":0,"adjascent":["westernEurope","northernEurope","ukraine","middleEast","egypt","northAfrica"]},{"name":"northernEurope","whoOwns":"","troops":0,"adjascent":["westernEurope","greatBritian","scandinavia","ukraine","southernEurope"]},{"name":"greatBritian","whoOwns":"","troops":0,"adjascent":["iceland","scandinavia","northernEurope","westernEurope"]},{"name":"iceland","whoOwns":"","troops":0,"adjascent":["greenland","scandinavia","greatBritian"]},{"name":"scandinavia","whoOwns":"","troops":0,"adjascent":["iceland","ukraine","northernEurope","greatBritian"]},{"name":"ukraine","whoOwns":"","troops":0,"adjascent":["scandinavia","ural","afghanistan","middleEast","southernEurope","northernEurope"]},{"name":"westernAustralia","whoOwns":"","troops":0,"adjascent":["indonesia","newGuinea","easternAustralia"]},{"name":"easternAustralia","whoOwns":"","troops":0,"adjascent":["westernAustralia","newGuinea"]},{"name":"newGuinea","whoOwns":"","troops":0,"adjascent":["indonesia","easternAustralia","westernAustralia"]},{"name":"indonesia","whoOwns":"","troops":0,"adjascent":["siam","newGuinea","westernAustralia"]},{"name":"siam","whoOwns":"","troops":0,"adjascent":["india","china","indonesia"]},{"name":"india","whoOwns":"","troops":0,"adjascent":["middleEast","afghanistan","china","siam"]},{"name":"middleEast","whoOwns":"","troops":0,"adjascent":["egypt","southernEurope","ukraine","afghanistan","india"]},{"name":"afghanistan","whoOwns":"","troops":0,"adjascent":["ukraine","ural","china","india","middleEast"]},{"name":"china","whoOwns":"","troops":0,"adjascent":["afghanistan","ural","siberia","mongolia","siam","india"]},{"name":"japan","whoOwns":"","troops":0,"adjascent":["mongolia","kamchatka"]},{"name":"mongolia","whoOwns":"","troops":0,"adjascent":["siberia","irkutsk","kamchatka","japan","china"]},{"name":"siberia","whoOwns":"","troops":0,"adjascent":["ural","yakutsk","irkutsk","mongolia","china"]},{"name":"ural","whoOwns":"","troops":0,"adjascent":["ukraine","siberia","china","afghanistan"]},{"name":"irkutsk","whoOwns":"","troops":0,"adjascent":["siberia","yakutsk","kamchatka","mongolia"]},{"name":"yakutsk","whoOwns":"","troops":0,"adjascent":["siberia","kamchatka","irkutsk"]},{"name":"kamchatka","whoOwns":"","troops":0,"adjascent":["yakutsk","alaska","japan","mongolia","irkutsk"]}]');
var countryNames = [];
countryList.forEach(x => {
  countryNames.push(x.name);
});


function Game(password, countries, players, awardHorse, turn){
  this.password = password;
  this.countries = countries;
  this.players = players;
  this.awardHorse = awardHorse;
  this.turn = turn;
}

function Country(name, whoOwns, troops, adjascent){
  this.name = name;
  this.whoOwns = whoOwns;
  this.troops = troops;
  this.adjascent = adjascent;
}

function Player(code, player, cannon, horse, infantry, uuid){
  this.player = player;
  this.cards = {
    cannon,
    horse,
    infantry
  };
  this.code = code;
  this.uuid = uuid;
}

function update(countries, selecting, index){
  pubnub.publish({
    channel: "pubnub_onboarding_channel",
    message: {"sender": uuid, "content":JSON.stringify({countries:countries,done:done[index], numTroops: numTroops[index], selecting:selecting, index:index})}
  }, function(status, response) {
      //handle error
  });
}


function confirmBox(text){
  return new Promise(resolve => {
    function trueClick(){
      document.getElementById("inputTrue").removeEventListener("click", trueClick);
      document.getElementById("inputFalse").removeEventListener("click", falseClick);
      document.getElementById("confirmBox").hidden = true;
      document.getElementById("inputText").innerHTML = "";
      console.log("event Listener closed for check");
      resolve(true);
    }
    function falseClick(){
      document.getElementById("inputTrue").removeEventListener("click", trueClick);
      document.getElementById("inputFalse").removeEventListener("click", falseClick);
      document.getElementById("confirmBox").hidden = true;
      document.getElementById("inputText").innerHTML = "";
      resolve(false);
    }
    document.getElementById("confirmBox").hidden = false;
    document.getElementById("inputText").innerHTML = text;
    document.getElementById("inputTrue").addEventListener("click", trueClick);
    document.getElementById("inputFalse").addEventListener("click", falseClick);
    console.log("eventListener added for confirm");
  });
}

function promptBox(text){
  return new Promise(resolve => {
    console.log("inside promptBox");
    function submitClick(){
      console.log("clisk");
      document.getElementById("inputContentSubmit").removeEventListener("click", submitClick);
      document.getElementById("promptBox").hidden = true;
      document.getElementById("inputText").innerHTML = "";
      var content = document.getElementById("inputContent").value;
      document.getElementById("inputContent").value = "";
      resolve(content);
    }
    function submitEnter(event){
      if(event.code == "Enter"){
        console.log("enter");
        document.removeEventListener("keydown", submitEnter)
        document.getElementById("promptBox").hidden = true;
        document.getElementById("inputText").innerHTML = "";
        var content = document.getElementById("inputContent").value;
        console.log(content);
        document.getElementById("inputContent").value = "";
        resolve(content);
      }
    }
    document.getElementById("promptBox").hidden = false;
    document.getElementById("inputText").innerHTML = text;
    document.getElementById("inputContentSubmit").addEventListener("click", submitClick);
    document.addEventListener("keydown", submitEnter)
  });
}



function addInfo(text){
  var p = document.createElement("p");
  p.className = "info";
  p.style.marginLeft = "10px";
  p.innerHTML = text;
  document.getElementById("info").appendChild(p);
  var elements = document.getElementsByClassName("info");
  if(elements.length > 5){
    elements[0].parentNode.removeChild(elements[0]);
  }
}

function addInstructions(text){
  document.getElementById("instructions").innerHTML = text;
}


function setUpCountry(country){
  var i;
  countryList.forEach((x, index) => {
    if(x.name == country.name){
      i = index;
    }
  });
  if(document.getElementById(country.name).className != country.whoOwns){
    addInfo(country.whoOwns + " chose " + country.name);
  }
  var text = document.getElementById(country.name).innerHTML;
  text = text.substring(text.indexOf(" ") + 1, 200);
  var troops = Number(text.substring(0, text.indexOf(" ")));
  if (troops < country.troops) {
    addInfo(country.whoOwns + " added " + (country.troops - troops) + " troops to " + country.name);
  } else if (troops > country.troops){
    addInfo(country.whoOwns + " removed " + (troops - country.troops) + " troops from " + country.name);
  }
  document.getElementById(country.name).className = country.whoOwns;
  var countryName = country.name;
  var firstLetter = countryName.slice(0,1);
  firstLetter = firstLetter.toUpperCase();
  countryName = firstLetter + countryName.slice(1);
  var playerLetter = country.whoOwns.slice(0,1).toUpperCase();
  document.getElementById(country.name).innerHTML = countryName + " " + country.troops + " " + playerLetter;
  countryList[i] = country;
}




function newGame(){
  console.log("v.v start of new Game");
  document.getElementById("confirmBox").hidden = true;
  document.getElementById("promptBox").hidden = true;
  document.getElementById("gameCode").innerHTML = "Game Code: " + password;
  document.getElementById("playerTurn").innerHTML = "Welcome " + user.name;
  console.log("v start of newGame");
  createPlayers()
    .then(() => {
      var sortByCodesValues = [];
      players.forEach(x => {
        sortByCodesValues.push(x.code);
        if(user.id == x.uuid){
          constlayer = x;
        }
      });
      sortByCodesValues.sort();
      var unsortedPlayers = players;
      var sortedPlayers = [];
      sortByCodesValues.forEach(code => {
        players.forEach(x => {
          if(x.code == code){
            sortedPlayers.push(x);
          }
        });
      });
      players = sortedPlayers;
      return createCountries(players)
    })
    .then(() => {
      return placeReinforcements(players);
    })
    .then(() => {
      let createdGame = new Game(password, countryList, players, 4, 0);
      localStorage.setItem(password, JSON.stringify(createdGame));
      pubnub.createSpace({id:String(createdGame.password),name:"risk",custom:{data:JSON.stringify(createdGame)},include:{customFields: true}})
        .then(response => {
          console.log(response);
          alert("The game code is " + createdGame.password);
          loadGame();
        })
        .catch(response => {
          console.log("error");
          console.log(response);
        });
    });
}



function createPlayers(){          //////////adjust to haveing a const player variable? Disable unauthorized clicks
  return new Promise(async (resolve) => {
    console.log("insideNewPlayers");
    async function getPlayerCode(){
      console.log("get player code");
      var code = "1";
      var playerCodes = [];
      for (var i = 0; i < players.length; i++){
        playerCodes.push(players[i].code);
      }
      console.log(code + " code");
      console.log(!(code.length == 4));
      while(!(code.length == 4) || (isNaN(code)) || playerCodes.includes(Number(code))){
        console.log("inside while");
        code = await promptBox("What do you wish your code to be? \n must be 4 digits");
        console.log(code);
        console.log("code");
      }
      code = Number(code);
      alert("your player code is " + code + " DON'T FORGET IT");
      return code;
    }
    async function getPlayerColor(){
      var playerColor = "";
      while(!(potentialPlayers.includes(playerColor.toLowerCase()))){
        playerColor = await promptBox("Choose a color between \n" + potentialPlayers);
      }
      potentialPlayers.splice(potentialPlayers.indexOf(playerColor), 1);
      playerColor = playerColor.toLowerCase();
      return playerColor;
    }

    var newPlayer = true;
    pubnub.addListener({
      message: function(event){
          if(JSON.parse(event.message.content).data == "doneNewPlayers" && event.message.sender != uuid){
            document.getElementById("addPlayer").removeEventListener("click", createNewPlayer);
            document.getElementById("doneAdding").removeEventListener("click",doneAdding);

            resolve();
          }
      }
    });
    async function createNewPlayer(){
      if (newPlayer == true && potentialPlayers.length != 0){
        var playerCode;
        let playerOne = new Player(await getPlayerCode(), await getPlayerColor(), 0,0,0);
        players.push(playerOne);
        document.getElementById("gameCode").innerHTML = "Game code: " + password;
        addInfo("Player " + players[players.length - 1].player + " has joined the game")
        pubnub.publish({
          channel: "pubnub_onboarding_channel",
          message: {"sender": uuid, "content":JSON.stringify({player:playerOne})}
        }, function(status, response) {
            //handle error
        });

      }
    }

    async function doneAdding(){
      var tempBool = false;
      tempBool = await confirmBox("There are " + players.length + " players in the\ngame right now. Are you done adding players?");
      if (tempBool){
        document.getElementById("addPlayer").removeEventListener("click", createNewPlayer);
        document.getElementById("doneAdding").removeEventListener("click",doneAdding);
        pubnub.publish({
          channel: "pubnub_onboarding_channel",
          message: {"sender": uuid, "content":JSON.stringify({data:"doneNewPlayers"})}
        }, function(status, response) {
            //handle error
        });
        resolve();
      }
    }
    console.log("should create new player");
    createNewPlayer();
    document.getElementById("doneAdding").addEventListener("click",doneAdding);
  });
}



function placeReinforcements(players){
  return new Promise((resolve) => {
    addInstructions("All Players place reinforcements in chosen countries");
    var num = players.length;
    numTroops.length = players.length;
    switch (num) {
      case 2:
        numTroops = numTroops.fill(40);
        break;
      case 3:
        numTroops = numTroops.fill(35);
        break;
      case 4:
        numTroops = numTroops.fill(30);
        break;
      case 5:
        numTroops = numTroops.fill(25);
        break;
      case 6:
        numTroops = numTroops.fill(20);
        break;
    }
    var playerNames = [];
    var playerCodes = [];
    for (var i = 0; i < players.length; i++){
      playerNames.push(players[i].player);
      playerCodes.push(players[i].code);
    }
    var countryNames = [];
    for (var i = 0; i < countryList.length; i++){
      countryNames.push(countryList[i].name);
    }
    var doneCheck = [];
    for (var i = 0; i < players.length; i++){
      done.push(false);
      doneCheck.push(true);
    }
    async function addPlayerClick(){
      var codeCheck = await promptBox("Enter player code");
      codeCheck = Number(codeCheck);
      if (playerNames.indexOf(event.target.className) == playerCodes.indexOf(codeCheck)){
        var player = players[playerNames.indexOf(event.target.className)];
        var index = countryNames.indexOf(event.target.id);
        var troopIndex = playerNames.indexOf(event.target.className);
        var possibleInputs = ["add", "remove"];
        var action = "";
        while (!possibleInputs.includes(action)){
          action = await promptBox("Would you like to add or remove troops?");
          action = action.toLowerCase();
        }
        numToPlace = "blah";
        while (isNaN(numToPlace)) {
          numToPlace = await promptBox("How many troops would you like to " + action + "? \n You have " + numTroops[troopIndex] + " troops left");
        }
        numToPlace = Number(Number(numToPlace).toFixed(0));
        if (action == "add" && numToPlace <= numTroops[troopIndex] && numToPlace >= 0){
          countryList[index].troops += numToPlace;
          numTroops[troopIndex] -= numToPlace;
          setUpCountry(countryList[index]);
          update([countryList[index]], false, troopIndex);
        } else if (action == "remove" && numToPlace <= countryList[index].troops && numToPlace >=0) {
          countryList[index].troops -= numToPlace;
          numTroops[troopIndex] += numToPlace;
          setUpCountry(countryList[index]);
          update([countryList[index]], false, troopIndex);
        } else {
          addInformation("Invalid troop number");
        }
        if (numTroops[troopIndex] == 0){
          done[troopIndex] = await confirmBox("Are you done placing your troops?");
        }
        if (JSON.stringify(done) == JSON.stringify(doneCheck)){
          countryList.forEach(x=> {
            document.getElementById(x.name).removeEventListener("click", addPlayerClick);
          });
          resolve();
        }
      }
    }
    for(var i = 0; i < countryList.length; i++){
      countryList[i] = x;
      document.getElementById(x.name).addEventListener("click", addPlayerClick);
    };
  });
}



function createCountries(players){
  return new Promise((resolve, reject) => {
    var player = players[playerNum % players.length];
    addInstructions(players[playerNum%players.length].player + "'s turn to choose a country");
    var countryNameList = [];
    for (var i = 0; i < countryList.length; i++){
      countryNameList.push(countryList[i].name);
    }

    async function countryClick(){
      if (playerNum < countryList.length){
        player = players[playerNum % players.length];
        var code = await promptBox("Player " + player.player + " enter your code");
        if (code == player.code && event.target.className == ""){
          var ind = countryNameList.indexOf(event.target.id);
          countryList[ind].whoOwns = player.player;
          setUpCountry(countryList[ind]);
          update([countryList[ind]], true, 0);
          playerNum += 1;
          addInstructions(players[playerNum%players.length].player + "'s turn to choose a country");
          player = players[playerNum % players.length];
          if (playerNum == countryList.length){
            countryList.forEach(x => {
              document.getElementById(x.name).removeEventListener("click", countryClick);
            });
            resolve(countryList);
          }
        }
      } else {
        countryList.forEach(x => {
          document.getElementById(x.name).removeEventListener("click", countryClick);
        });
        resolve(countryList);
      }
    }
    countryList.forEach(x => {
      document.getElementById(x.name).addEventListener("click", countryClick);
    });
  });
}





function loadGame(){
  window.open("loadGame.html");
  //setTimeout(window.close(), 500);
}



window.onLoad = setTimeout(newGame, 500);


const user = JSON.parse(localStorage.getItem("pubnubUser"));
const uuid = user.id;
const name = user.name;
const pubnub = new PubNub({
  publishKey: "pub-c-365259b8-ed0b-4549-9805-9c92e68ca219",
  subscribeKey: "sub-c-c8abbac2-8416-11ea-9e86-0adc820ce981",
  uuid: uuid
});

pubnub.subscribe({
  channels: ['pubnub_onboarding_channel'],
  withPresence: true
});

pubnub.addListener({
  message: function(event) {
    if (event.message.sender != uuid && JSON.parse(event.message.content).countries != null) {//JSON.parse(event.message.content).password == game.password ??
      console.log("updateCountries");
      var data = JSON.parse(event.message.content)
      var countries = data.countries;
      countries.forEach(x => {
        countryList[countryNames.indexOf(x.name)] = x;
        setUpCountry(x);
      });
      if(!data.selecting){
        console.log("updateReinforcements")
        done[data.index] = data.done;
        numTroops[data.index] = data.numTroops;
      } else {
        playerNum += 1;
        addInstructions(players[playerNum%players.length].player + "'s turn to choose a country");
      }
    //  localStorage.setItem(game.password, JSON.stringify(game));
  } else if(event.message.sender != uuid && JSON.parse(event.message.content).player != null){
      data = JSON.parse(event.message.content);
      console.log(data.player);
      players.push(data.player);
      potentialPlayers.splice(potentialPlayers.indexOf(data.player.player), 1);
      // document.getElementById("gameCode").innerHTML = "Game code: " + password;
      addInfo("Player " + players[players.length - 1].player + " has joined the game");
    }
  }
});

//make the password display when game loads
