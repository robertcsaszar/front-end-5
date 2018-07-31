// Spells //

var basicAttack = {
  name: "Basic Attack",
  damage: 5
};

var rupture = {
  name: "Rupture",
  damage: 10,
  mana: 10
};

var knives = {
  name: "Knives",
  damage: 15,
  mana: 10
};

var enrage = {
  name: "Enrage",
  damage: 20,
  mana: 10
}

var monsterEnrage = {
  name: "Monster Enrage",
  damage: 20,
  defense: 40
}

var avatar = {
  name: "Avatar",
  defense: 10,
  mana: 10
}

var healPotion = {
  name: "Health Potion",
  hp: 50
};

var manaPotion = {
  name: "Mana Potion",
  mana: 25
}

// Spells functions // 

// Basic Attack //
var skillAccuracy = Math.floor(Math.random() * 10) + 1;
function basicAtk() {
  if (skillAccuracy > 5 && skillAccuracy < 30) {
    monster.hp -= basicAttack.damage;
    $(".downinfo").prepend("Character Basic Attack!" + " " + basicAttack.damage + " " + " damage." + " " + "Monster" + " " + monster.hp + " " + "left.");
  } else if(accuracy > 1){
    monster.hp -= mainCharacter.damage;
    $(".downinfo").prepend("Character Hit!" + " " + mainCharacter.damage + " " + " damage." + " " + "Monster" + " " + monster.hp+ " " + "left.");
  } else {
    $(".downinfo").prepend("Character Miss!");
  }
}


// Rupture Attack 
function ruptureAtk() {

  if (mainCharacter.mana > 9) {
    //  var ruptureSkill = confirm("Do you want to cast Rupture?")
    var ruptureDamage = (rupture.damage + mainCharacter.damage);
    monster.hp -= ruptureDamage;
    mainCharacter.mana -= rupture.mana;
    $(".downinfo").prepend("<p>Rupture skill!" + " " + ruptureDamage + " " + " damage.</p>");
  }else {
    $(".downinfo").prepend("<p style=color:red>Not enough mana!</p>");
  }
}

// Knives Attack 
function knivesAtk() {

  if (mainCharacter.mana > 9) {
    //  var ruptureSkill = confirm("Do you want to cast Rupture?")
    var knivesDamage = (knives.damage + mainCharacter.damage + 10);
    monster.hp -= knivesDamage;
    mainCharacter.mana -= knives.mana;
    $(".downinfo").prepend("<p>Knives skill!" + " " + knivesDamage + " " + " damage.</p>");
  }else {
    $(".downinfo").prepend("<p style=color:red>Not enough mana!</p>");
  }
}

// HP Potion //
function healPot() {
  if (mainCharacter.hp < 50) {
    mainCharacter.hp += healPotion.hp;
    $(".downinfo").prepend("<p style=color:#c13e3e>Character used" + " " + healPotion.name + " " + "Character HP" + " " + mainCharacter.hp + "</p>"), $('#yourHealthBar').css('width', "+=" + (mainCharacter.hp + 50));

  } else {
    $(".downinfo").prepend("<p>Your hp is above 50%</p>");
  }
}

// Mana Potion //
function manaPot() {
  if (mainCharacter.mana < 25) {
    mainCharacter.mana += manaPotion.mana;
    $(".downinfo").prepend("<p style=color:yellow>Character used" + " " + manaPotion.name + " " + "Character Mana" + " " + mainCharacter.mana + "</p>");
  } else {
    $(".downinfo").prepend("<p>Your mana is above 50%</p>");
  }
}

// Char & Monster * Boss Enrage buff //

function avatarBuff() {
  if(mainCharacter.mana > 9){
    mainCharacter.defense += avatar.defense;
    mainCharacter.mana -= avatar.mana;
    $(".downinfo").prepend("<p>Casted Avatar." + " " + "Characters stats:" + " " + "Armor" + " " + avatar.defense + " " + "</p>");
  } else {
    $(".downinfo").prepend("<p style=color:red> Not enough mana! </p>")
  }
}

function charEnrageBuff() {
  if(mainCharacter.mana > 9) {
    mainCharacter.damage += enrage.damage;
    mainCharacter.mana -= enrage.mana;
    $(".downinfo").prepend("<p>Character Enraged." + " " + "Characters stats:" + " " + "Damage" + " " + enrage.damage + " " + "</p>");
  } else {
    $(".downinfo").prepend("<p style=color:red> Not enough mana! </p>")
  }
}

var monsterEnrages = function monsterEnrageBuff() {
  if (monster.hp <= 100) {
    monster.damage += monsterEnrage.damage;
    monster.defense += monsterEnrage.defense;
    $(".upinfo").prepend("<p>Monster Enraged." + " " + "Monster increased his damage with" + " " + monsterEnrage.damage + " " + " and armor with" + " " + monsterEnrage.defense + " " + "</p>");
  } else {
    $(".upinfo").prepend("<p>You are low!</p>");
  }
}