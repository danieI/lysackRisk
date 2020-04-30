
var game;
var awardHorseValues = [4,6,8,10,15,20,25,30,35,40,45,50,55,60]
var awardHorseIndex = 0;
var adjascantCountryPromises = [];
var countryNames = [];
var myTurn = false;
var constPlayer;
var inInputBox = false;
var users = [];
//Game(password, countries, players, awardHorse, turn){
//Country(name, whoOwns, troops, adjascent){
//Player(code, player, cannon, horse, infantry){

document.getElementById("showCards").addEventListener("click", async function(){
  var player;
  game.players.forEach(pl => {
    if (pl.code == constPlayer.code) {
      player = pl;
    }
  });
  addInfo("You " + player.player + " has\n" + player.cards.cannon + " cannon cards\n" + player.cards.horse + " horse cards\n" + player.cards.infantry + " infantry cards");
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
  // pubnub.updateSpace({id:String(game.password), name:"risk",custom:{data:JSON.stringify(game)}});
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

function confirmBox(text){
  return new Promise(async (resolve) => {
    function trueClick(){
      console.log("true Click");
      document.getElementById("inputTrue").removeEventListener("click", trueClick);
      document.getElementById("inputFalse").removeEventListener("click", falseClick);
      el.blur();
      document.getElementById("confirmBox").hidden = true;
      document.getElementById("inputText").innerHTML = "";
      document.getElementById("inputDiv").style.border = "";
      document.getElementById("inputDiv").style.paddingBottom = "10px";
      inInputBox = false;
      resolve(true);
    }
    function falseClick(){
      console.log("falseClick");
      document.getElementById("inputTrue").removeEventListener("click", trueClick);
      document.getElementById("inputFalse").removeEventListener("click", falseClick);
      el.blur();
      document.getElementById("confirmBox").hidden = true;
      document.getElementById("inputText").innerHTML = "";
      document.getElementById("inputDiv").style.border = "";
      document.getElementById("inputDiv").style.paddingBottom = "10px";
      inInputBox = false;
      resolve(false);
    }
    inInputBox = true;
    document.getElementById("confirmBox").hidden = false;
    document.getElementById("inputText").innerHTML = text;
    var el;
    if(text.includes("reinforc") || text.includes("Horses")){
      el = document.getElementById("inputFalse");
    } else {
      el = document.getElementById("inputTrue");
    }
    console.log(el);
    el.focus();
    document.getElementById("inputDiv").style.border = "thin solid " + constPlayer.player;
    document.getElementById("inputDiv").style.paddingBottom = "30px";
    function addLists(){
      document.getElementById("inputTrue").addEventListener("click", trueClick);
      document.getElementById("inputFalse").addEventListener("click", falseClick);
    }
    setTimeout(addLists, 20);
  });
}

function promptBox(text){
  return new Promise(resolve => {
    function submitClick(){
      document.getElementById("inputContentSubmit").removeEventListener("click", submitClick);
      document.getElementById("promptBox").hidden = true;
      document.getElementById("inputText").innerHTML = "";
      document.getElementById("inputContent").blur()
      var content = document.getElementById("inputContent").value;
      document.getElementById("inputContent").value = "";
      document.getElementById("inputDiv").style.border = "";
      inInputBox = false;
      resolve(content);
    }
    function submitEnter(event){
      if(event.code == "Enter"){
        document.removeEventListener("keydown", submitEnter)
        document.getElementById("promptBox").hidden = true;
        document.getElementById("inputText").innerHTML = "";
        document.getElementById("inputContent").blur()
        var content = document.getElementById("inputContent").value;
        document.getElementById("inputContent").value = "";
        document.getElementById("inputDiv").style.border = "";
        inInputBox = false;
        resolve(content);
      }
    }
    inInputBox = true;
    document.getElementById("promptBox").hidden = false;
    document.getElementById("inputText").innerHTML = text;
    document.getElementById("inputDiv").style.border = "thin solid " + constPlayer.player;
    document.getElementById("inputContent").focus();
    document.getElementById("inputContentSubmit").addEventListener("click", submitClick);
    document.addEventListener("keydown", submitEnter)
  });
}

function setUpCountry(country, initial){
  if(!initial){
    if(!document.getElementById(country.name).className.includes(country.whoOwns)){
      addInfo(country.whoOwns + " conquered " + country.name);
    }
    var text = document.getElementById(country.name).innerHTML;
    text = text.substring(text.indexOf(" ") + 1, 200);
    var troops = Number(text.substring(0, text.indexOf(" ")));
    if (troops < country.troops) {
      addInfo(country.whoOwns + " added " + (country.troops - troops) + " troops to " + country.name);
    } else if (troops > country.troops){
      addInfo(country.whoOwns + " removed " + (troops - country.troops) + " troops from " + country.name);
    }
  }
  document.getElementById(country.name).className = country.whoOwns;
  var countryName = country.name;
  var firstLetter = countryName.slice(0,1);
  firstLetter = firstLetter.toUpperCase();
  countryName = firstLetter + countryName.slice(1);
  var playerLetter = country.whoOwns.slice(0,1).toUpperCase();
  document.getElementById(country.name).innerHTML = " " + countryName + " " + country.troops + " " + playerLetter;
}



async function playerTurn(player){
  var turnPlayer = player; //done
  var initialReinforcementsC = [];
  var initialReinforcementsV = [];
  var attackCountryInfo; //done
  var conqueredCountries = [];
  var cashInBool;//done
  var cashInV;
  var cashInReinforcementsC = [];//done
  var cashInReinforcementsV = [];//done
  var freeMoveCountry; //done
  var freeMoveDestination; //done
  var freeMoveV = -3; //done
  var initi = false;
  var lost;
  function turnSummary (){
    var intitReinText = "";
    initialReinforcementsC.forEach((x,i) => {
      intitReinText += " placed " + initialReinforcementsV[i] + " troops in " + x.name;
    });
    var summary = turnPlayer.player.toUpperCase() + intitReinText + ". They attacked";
    var conqueredCountText = "";
    conqueredCountries.forEach(x => {
      conqueredCountText += " " + x.name;
    });
    if(conqueredCountText.length > 1){
      conqueredCountText += " from " + attackCountryInfo.name;
      if(lost){
        conqueredCountText += " and lost or retreated in the battle with " + conqueredCountries[conqueredCountries.length - 1].name + ".";
      } else {
        conqueredCountText += " winning every battle."
      }
    } else {
      conqueredCountText = " nowhere."
    }
    summary += conqueredCountText;
    if(cashInBool){
      var cashText = " They cashed in 3 cards and placed";
      cashInReinforcementsC.forEach((x,i) => {
        cashText += " " + cashInReinforcementsV[i] + " troops in " + x.name;
      });
      summary += cashText + ".";
    }
    if(freeMoveV > 0){
      summary += " They free moved " + freeMoveV + " troops from " + freeMoveCountry.name + " to " + freeMoveDestination.name + ".";
    }
    //alert(summary);
  }
  async function placeReinforcements(reinforcements, countries, attackingCountry, freeMove) {//if attackingCountry == false then in turn start reinforcements
    return new Promise(resolve => {
      if (!attackingCountry) {
        game.countries.forEach( x => {
          if(!countries.includes(x) && x.troops == 0) {
            countries.push(x);
          }
        });
      }
      async function reinforcementClick(){
        if (!inInputBox){
          var country;
          game.countries.forEach(countr => { //define the country to place troops into
            if (countr.name == event.target.id){
              country = countr;
            }
          });
          if(country.troops == 0 && country.whoOwns != player.player){//if 0 troops and enemy owned then change whoOwns
            country.whoOwns = player.player;
            setUpCountry(country, false);
          }
          var done = false;
          var numToPlace = "1000000000000";
          if (freeMove){ //when freeMoving all reinforcements go to the same country
            numToPlace = Number(reinforcements);
          } else {
            while (isNaN(numToPlace) || numToPlace < 0 || numToPlace > reinforcements){
              await promptBox("How many reinforcements would you like to place?\nYou have " + reinforcements + " remaining")
                .then(val => {
                  console.log("FIRSTnnnnnnnnnnnnnnnnn nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn");
                  numToPlace = val
                  numToPlace = Number(Number(numToPlace).toFixed(0));
                });
              console.log("SECONDnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn");
              console.log(numToPlace);
              console.log("inside the reinforcements. previous is the number from prompt box")
            }//get Valid num (maybe change while loop to single if?)
          }

          reinforcements -= numToPlace;
          if(attackingCountry != false){ //if attacking country is anything other than false
            country.troops += numToPlace;
            attackingCountry.troops -= numToPlace
            setUpCountry(country, false);
            setUpCountry(attackingCountry, false);
          } else if (attackingCountry == false){
            country.troops += numToPlace;
            setUpCountry(country, false);
          }
          if (attackingCountry != false){
            if (!freeMove && reinforcements > 0) {
              await confirmBox("Are you done placing reinforcements?")
                .then(response => {
                  done = response;
                  console.log(done);
                  console.log("THIS SHOULD HAPPEN BEFORE")
                });
                console.log("THIS SHOULD HAPPEN AFTER");
            } else {
              done = true;
            }
          }
          if (reinforcements == 0){
            done = true;
          }
          if (freeMove){
            freeMoveCountry = attackingCountry;
            freeMoveDestination = country;
            freeMoveV = numToPlace;
          }//turn info variables
          if(initi){
            initialReinforcementsC.push(country);
            initialReinforcementsV.push(numToPlace);
          } else if(attackingCountry == false) {
            cashInBool = true;
            cashInReinforcementsC.push(country);
            cashInReinforcementsV.push(numToPlace)
          }//turn info

          if (done){
            initi = false;
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
    addInstructions("Choose countries to place reinforcements in");
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
      addInstructions("Choose a country to attack from");
      function attackCountryChosen() {
        var country = "esc";
        game.countries.forEach(countr => {
          if (countr.name == event.target.id){
            game.countries.forEach(x => {
              if(countr.adjascent.includes(x.name) && x.whoOwns != player.player){
                country = countr;
                attackCountryInfo = country;
              }
            });
          }
        });
        if(country == "esc"){
          addInstructions("Invalid country, make sure you choose a\ncountry with hostile countries adjascant to it")
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



  async function attack(country){ //make this a popup html page
    var adjascants = [];
    lost = false;
    var conquered = [country];

    game.countries.forEach(countr => {
      if (country.adjascent.includes(countr.name) && countr.whoOwns != player.player) {
        adjascants.push(countr);
      }
    });
    addInstructions("Choose a country to attack adjascent to " + country.name);
    async function nextTurn(){
      async function continueTurn(){
        async function freeMove(){
          return new Promise(async (resolve) => {
            var numToRemove =1000000;
            async function choosenDestination(){
              if(!inInputBox){
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
                  numToRemove = await promptBox("How many troops would you like to remove?\nYou have " + selectedC.troops + " in country " + selectedC.name);
                  numToRemove = Number(Number(numToRemove).toFixed(0));
                }
                addInstructions("Select country to place " + numToRemove + " troops into");
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
                function wrap(){
                  resolve();
                }
                await placeReinforcements(numToRemove, selectedCA, selectedC, true).then(() => wrap());
              }
            }
            var tempBool = false;
            await confirmBox(player.player + " would you like to free move?")
              .then(response => tempBool = response);
            if(tempBool){
              addInstructions("Select a country to move troops from");
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
            turnSummary();
            return turnListener()
          })
          .then((testBlah) => playerTurn(game.players[game.turn % game.players.length]));;

      }
      var tempBool = false;
      await confirmBox("Would you like to cash in any cards " + player.player + "?\n You have:\n" + player.cards.infantry + " Infantry\n" + player.cards.horse + " Horses\n" + player.cards.cannon + " Cannons")
        .then(response => tempBool = response);
      if (tempBool) {
        spendCards()
          .then(async (selection) => {
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
              cashInV = reinforcements; //turninfo
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
              addInstructions("Place Reinforcements");
              await placeReinforcements(reinforcements, playerCountries, false, false).then(() => {
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
              cashInV = reinforcements;//turn info
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
              addInstructions("Place Reinforcements");
              await placeReinforcements(reinforcements, playerCountries, false, false).then(() => {
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

    async function startAttack(){

      cssEffect(adjascants, player, true);

      adjascants.forEach(countr => {
        adjascantCountryPromises.push(new Promise((resolve, reject) => {

          async function attackCountry(){
            if(!inInputBox){
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
                country.troops -= defenseWins;
                defender.troops -= attackWins;
                setUpCountry(country, false);
                setUpCountry(defender, false);
                addInfo("Attacker rolled " + attack + "\nDefense rolled " + defense + "\nAttacker wins " + attackWins + " times\nDefense wins " + defenseWins + " times");
                return [attackWins, defenseWins];
              }

              async function attackDone (attackTroops, defenseTroops) {
                if (defenseTroops <= 0 && attackTroops > 0){
                  addInfo("Attacker Wins!");
                  conquered.push(defender);
                  defender.whoOwns = country.whoOwns;
                  country.troops = attackTroops;
                  defender.troops = 0;
                  setUpCountry(country, false);
                  setUpCountry(defender, false);
                  newCard();
                  var attackNextCountry = "esc";
                  for (var i = 0; i < country.adjascent.length; i++){
                    var name = country.adjascent[i];
                    if (document.getElementById(name).className != player.player && attackNextCountry == "esc"){
                      await confirmBox("Would you like to attack another country adjascent to " + country.name)
                        .then(response => attackNextCountry = response);
                        console.log(attackNextCountry + " " + i);
                    }
                  }
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
                  addInfo("Defender Wins!");
                  lost = true;
                  country.whoOwns = defender.whoOwns;
                  country.troops = 0;
                  defender.troops = defenseTroops;
                  setUpCountry(country, false);
                  setUpCountry(defender, false);
                  adjascants.forEach(x => {
                    if (!conquered.includes(x)){
                      document.getElementById(x.name).outerHTML = document.getElementById(x.name).outerHTML;
                    }
                  });
                  return reject();
                } else {
                  country.troops = 0;
                  defender.troops = 0;
                  setUpCountry(country, false);
                  setUpCountry(defender, false);
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
                  addInfo("Attacker has " + attackTroops + " troops left \n Defender has " + defenseTroops + " troops left");
                  if (defenseTroops <= 0 || attackTroops <= 0){
                    attackNew = false;
                    attackDone(attackTroops, defenseTroops);
                  } else {
                    await confirmBox("Do you wish to continue attacking?")
                      .then(response => attackNew = response);
                      console.log(attackNew);
                    if (!attackNew) {
                      country.troops = attackTroops;
                      defender.troops = defenseTroops;
                      setUpCountry(country, false);
                      setUpCountry(defender, false);
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
                setUpCountry(defender, false);
                newCard();
                var attackNextCountry = "esc";
                for (var i = 0; i < country.adjascent.length; i++){
                  var name = country.adjascent[i]
                  if (document.getElementById(name).className != player.player && attackNextCountry == "esc"){
                    attackNextCountry =
                    await confirmBox("Would you like to attack another country adjascent to " + country.name)
                      .then(response => attackNextCountry = response);
                  }
                }
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


            } else {
              document.getElementById(event.target.id).addEventListener("click", attackCountry, {once:true});

            }
          }


          document.getElementById(countr.name).addEventListener("click", attackCountry, {once:true});

        }));
      });





      Promise.all(adjascantCountryPromises)
        .then(async function(values){
          cssEffect(adjascants, player, false);
          addInformation("Split up reinforcements among conquered territories");
          console.log(country.troops);
          console.log(conquered.slice(1));
          console.log(country);
          conqueredCountries = conquered.slice(1); //turn info
          await placeReinforcements(country.troops, conquered.slice(1), country, false)
           .then(() => {
             console.log("insideThen");
             nextTurn();
           });
          })
          .catch(async () => {
            console.log("all catch");
            cssEffect(adjascants, player, false);
            adjascantCountryPromises = [];
            if(conquered.length > 1 && lost == false){
              addInstructions("Split up reinforcements among conquered territories");
              console.log(country.troops);
              console.log(conquered.slice(1));
              console.log(country);
              conqueredCountries = conquered.slice(1);//turn info
              await placeReinforcements(country.troops, conquered.slice(1), country, false)
              .then(() => {
                console.log("nextTurn");
                nextTurn();
                });
              } else {
                saveGame();
                nextTurn();
              }
            });
    }

    var tempBool = false;
    await confirmBox("Would you like to attack this turn?")
      .then(r => tempBool = r);
    if (tempBool) {
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
        addInfo("You gained an infantry card " + player.player);
      } else if (rnd < 0.66666666) {
        player.cards.horse += 1;
        addInfo("You gained a horse card" + player.player);
      } else {
        player.cards.cannon += 1;
        addInfo("You gained a cannon card" + player.player)
      }
    }
  }

  function spendCards(){
    return new Promise(resolve => {
      addInstructions("Select cash-in option");
      var form = document.getElementById("myForm");

      function eventListener(event) {
        var radios = [document.getElementById("1ofEach"), document.getElementById("3Infantry"), document.getElementById("3Horse"), document.getElementById("3Cannon"), document.getElementById("esc")];
        radios.forEach(r => {
          if (r.checked == true){
            resolve(r.value);
          }
        });
      }

      document.getElementById("formSubmit").addEventListener("click", eventListener, {once:true});

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
  initi = true;
  placeReinforcements(turnStartReinforcements(), turnStartCountries, false, false)
    .then(() => {
      return chooseAttack(turnStartCountries)
    })
    .then(country => {
      attack(country)
    });
}









async function turnListener(){
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
    addInstructions(winner + " Wins!!");
  }
  var tempPlayers = [];
  game.players.forEach(plr => {
    if (!whoOwnsAll.includes(plr.player)){
      addInfo("Player " + plr.player + " you loose.\nGood luck next time");
    } else {
      tempPlayers.push(plr);
    }
  });

  game.players = tempPlayers;
  var cheated = localStorage.getItem("iCheatedAtRisk");
  if(cheated == "true" && loaded){
    game.turn += 1;
    saveGame();
  }
  if(!loaded){
    saveGame();
    if (game.players[(game.turn - 1) % game.players.length].code == constPlayer.code){
      await pubnub.updateSpace({id:String(game.password), name:"risk",custom:{data:JSON.stringify(game)}});
    }
  }
  loaded = false;


  return new Promise (resolve => {
    async function advanceTurn(){
      console.log(constPlayer.code);
      console.log(game.players);
      if (game.players[game.turn % game.players.length].code == constPlayer.code){
        document.getElementById("turn").removeEventListener("click", advanceTurn);
        myTurn = true;
        document.getElementById("turn").hidden = true;
        document.getElementById("inputDiv").style.border = "";
        document.getElementById("inputDiv").style.paddingBottom = "10";
        resolve(null);
      }
    }
    myTurn = false;
    addInstructions(game.players[game.turn%game.players.length].player + "'s Turn. Click 'Start Turn' to begin");
    if(game.players[game.turn%game.players.length].player == constPlayer.player){
      addInstructions("YOUR Turn. Click 'Start Turn' to begin");
    }
    document.getElementById("turn").addEventListener("click", advanceTurn);
  });
}


var loaded = true;
async function loadGame(){
  document.getElementById("confirmBox").hidden = true;
  document.getElementById("promptBox").hidden = true;
  function start(){
    for (var i = 0; i < game.countries.length; i++){
      setUpCountry(game.countries[i], true);
      countryNames.push(game.countries[i].name);
    }
    document.getElementById(String(game.awardHorse)).className = "circle";
    awardHorseIndex = awardHorseValues.indexOf(game.awardHorse);
    var tempPlayerCodes = [];
    game.players.forEach(x => {
      tempPlayerCodes.push(x.code);
    });
    constPlayer = game.players[tempPlayerCodes.indexOf(user.id)];
    game.players.forEach(p => {
      users.push(p.user);
    });
    localStorage.setItem("users", JSON.stringify({users:users}));
    document.getElementById("gameCode").innerHTML = "Game Code: " + game.password;
    document.getElementById("playerTurn").innerHTML = "Welcome " + user.name + " you are " + constPlayer.player.toUpperCase();
    document.getElementById("instructions").style.border = "thin solid " + constPlayer.player;
    document.getElementById("instructions").style.padding = "3px 3px 3px 3px";
    turnListener()
      .then((testBlah) => playerTurn(game.players[game.turn % game.players.length]));
  }

  var code = localStorage.getItem("riskLoadGameCode");
  pubnub.getSpace({spaceId:code})
    .then(response => {
      game = JSON.parse(response.data.custom.data);
      start();
    })
    .catch((error) => {
      if(localStorage.getItem(String(code)) != null){
        alert("using localStorage")
        game = JSON.parse(localStorage.getItem(String(code)));
        start();
      } else {
        alert("something went wrong");
      }
      console.log(error);
    });

}



window.onLoad = setTimeout(loadGame, 500);

window.addEventListener("beforeunload", function(e){
  if(myTurn){
    localStorage.setItem("iCheatedAtRisk", "true");
  } else {
    localStorage.setItem("iCheatedAtRisk", "false");
  }
  e.preventDefault();
  e.returnValue = "This will skip your turn";
});


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
      if (JSON.parse(event.message.content).password == game.password && event.message.sender != uuid) {
        game = JSON.parse(event.message.content);
        console.log(game);
        game.countries.forEach(x => {
          setUpCountry(x, false);
        });
        localStorage.setItem(game.password, JSON.stringify(game));
        addInstructions(game.players[game.turn%game.players.length].player + "'s Turn. Click 'Start Turn' to begin");
        awardHorseValues.forEach(num => {
          if (Number(num) == Number(game.awardHorse)){
            document.getElementById(String(num)).className = "circle";
          } else {
            document.getElementById(String(num)).className = "";
          }
        });
        awardHorseIndex = awardHorseValues.indexOf(game.awardHorse);
        if(game.players[game.turn%game.players.length].player == constPlayer.player){
          pubnub.updateSpace({id:String(game.password), name:"risk",custom:{data:JSON.stringify(game)}});
          addInstructions("YOUR Turn. Click 'Start Turn' to begin");
          document.getElementById("turn").hidden = false;
          document.getElementById("inputDiv").style.border = "thin solid " + constPlayer.player;
          document.getElementById("inputDiv").style.paddingBottom = "81px";
        }
      }
    }
  });




  const openB = document.getElementById("openChat");
openB.addEventListener("click", function(){
  openB.style.visibility = "hidden";
  console.log("temp");
  var frame = document.createElement("iFrame");
  frame.style.width = "280px";
  frame.src="chatOptions.html";
  frame.className="iFrameClass";
  frame.id="iFrameID";
  document.getElementById("div").appendChild(frame);
  localStorage.setItem("user", JSON.stringify(user));
  window.addEventListener('message', function(e) {
  var eventName = e.data[0];
  var data = e.data[1];
  switch(eventName) {
   case 'setHeight':
   console.log("inside");
   var height = String(data) + "px";
   console.log(height);
   frame.style.height = height;
   break;
   case 'close':
   frame.parentNode.removeChild(frame);
   openB.style.visibility = "visible";
   break;
   }
   // Make the DIV element draggable:
   dragElement(document.getElementById("iFrameID"));

   function dragElement(elmnt) {
     var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
     if (document.getElementById(elmnt.id)) {
       // if present, the header is where you move the DIV from:
       document.getElementById(elmnt.id).onmousedown = dragMouseDown;
     } else {
       // otherwise, move the DIV from anywhere inside the DIV:
       elmnt.onmousedown = dragMouseDown;
     }

     function dragMouseDown(e) {
       e = e || window.event;
       e.preventDefault();
       // get the mouse cursor position at startup:
       pos3 = e.clientX;
       pos4 = e.clientY;
       document.onmouseup = closeDragElement;
       // call a function whenever the cursor moves:
       document.onmousemove = elementDrag;
     }

     function elementDrag(e) {
       e = e || window.event;
       e.preventDefault();
       // calculate the new cursor position:
       pos1 = pos3 - e.clientX;
       pos2 = pos4 - e.clientY;
       pos3 = e.clientX;
       pos4 = e.clientY;
       // set the element's new position:
       elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
       elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
     }

     function closeDragElement() {
       // stop moving when mouse button is released:
       document.onmouseup = null;
       document.onmousemove = null;
     }
   }
 }, false);
});
