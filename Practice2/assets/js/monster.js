var monster = {
  name: "Wolf",
  hp: 900,
  hpMax: 900,
  level: 1,
  xp: 0,
  damage: 20,
  defense: 5,
  drop: 0
};

var boss = {
  name: "",
  hp: 200,
  level: 1,
  damage: 20,
  defense: 15,
  drop: 0
};

// Monster Display Stats
var monsterStats = function displaystats() {

$("#monsterattack").text("Damage:" + " "+ monster.damage);
$("#monsterdefense").text("Defense:" + " "+ monster.defense);
$("#monsterlevel").text("Level:" + " "+ monster.level);
$("#monsterxp").text("XP:" + " "+ monster.xp);
}

// Monster Attack Function //
function monsterAttack(){
  var monsterAccuracy = Math.floor(Math.random()  * 10) + 1;
  var monsterCritical = Math.floor(Math.random()  * 10) + 1;
  
  if (monsterAccuracy > 1 && monsterCritical >= 10) {
    monster.damage = Math.floor(Math.random()  * 50) + 1- mainCharacter.defense;
    mainCharacter.hp -= monster.damage;
    $(".upinfo").prepend("<p style=color:red><strong>Monster Critical Hit!" + " " + monster.damage + " " + " damage." + " " + "Character" + " " + mainCharacter.hp + " " + "left." + "</strong></p>");
  } else if(monsterAccuracy > 1){
    mainCharacter.hp -= monster.damage + mainCharacter.defense;
    $(".upinfo").prepend("<p>Monster Hit!" + " " + monster.damage + " " + " damage." + " " + "Character" + " " + mainCharacter.hp + " " + "left." + "</p>");
  } else {
    $(".upinfo").prepend("<p>Monster Miss!</p>");
  }
}


// Monster revive function //

function monsterRevive() {
  if(monster.hp <= 0) {
    monster.hp = monster.hpMax;
    $(".upinfo").prepend("<p style=color:orange>Monster hp is restored!</p>")
  } else {
     $(".upinfo").prepend("<p style=color:green>The monster is alive!</p>")
  }
}
