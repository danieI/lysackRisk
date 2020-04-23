//make it able to cash in at start of turn?

var game;
var awardHorseValues = [4,6,8,10,15,20,25,30,35,40,45,50,55,60]
var awardHorseIndex = 0;
var adjascantCountryPromises = [];
var countryNames = [];
var myTurn = false;

//Game(password, countries, players, awardHorse, turn){
//Country(name, whoOwns, troops, adjascent){
//Player(code, player, cannon, horse, infantry){

document.getElementById("showCards").addEventListener("click", () =>{
  var code = Number(Number(prompt("Enter player code")).toFixed(0));
  var player;
  game.players.forEach(pl => {
    if (pl.code == code){
      player = pl;
    }
  });
  alert("Player " + player.player + " has\n" + player.cards.cannon + " cannon cards\n" + player.cards.horse + " horse cards\n" + player.cards.infantry + " infantry cards");
});


function cssEffect(countryList, player, bool){
    countryList.forEach(countr => {
      var element = document.getElementById(countr.name);
      if (bool){
        element.className = "x" + element.className;
      } else {
        if(element.className.includes("x")) {
          element.className = element.className.slice(1);
        } else {
          element.className = element.className;
        }
      }
    });
}


function saveGame(){
  localStorage.setItem(game.password, JSON.stringify(game));
  pubnub.publish({
    channel: "pubnub_onboarding_channel",
    message: {"sender": uuid, "content":JSON.stringify(game)}
  }, function(status, response) {
      //handle error
  });
}

function setUpCountry(country){
  document.getElementById(country.name).className = country.whoOwns;
  var countryName = country.name;
  var firstLetter = countryName.slice(0,1);
  firstLetter = firstLetter.toUpperCase();
  countryName = firstLetter + countryName.slice(1);
  var playerLetter = country.whoOwns.slice(0,1).toUpperCase();
  document.getElementById(country.name).innerHTML = " " + countryName + " " + country.troops + " " + playerLetter;
}



