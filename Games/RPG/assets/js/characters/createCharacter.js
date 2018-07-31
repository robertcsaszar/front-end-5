function Character(options) {
  options = options || {};
  this.name = options.name;
  this.hp = 100;
  this.mana = 100;
  this.attack = options.attack;
  this.defense = options.defense;
  this.criticalDMG = options.criticalDMG;
  this.resistCriticalDMG = options.resistCriticalDMG;
  this.level = 1;
  this.xp = 0;
  this.select = options.select;
}

var sylvanas = new Character({
  name: "Sylvanas",
  attack: 10,
  defense: 15,
  criticalDMG: 20,
  resistCriticalDMG: 15,
})

var maiev = new Character({
  name: "Maiev",
  attack: 15,
  defense: 10,
  criticalDMG: 15,
  resistCriticalDMG: 10,
})

var illidan = new Character({
  name: "Illidan Stormrage",
  attack: 20,
  defense: 10,
  criticalDMG: 25,
  resistCriticalDMG: 20,
})

var characters = []

function charSylvanas() {
  characters.push(sylvanas);
}

charSylvanas();

function charMaiev() {
  characters.push(maiev);
}

charMaiev();

function charIllidan() {
  characters.push(illidan);
}

charIllidan();