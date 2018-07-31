function save() {
  var charName = $("#inputName").val();
  localStorage.setItem("Char", charName);
  
  localStorage["sylvanas"] = characters[0];

  localStorage["sylvanas.name"] = characters[0].name;
  localStorage["sylvanas.hp"] = characters[0].hp;
  localStorage["sylvanas.mana"] = characters[0].mana;
  localStorage["sylvanas.attack"] = characters[0].attack;
  localStorage["sylvanas.defense"] = characters[0].defense;
  localStorage["sylvanas.criticalDMG"] = characters[0].criticalDMG;
  localStorage["sylvanas.resistCriticalDMG"] = characters[0].resistCriticalDMG;
  localStorage["sylvanas.level"] = characters[0].level;
  localStorage["sylvanas.xp"] = characters[0].xp;
  localStorage["sylvanas.select"] = characters[0].select;
  
  localStorage["maiev"] = characters[1];

  localStorage["maiev.name"] = characters[1].name;
  localStorage["maiev.hp"] = characters[1].hp;
  localStorage["maiev.mana"] = characters[1].mana;
  localStorage["maiev.attack"] = characters[1].attack;
  localStorage["maiev.defense"] = characters[1].defense;
  localStorage["maiev.criticalDMG"] = characters[1].criticalDMG;
  localStorage["maiev.resistCriticalDMG"] = characters[1].resistCriticalDMG;
  localStorage["maiev.level"] = characters[1].level;
  localStorage["maiev.xp"] = characters[1].xp;
  localStorage["maiev.select"] = characters[1].select;
  
  localStorage["illidan"] = characters[2];

  localStorage["illidan.name"] = characters[2].name;
  localStorage["illidan.hp"] = characters[2].hp;
  localStorage["illidan.mana"] = characters[2].mana;
  localStorage["illidan.attack"] = characters[2].attack;
  localStorage["illidan.defense"] = characters[2].defense;
  localStorage["illidan.criticalDMG"] = characters[2].criticalDMG;
  localStorage["illidan.resistCriticalDMG"] = characters[2].resistCriticalDMG;
  localStorage["illidan.level"] = characters[2].level;
  localStorage["illidan.xp"] = characters[2].xp;
  localStorage["illidan.select"] = characters[2].select;

  alert("Game has been successfully saved!", "success")
}

function load() {
  if (localStorage.getItem("sylvanas", "maiev", "illidan") === null) {
    alert('Hello stranger! Since you are new in this game you do not have any saved progress!', 'error');
  }
  if (localStorage.getItem("sylvanas") !== null) {
    characters[0].name = parseFloat(localStorage["sylvanas.name"]);
    characters[0].hp = parseFloat(localStorage["sylvanas.hp"]);
    characters[0].mana = parseFloat(localStorage["sylvanas.mana"]);
    characters[0].attack = parseFloat(localStorage["sylvanas.attack"]);
    characters[0].defense = parseFloat(localStorage["sylvanas.defense"]);
    characters[0].criticalDMG = parseFloat(localStorage["sylvanas.criticalDMG"]);
    characters[0].resistCriticalDMG = parseFloat(localStorage["sylvanas.resistCriticalDMG"]);
    characters[0].level = parseFloat(localStorage["sylvanas.level"]);
    characters[0].xp = parseFloat(localStorage["sylvanas.xp"]);

  }
  
  if (localStorage.getItem("maiev") !== null) {
    characters[1].name = parseFloat(localStorage["maiev.name"]);
    characters[1].hp = parseFloat(localStorage["maiev.hp"]);
    characters[1].mana = parseFloat(localStorage["maiev.mana"]);
    characters[1].attack = parseFloat(localStorage["maiev.attack"]);
    characters[1].defense = parseFloat(localStorage["maiev.defense"]);
    characters[1].criticalDMG = parseFloat(localStorage["maiev.criticalDMG"]);
    characters[1].resistCriticalDMG = parseFloat(localStorage["maiev.resistCriticalDMG"]);
    characters[1].level = parseFloat(localStorage["maiev.level"]);
    characters[1].xp = parseFloat(localStorage["maiev.xp"]);
  }
  
  if (localStorage.getItem("illidan") !== null) {
    characters[2].name = parseFloat(localStorage["illidan.name"]);
    characters[2].hp = parseFloat(localStorage["illidan.hp"]);
    characters[2].mana = parseFloat(localStorage["illidan.mana"]);
    characters[2].attack = parseFloat(localStorage["illidan.attack"]);
    characters[2].defense = parseFloat(localStorage["illidan.defense"]);
    characters[2].criticalDMG = parseFloat(localStorage["illidan.criticalDMG"]);
    characters[2].resistCriticalDMG = parseFloat(localStorage["illidan.resistCriticalDMG"]);
    characters[2].level = parseFloat(localStorage["illidan.level"]);
    characters[2].xp = parseFloat(localStorage["illidan.xp"]);
  }
  
  alert("Game has been successfully loaded!", "success")
}