function playerTurn(player){

  function placeReinforcements(reinforcements, countries, attackingCountry, freeMove) {//if attackingCountry == false then in turn start reinforcements
    return new Promise(resolve => {
      if (!attackingCountry) {
        game.countries.forEach( x => {
          if(!countries.includes(x) && x.troops == 0) {
            countries.push(x);
          }
        });
      }
      function reinforcementClick(){
        var country;
        game.countries.forEach(countr => {
          if (countr.name == event.target.id){
            country = countr;
          }
        });
        if(country.troops == 0 && country.whoOwns != player.player){
          country.whoOwns = player.player;
          setUpCountry(country);
        }
        var done = false;
        var numToPlace = "o";
        if (freeMove){
          numToPlace = Number(reinforcements);
        } else {
          while (isNaN(numToPlace) || numToPlace < 0 || numToPlace > reinforcements){
            numToPlace = Number(Number(prompt("How many reinforcements would you like to place?\nYou have " + reinforcements + " remaining")).toFixed(0));
          }
        }

        reinforcements -= numToPlace;
        if(attackingCountry != false){
          country.troops += numToPlace;
          attackingCountry.troops -= numToPlace
          setUpCountry(country);
          setUpCountry(attackingCountry);
        } else if (!attackingCountry){
          country.troops += numToPlace;
          setUpCountry(country);
        }
        if (reinforcements == 0 || attackingCountry != false){
          if (freeMove) {
            done = true;
          } else {
            done = confirm("Are you done placing reinforcements?");
          }
        }
        if (done){
          countries.forEach(countr => {
            document.getElementById(countr.name).removeEventListener("click", reinforcementClick);
          });
          if (attackingCountry != false){
            cssEffect(countries, player, false);
          }
          saveGame();
          resolve();
        }
      }

      if (attackingCountry != false){
        cssEffect(countries, player, true);
      }

      countries.forEach(country => {
        document.getElementById(country.name).addEventListener("click", reinforcementClick);
      });
    });
  }

  function turnStartReinforcements(){
    alert("Choose countries to place reinforcements in");
    var reinforcements = 0;
    game.countries.forEach((x) => {
      if (x.whoOwns == player.player){
        reinforcements += 1;
      }
    });
    reinforcements = Number((reinforcements / 3).toFixed(0));
    if (reinforcements < 3){
      reinforcements = 3;
    }

    var continents = [game.countries.slice(30), game.countries.slice(0,9), game.countries.slice(19,26), game.countries.slice(9,13), game.countries.slice(13,19), game.countries.slice(26,30)]
    var continentValues = [7,5,5,3,3,2];
    continents.forEach((continent, index) => {
      var i = 0;
      continent.forEach(countr => {
        if (countr.whoOwns == player.player){
          i += 1;
        }
      });
      if (i == continent.length) {
        reinforcements += continentValues[index];
      }
    });

    return reinforcements;
  }


  function chooseAttack(countries){
    return new Promise(resolve => {
      alert("choose a country to attack from");
      function attackCountryChosen() {
        var country = "esc";
        game.countries.forEach(countr => {
          if (countr.name == event.target.id){
            game.countries.forEach(x => {
              if(countr.adjascent.includes(x.name) && x.whoOwns != player.player){
                country = countr;
              }
            });
          }
        });
        if(country == "esc"){
          alert("Invalid country, make sure you choose a\ncountry with hostile countries adjascant to it")
        } else {
          countries.forEach(x => {
            document.getElementById(x.name).removeEventListener("click", attackCountryChosen);
          });
          resolve(country);
        }

      }
      countries.forEach(country => {
        document.getElementById(country.name).addEventListener("click", attackCountryChosen)
      });
    });
  }



  function attack(country){ //make this a popup html page
    var adjascants = [];
    var lost = false;
    var conquered = [country];

    game.countries.forEach(countr => {
      if (country.adjascent.includes(countr.name) && countr.whoOwns != player.player) {
        adjascants.push(countr);
      }
    });

    function nextTurn(){
      function continueTurn(){
        function freeMove(){
          return new Promise(resolve => {
            var numToRemove =1000000;
            function choosenDestination(){
              var selectedC;
              game.countries.forEach(countr => {
                if (countr.name == event.target.id){
                  selectedC = countr;
                }
              });
              var selectedCA = [];
              countryNames.forEach((name, index) => {
                if (selectedC.adjascent.includes(name) && game.countries[index].whoOwns == player.player){
                  selectedCA.push(game.countries[index]);
                }
              });
              while(isNaN(numToRemove) || numToRemove < 0 || numToRemove >= selectedC.troops){
                numToRemove = Number(Number(prompt("How many troops would you like to remove?\nYou have " + selectedC.troops + " in country " + selectedC.name)).toFixed(0));
              }
              alert("Select country to place " + numToRemove + " troops into");
              troopsFrom = true;
              game.countries.forEach(x => {
                if(x.whoOwns == player.player){
                  var nextToFriendly;
                  x.adjascent.forEach(name => {
                    if(document.getElementById(name).className == player.player){
                      nextToFriendly = true;
                    }
                  });
                  if (nextToFriendly) {
                    document.getElementById(x.name).removeEventListener("click", choosenDestination);
                  }
                }
              });
              placeReinforcements(numToRemove, selectedCA, selectedC, true).then(() => resolve());
            }
            if(confirm(player.player + " would you like to free move?")){
              alert("Select a country to move troops from");
              var tempCountries = [];
              game.countries.forEach(x => {
                if(x.whoOwns == player.player){
                  var nextToFriendly;
                  x.adjascent.forEach(name => {
                    if(document.getElementById(name).className == player.player){
                      nextToFriendly = true;
                    }
                  });
                  if (nextToFriendly) {
                    document.getElementById(x.name).addEventListener("click", choosenDestination);
                  }
                }
              });
            } else {
              resolve();
            }
          });
        }
        freeMove()
          .then(()=>{
            game.turn += 1;
            return turnListener()
          })
          .then((testBlah) => playerTurn(game.players[game.turn % game.players.length]));;

      }

      if (confirm("Would you like to cash in any cards " + player.player + "?\n You have:\n" + player.cards.infantry + " Infantry\n" + player.cards.horse + " Horses\n" + player.cards.cannon + " Cannons")) {
        spendCards()
          .then(selection => {
            var can = player.cards.cannon;
            var hor = player.cards.horse;
            var inf = player.cards.infantry;
            var cont;
            if (selection == "3C" && can >= 3){
              cont = true;
            } else if (selection == "3H" && hor >= 3) {
              cont = true;
            } else if (selection == "3I" && inf >= 3){
              cont = true;
            } else if (selection == "1E" && can > 0 && hor > 0 && inf > 0){
              cont = true;
            }
            if (selection.slice(0,1) == "3" && cont){
              var reinforcements = game.awardHorse;
              document.getElementById(String(game.awardHorse)).className = "";
              awardHorseIndex += 1;
              game.awardHorse = awardHorseValues[awardHorseIndex % awardHorseValues.length];
              document.getElementById(String(game.awardHorse)).className = "circle";
              var playerCountries = [];
              game.countries.forEach(x => {
                if (x.whoOwns == player.player){
                  playerCountries.push(x);
                }
              });
              alert("Place Reinforcements");
              placeReinforcements(reinforcements, playerCountries, false).then(useless => {
                if (selection.slice(1) == "I"){
                  player.cards.infantry -= 3;
                } else if (selection.slice(1) == "H") {
                  player.cards.horse -= 3;
                } else if (selection.slice(1) == "C") {
                  player.cards.cannon -= 3;
                }
                return continueTurn();
              });


            } else if (selection.slice(0,1) == "1" && cont) {
              var reinforcements = game.awardHorse;
              document.getElementById(String(game.awardHorse)).className = "";
              awardHorseIndex += 1;
              game.awardHorse = awardHorseValues[awardHorseIndex % awardHorseValues.length];
              document.getElementById(String(game.awardHorse)).className = "circle";
              var playerCountries = [];
              game.countries.forEach(x => {
                if (x.whoOwns == player.player){
                  playerCountries.push(x);
                }
              });
              alert("Place Reinforcements");
              placeReinforcements(reinforcements, playerCountries, false).then(useless => {
                player.cards.infantry -=1;
                player.cards.horse -= 1;
                player.cards.cannon -= 1;
                return continueTurn();
              });
            } else {
              return continueTurn();
            }
          });
        } else {
          return continueTurn();
        }
    }

    function startAttack(){

      cssEffect(adjascants, player, true);

      adjascants.forEach(countr => {
        adjascantCountryPromises.push(new Promise((resolve, reject) => {

          function attackCountry(){
            var defender;
            game.countries.forEach(countr => {
              if (countr.name == event.target.id){
                defender = countr;
              }
            });

            function roll (die) {
              var dieReal = die.forEach((value, i) => {
                var rnd = -1;
                while (rnd < 1 || rnd > 6){
                  rnd = Number((Math.random() * 10).toFixed(0));
                }
                die[i] = rnd;
              });
              return die;
            }

            function checkValues (attack, defense){
              var attackWins = 0;
              var defenseWins = 0;
              var tempAttack = attack.slice(-1 * defense.length);
              defense.forEach((defenseValue, i) => {
                if (defenseValue >= tempAttack[i]){
                  defenseWins += 1;
                } else {
                  attackWins += 1;
                }
              });

              setUpCountry(country);
              setUpCountry(defender);
              alert("Attacker rolled " + attack + "\nDefense rolled " + defense + "\nAttacker wins " + attackWins + " times\nDefense wins " + defenseWins + " times");
              return [attackWins, defenseWins];
            }

            function attackDone (attackTroops, defenseTroops) {
              if (defenseTroops <= 0 && attackTroops > 0){
                alert("attacker Wins!");
                conquered.push(defender);
                defender.whoOwns = country.whoOwns;
                country.troops = attackTroops;
                defender.troops = 0;
                setUpCountry(country);
                setUpCountry(defender);
                newCard();
                var attackNextCountry = "esc";
                country.adjascent.forEach(name =>{
                  if (document.getElementById(name).className != player.player && attackNextCountry == "esc"){
                    attackNextCountry = confirm("Would you like to attack another country adjascent to " + country.name);
                  }
                });
                if (attackNextCountry) {
                  return resolve();
                } else {
                  adjascants.forEach(x => {
                    if (!conquered.includes(x)){
                      document.getElementById(x.name).outerHTML = document.getElementById(x.name).outerHTML;
                    }
                  });
                  return reject();
                }
              } else if (attackTroops <= 0 && defenseTroops > 0){
                alert("Defender Wins!");
                lost = true;
                if (confirm("Player " + defender.whoOwns + " do you wish to take the enemy territory?")){
                  country.whoOwns = defender.whoOwns;
                  var newTroops = 0;
                  var troopsToMove = 10000000000;
                  while (troopsToMove > defenseTroops || troopsToMove < 0){
                    troopsToMove = Number(Number(prompt("How may troops would you like \n to move into new territory?\nYou have " + defenseTroops + " left")).toFixed(0));
                  }
                  country.troops = troopsToMove;
                  defender.troops = (defenseTroops - troopsToMove);
                } else {
                  country.troops = 0;
                  defender.troops = defenseTroops;
                }
                setUpCountry(country);
                setUpCountry(defender);
                adjascants.forEach(x => {
                  if (!conquered.includes(x)){
                    document.getElementById(x.name).outerHTML = document.getElementById(x.name).outerHTML;
                  }
                });
                return reject();
              } else {
                country.troops = 0;
                defender.troops = 0;
                setUpCountry(country);
                setUpCountry(defender);
                lost = true;
                adjascants.forEach(x => {
                  if (!conquered.includes(x)){
                    document.getElementById(x.name).outerHTML = document.getElementById(x.name).outerHTML;
                  }
                });
                return reject();
              }
            }


            if(defender.troops != 0){
              var attackTroops = country.troops;
              var defenseTroops = defender.troops;
              var attackDie = [0,0,0];
              var defenseDie = [0,0];
              var attackNew = true;
              while (attackNew == true) {
                if(attackTroops == 2){
                  attackDie = [0,0];
                } else if (attackTroops == 1){
                  attackDie = [0];
                }
                if (defenseTroops == 1){
                  defenseDie = [0];
                }
                attackDie = roll(attackDie).sort((a,b) => a-b);
                defenseDie = roll(defenseDie).sort((a,b) => a-b);
                var aAndD = checkValues(attackDie, defenseDie);
                attackTroops -= aAndD[1];
                defenseTroops -= aAndD[0];
                alert("Attacker has " + attackTroops + " troops left \n Defender has " + defenseTroops + " troops left");
                if (defenseTroops <= 0 || attackTroops <= 0){
                  attackNew = false;
                  attackDone(attackTroops, defenseTroops);
                } else {
                  attackNew = confirm("Do you wish to continue attacking?");
                  if (!attackNew) {
                    country.troops = attackTroops;
                    defender.troops = defenseTroops;
                    setUpCountry(country);
                    setUpCountry(defender);
                    adjascants.forEach(x => {
                      if (!conquered.includes(x)){
                        document.getElementById(x.name).outerHTML = document.getElementById(x.name).outerHTML;
                      }
                    });
                    reject();
                  }
                }
              }



            } else {
              defender.whoOwns = player.player;
              conquered.push(defender);
              setUpCountry(defender);
              newCard();
              var attackNextCountry = "esc";
              country.adjascent.forEach(name =>{
                if (document.getElementById(name).className != player.player && attackNextCountry == "esc"){
                  attackNextCountry = confirm("Would you like to attack another country adjascent to " + country.name);
                }
              });
              if(attackNextCountry) {
                resolve();
              } else {
                adjascants.forEach(x => {
                  if (!conquered.includes(x)){
                    document.getElementById(x.name).outerHTML = document.getElementById(x.name).outerHTML;
                  }
                });
                reject();
              }

            }


          }


          document.getElementById(countr.name).addEventListener("click", attackCountry, {once:true});

        }));
      });





      Promise.all(adjascantCountryPromises)
        .then(function(values){
          cssEffect(adjascants, player, false);
          alert("Split up reinforcements among conquered territories");
          placeReinforcements(country.troops, conquered.slice(1), country)
           .then(() => {
             nextTurn();
            })
          })
          .catch(() => {
            cssEffect(adjascants, player, false);
            adjascantCountryPromises = [];
            if(conquered.length > 1 && lost == false){
              alert("Split up reinforcements among conquered territories");
              placeReinforcements(country.troops, conquered.slice(1), country)
              .then(() => {
                nextTurn();
                });
              } else {
                saveGame();
                nextTurn();
              }
            });
    }


    if (confirm("Would you like to attack this turn?")) {
      startAttack();
    } else {
      cssEffect(adjascants, player, false);
      nextTurn();
    }



  }



  function newCard(){
    saveGame();
    if ((player.cards.infantry + player.cards.horse + player.cards.cannon) < 7) {
      var rnd = Math.random();
      if (rnd < 0.3333333) {
        player.cards.infantry += 1;
        alert("You gained an infantry card " + player.player);
      } else if (rnd < 0.66666666) {
        player.cards.horse += 1;
        alert("You gained a horse card" + player.player);
      } else {
        player.cards.cannon += 1;
        alert("You gained a cannon card" + player.player)
      }
    }
  }

  function spendCards(){
    return new Promise(resolve => {
      alert("Select cash-in option");
      var form = document.getElementById("myForm");

      function eventListener(event) {
        var data = new FormData(form);
        var output = "";
        for (const entry of data) {
          resolve(entry[1]);
        };
        event.preventDefault();
      }

      form.addEventListener("submit", eventListener, {once:true});

    });
  }


  /*
    TURN MECHANICS
    1) place reinforcements
    2) pick country to attack from
    3) proceed with attack (happens in the 'country()' function??)
    4) spend cards
    5)end turn
    CONSIDERATIONS
    1) turn needs to begin with a confirmation (player code?)
    2)'country()' function needs to know if in reinforcement phase or attack phase
      -count that shows what phase of turn
      -if/elseif statement in 'country()'
  */
  var turnStartCountries = [];
  game.countries.forEach(x => {
    if (x.whoOwns == player.player){
      turnStartCountries.push(x);
    }
  });
  placeReinforcements(turnStartReinforcements(), turnStartCountries, false)
    .then(() => {
      return chooseAttack(turnStartCountries)
    })
    .then(country => {
      attack(country)
    });
}









