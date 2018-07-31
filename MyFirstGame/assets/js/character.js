// Character Info //
var mainCharacter = {
  name: "Darkness",
  hp: 100,
  hpMax: 100,
  mana: 100,
  manaMax: 100,
  level: 1,
  xp: 0,
  damage: 10,
  defense: 10,
  
  // Character item slots //
  helm: {},
  amulet: {},
  shoulder: {},
  cloak: {},
  chest: {},
  gloves: {},
  bracelet: {},
  pants: {},
  boots: {},
  ring: {},
  weapons: {},
  shield: {},
   
};

// Character Status displayed //

var charStats = function displaystats() {

$("#attack").text("Damage:" + " "+ mainCharacter.damage);
$("#defense").text("Defense:" + " "+ mainCharacter.defense);
$("#xp").text("Xp:" + " "+ mainCharacter.xp);
$("#level").text("Level:" + " "+ mainCharacter.level);
}

// Character Critical and Attack Chance //
var accuracy = Math.floor(Math.random() * 10 + 1);
var critical = Math.floor(Math.random() * 30 + 1);

// Character Attack Function //
function character(){
  if (accuracy > 1 && critical >= 15) {
    var criticalDmg = Math.floor(Math.random() * mainCharacter.damage + 1)
    monster.hp -= criticalDmg;
    $(".downinfo").prepend("<p style=color:red><strong>Character Critical Hit!" + " " + criticalDmg + " " + "damage." + " " + "Monster" + " " + monster.hp + " " + "left." + "</strong></p>");
  } else if(accuracy > 1){
    monster.hp -= mainCharacter.damage;
    $(".downinfo").prepend("<p>Character Hit!" + " " + mainCharacter.damage + " " + " damage." + " " + "Monster" + " " + monster.hp + " " + "left." + "</p>");
  } else {
    $(".downinfo").prepend("<p>Character Miss!</p>");
  }
}

// Character revive function //

function charRevive() {
  if(mainCharacter.hp <= 0) {
    mainCharacter.hp = mainCharacter.hpMax;
    $(".downinfo").prepend("<p style=color:orange>Character hp is restored!</p>")
  } else {
    $(".downinfo").prepend("<p style=color:green>You are alive!</p>")
  }
}