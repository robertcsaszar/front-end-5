// Enter your name //
// var charName = prompt("Hello stranger! Please enter your name.");
// function characterName() {
//   if (charName === null && charName === "") {
//       alert("Are you alive?.");
//   } else {
//       alert("Thank you " + charName);
//   }
// }
// $("#charName").prepend("Character Name:" + " " + charName);

function naming() {
    var name = prompt("Enter your name.");

    if (name === "") {
      naming();
    } else if (name) {
      document.getElementById("charName").innerHTML = ("Character Name:" + " " +  name);
    } else {
      naming();
    }
  }


// Hp Bar //
  var healthChange = function() {
    yourHealthBar.style.width = ((mainCharacter.hp / (100)) * 100 + "%");
    yourManaBar.style.width = ((mainCharacter.mana / (100)) * 100 + "%");
    compHealthBar.style.width = ((monster.hp / (900)) * 100 + "%");
  }

// Sleep Function //
function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

// Clear buff function //

var clearBuff = function() {
  mainCharacter.damage -= enrage.damage;
  mainCharacter.defense -= avatar.defense;
  $(".downinfo").prepend("<p style=color:yellow> All buffs expired! </p>")
}

// Reset Battle System//
var reset = function resetBattle(){
  battling = true;
  monsterRevive();
  monsterStats();
  charRevive();
  charStats();
}

// Save System //

function save(){
  localStorage["player"] = mainCharacter;
  
  localStorage["mainCharacter.name"] = mainCharacter.name;
  localStorage["mainCharacter.level"] = mainCharacter.level;
  localStorage["mainCharacter.damage"] = mainCharacter.damage;
  localStorage["mainCharacter.xp"] = mainCharacter.xp;
  localStorage["mainCharacter.defense"] = mainCharacter.defense;
  
  
  localStorage["monster"] = monster;
  
  localStorage["monster.level"] = monster.level;
  localStorage["monster.damage"] = monster.damage;
  localStorage["monster.xp"] = monster.xp;
  localStorage["monster.defense"] = monster.defense;
  
  alert("Game has been successfully saved!","success")
}

// Load System //

function load(){
  if (localStorage.getItem("player", "monster") === null){
    alert('Hello stranger! Since you are new in this game you do not have any saved progress!', 'error');
  }
  if (localStorage.getItem("player", "monster") !== null){
    mainCharacter.name =            parseFloat(localStorage["mainCharacter.name"]);
    mainCharacter.level =         parseFloat(localStorage["mainCharacter.level"]);
    mainCharacter.damage =           parseFloat(localStorage["mainCharacter.damage"]);
    mainCharacter.xp =        parseFloat(localStorage["mainCharacter.xp"]);
    mainCharacter.defense =            parseFloat(localStorage["mainCharacter.defense"]);
    
    monster.level =         parseFloat(localStorage["monster.level"]);
    monster.damage =           parseFloat(localStorage["monster.damage"]);
    monster.xp =        parseFloat(localStorage["monster.xp"]);
    monster.defense =            parseFloat(localStorage["monster.defense"]);
    
    // Load the current stats //
    charStats();
    monsterStats();
    
    alert("Game has been successfully loaded!","success")
  }
}