function turnListener(){
  var whoOwnsAll = [];
  game.countries.forEach(countr => {
    whoOwnsAll.push(countr.whoOwns);
  });
  var winner;
  whoOwnsAll.forEach((player, i) => {
    if (i == 0){
      winner = player;
    } else {
      if(winner != player) {
        winner = false;
      }
    }
  });

  if (winner != false){
    //load winner page
    alert(winner + " Wins!!");
  }
  var tempPlayers = [];
  game.players.forEach(plr => {
    if (!whoOwnsAll.includes(plr.player)){
      alert("Player " + plr.player + " you loose.\nGood luck next time");
    } else {
      tempPlayers.push(plr);
    }
  });

  game.players = tempPlayers;
  saveGame();


  return new Promise (resolve => {
    function advanceTurn(){
      if (game.players[game.turn % game.players.length].code == Number(prompt("Enter player code player " + game.players[game.turn % game.players.length].player))){
        document.getElementById("turn").removeEventListener("click", advanceTurn);
        myTurn = true;
        resolve(null);
      }
    }
    myTurn = false;
    document.getElementById("turn").addEventListener("click", advanceTurn);
  });
}



function loadGame(){

  function start(){
    for (var i = 0; i < game.countries.length; i++){
      setUpCountry(game.countries[i]);
      countryNames.push(game.countries[i].name);
    }
    document.getElementById(String(game.awardHorse)).className = "circle";
    awardHorseIndex = awardHorseValues.indexOf(game.awardHorse);
    turnListener()
      .then((testBlah) => playerTurn(game.players[game.turn % game.players.length]));
  }

  var code = "0";
  while(!(code.length == 4) || (isNaN(code))){
    code = prompt("enter four digit game code");
  }
  pubnub.getSpace({spaceId:code})
    .then(response => {
      game = JSON.parse(response.data.custom.data);
      start();
    })
    .catch((error) => {
      if (localStorage.getItem(code) != null) {
        game = JSON.parse(localStorage.getItem(code));
        start();
      } else {
        alert("Invalid code\nIf the code is correct the storage may have run out. Contact other game members");
      }
    });

}



window.onLoad = setTimeout(loadGame, 500);
window.addEventListener("beforeunload", function(e){
  if(myTurn){
    game.turn += 1;
  }
  pubnub.updateSpace({id:game.password, name:"risk",custom:{data:JSON.stringify(game)}});
  e.preventDefault();
  e.returnValue = "";
});

  const uuid = PubNub.generateUUID();
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
      if (JSON.parse(event.message.content).password == game.password && event.message.sender != uuid) {
        game = JSON.parse(event.message.content);
        game.countries.forEach(x => {
          setUpCountry(x);
        });
        localStorage.setItem(game.password, JSON.stringify(game));
      }
    }
  });
