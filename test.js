var users = JSON.parse(localStorage.getItem("users"));
var user = JSON.parse(localStorage.getItem("user"));

const uuid = user.id;
const pubnub = new PubNub({
  publishKey: "pub-c-365259b8-ed0b-4549-9805-9c92e68ca219",
  subscribeKey: "sub-c-c8abbac2-8416-11ea-9e86-0adc820ce981",
  uuid: uuid
});




function subscribeNewPubnub(channel){
  pubnub.subscribe({
    channels: [channel],
    withPresence: true
  });
}

function addMessage(sender, message){
  var outerDiv = document.createElement("div");
  var innerDiv = document.createElement("div");
  var msg = document.createElement("p");
  if (sender == uuid){
    outerDiv.className = "rightOuterDiv";
    innerDiv.className = "rightTextName";
    msg.className = "rightText";
  } else {
    outerDiv.className = "leftOuterDiv";
    innerDiv.className = "leftTextName";
    msg.className = "leftText";
  }
  innerDiv.innerHTML = sender;
  msg.innerHTML = message;
  innerDiv.appendChild(msg);
  outerDiv.appendChild(innerDiv);
  document.getElementById("chatPage").appendChild(outerDiv);
  var elem = document.getElementById('chatPage');
  elem.scrollTop = elem.scrollHeight;
}

function pastMessages(channelr){
  pubnub.fetchMessages({
    channels: [channelr],
    count: 100,
  }, function(status, response){
    console.log(response.channels[0]);
    console.log(channelr);
    if(response.channels[Object.keys(response.channels)[0]] != null){
      response.channels[Object.keys(response.channels)[0]].forEach(past => {
        var sender = past.message.sender;
        var message = past.message.content;
        addMessage(sender, message);
      });
    }
  });
}

function publishPubnub(channel, message){
  pubnub.publish({
    channel: channel,
    message: {"sender": uuid, "content":message}
  }, function(status, response) {

    });
}

pubnub.addListener({
  message: function(event) {
    var sender = event.message.sender;
    var message = event.message.content;
    addMessage(sender, message);
    console.log(event.message.content);
  }
});



setTimeout(function(){
  var channel = localStorage.getItem("riskChatChannel");
  subscribeNewPubnub(channel);
  pastMessages(channel);
  document.getElementById("sendChat").addEventListener("click", function(){
    publishPubnub(channel, document.getElementById("chatMessage").value);
    document.getElementById("chatMessage").value = null;
  });

  document.getElementById("backButton").addEventListener("click", function(){
    location.href = "chatOptions.html";
  });
  var height = document.getElementsByTagName("html")[0].offsetHeight;
  window.parent.postMessage(["setHeight", height], "*");
}, 500);
