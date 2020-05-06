var users = JSON.parse(localStorage.getItem("users")).users;
var user = JSON.parse(localStorage.getItem("user"));
var name;
var password = localStorage.getItem("riskGameCode");



const divider = document.getElementById("buttonList");




users.forEach((u,i) => {
  if (u.id != user.id){
    var b = document.createElement("button");
    console.log(u.name);
    b.className = "listObject";
    b.id = u.name;
    divider.appendChild(b);
    document.getElementById(u.name).innerHTML = u.name;
    document.getElementById(u.name).addEventListener("click", function(){
      location.href = "test.html";
      var names = [users[i].id + users[i].name, user.id + user.name];
      names = names.sort();
      var chan = "risk." + String(password) + names[0] + names[1];
      localStorage.setItem("riskChatChannel", chan);
    });
  }
});

document.getElementById("groupChat").addEventListener("click", function(){
  var chan = "risk." + String(password) + "groupChat";
  localStorage.setItem("riskChatChannel", chan);
  location.href = "test.html";
});

document.getElementById("turns").addEventListener("click", function(){
  var chan = "risk." + String(password) + "turns";
  localStorage.setItem("riskChatChannel", chan);
  location.href = "test.html";
});

document.getElementById("closeChat").addEventListener("click", function(){
  window.parent.postMessage(["close", null], "*");
});

window.onload = function(){
  var height = document.getElementsByTagName("html")[0].offsetHeight;
  window.parent.postMessage(["setHeight", height], "*");
}
