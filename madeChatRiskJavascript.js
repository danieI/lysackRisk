
const uuid = "testuuid"
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

function publishPubnub(channel, message){
  pubnub.publish({
    channel: channel,
    message: {"sender": uuid, "content":message}
  }, function(status, response) {
      console.log(response);
      var div = document.getElementById("infoWindow");
      var p = document.createElement("p");
      p.innerHTML = response;
      div.appendChild(p);
  });
}

pubnub.addListener({
  message: function(event) {
    alert(event.message);
    console.log(event.message);
  }
});

setTimeout(function(){
  document.getElementById("chatChannel").addEventListener("click", function(){
    subscribeNewPubnub(document.getElementById("newChatChannel").value);
  });
  document.getElementById("sendMessage").addEventListener("click", function(){
    publishPubnub(document.getElementById("newChatChannel").value, document.getElementById("textMessage").value)
  });
}, 500);
