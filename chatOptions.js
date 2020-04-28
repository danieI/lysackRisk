var users = JSON.parse(localStorage.getItem("users"));
var user;
var name;
var temp = false;
while(!temp){
  name = prompt("Enter username");
  users.forEach((u, i) => {
    if(u.id == name){
      user = u;
      temp = true;
    }
  });
}


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
      localStorage.setItem("user", JSON.stringify(users[i]));
      var names = [users[i].id + users[i].name, user.id + user.name];
      names = names.sort();
      var chan = names[0] + names[1];
      localStorage.setItem("riskChatChannel", chan);
      location.href = "test.html";
    });
  }
});

document.getElementById("groupChat").addEventListener("click", function(){
  localStorage.setItem("riskChatChannel", groupChat);
  location.href = "test.html";
});
