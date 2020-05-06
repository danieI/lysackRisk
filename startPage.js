window.onload = function(){
  var user = JSON.parse(localStorage.getItem("pubnubUser"));
  console.log(user);
  uuid = user.id;
  pubnub = new PubNub({
    publishKey: "pub-c-365259b8-ed0b-4549-9805-9c92e68ca219",
    subscribeKey: "sub-c-c8abbac2-8416-11ea-9e86-0adc820ce981",
    uuid: uuid
  });


  document.getElementById("newGame").addEventListener("click", () => {
    function createGameSpace(){
      pubnub.createSpace({id: code, name:"risk", custom:{data:JSON.stringify({potentialPlayers:["yellow", "green", "blue", "red","white","purple"]})}, include:{customFields: true}})
        .then(response => {
          localStorage.setItem("riskGameCode", String(code));
          localStorage.setItem("amITheFirstPlayer", "yes");
          window.open("newGame.html");
        });
    }
    var code = document.getElementById("newInput").value;
    if(!isNaN(code) && String(code).length == 4 && Number(code)%1 == 0){
      console.log("valid code");
      var channelString = "risk." + String(code);
      console.log(channelString);
      pubnub.subscribe({
        channels: [channelString],
        withPresence: true
      });
      console.log("getSpace" + " " + code);
      pubnub.getSpace({spaceId:String(code)})
        .then(response => {
          document.getElementById("info").innerHTML = "That game code already exists. Choose another";
        })
        .catch(response => {
          console.log(response);
          createGameSpace();
        });
      }
  });


  document.getElementById("joinGame").addEventListener("click", function(){
    var code = document.getElementById("joinInput").value;
    if(!isNaN(code) && String(code).length == 4 && Number(code)%1 == 0){
      pubnub.subscribe({
        channels: ['risk.' + String(code)],
        withPresence: true
      });
      pubnub.getSpace({spaceId:code})
        .then(response => {
          localStorage.setItem("riskGameCode", code);
          window.open("newGame.html");
        })
        .catch(response => {
          document.getElementById("info").innerHTML = "Game code does not exist";
        });
      }
  });


  document.getElementById("loadGame").addEventListener("click", function(){
    var code = document.getElementById("loadInput").value;
    if(!isNaN(code) && String(code).length == 4 && Number(code)%1 == 0){
      pubnub.subscribe({
        channels: ['risk.' + String(code)],
        withPresence: true
      });
      pubnub.getSpace({spaceId:code})
        .then(response => {
          localStorage.setItem("riskGameCode", code);
          window.open("loadGame.html");      })
        .catch(response => {
          document.getElementById("info").innerHTML = "Game code does not exist";
        });
    }
  });
}
