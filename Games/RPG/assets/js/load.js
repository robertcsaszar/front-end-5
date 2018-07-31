var sylvanas = {};
var maiev = {};
var illidan = {};

function load() {
  var characterName = player.name = localStorage.getItem("Char");
  character = $("#playerName");
  character.html(characterName);
  if (localStorage.getItem("sylvanas") === null) {
    alert('Hello stranger! Since you are new in this game you do not have any saved progress!', 'error');
  }
  if (localStorage.getItem("sylvanas") !== null) {
    sylvanas.name = "Sylvanas";
    sylvanas.hp = parseFloat(localStorage["sylvanas.hp"]);
    sylvanas.mana = parseFloat(localStorage["sylvanas.mana"]);
    sylvanas.attack = parseFloat(localStorage["sylvanas.attack"]);
    sylvanas.defense = parseFloat(localStorage["sylvanas.defense"]);
    sylvanas.criticalDMG = parseFloat(localStorage["sylvanas.criticalDMG"]);
    sylvanas.resistCriticalDMG = parseFloat(localStorage["sylvanas.resistCriticalDMG"]);
    sylvanas.level = parseFloat(localStorage["sylvanas.level"]);
    sylvanas.xp = parseFloat(localStorage["sylvanas.xp"]);
    sylvanas.select = parseFloat(localStorage["sylvanas.select"]);
  }

  if (localStorage.getItem("maiev") !== null) {
    maiev.name = "Maiev";
    maiev.hp = parseFloat(localStorage["maiev.hp"]);
    maiev.mana = parseFloat(localStorage["maiev.mana"]);
    maiev.attack = parseFloat(localStorage["maiev.attack"]);
    maiev.defense = parseFloat(localStorage["maiev.defense"]);
    maiev.criticalDMG = parseFloat(localStorage["maiev.criticalDMG"]);
    maiev.resistCriticalDMG = parseFloat(localStorage["maiev.resistCriticalDMG"]);
    maiev.level = parseFloat(localStorage["maiev.level"]);
    maiev.xp = parseFloat(localStorage["maiev.xp"]);
    maiev.select = parseFloat(localStorage["maiev.select"]);
  }

  if (localStorage.getItem("illidan") !== null) {
    illidan.name = "Illidan Stormrage";
    illidan.hp = parseFloat(localStorage["illidan.hp"]);
    illidan.mana = parseFloat(localStorage["illidan.mana"]);
    illidan.attack = parseFloat(localStorage["illidan.attack"]);
    illidan.defense = parseFloat(localStorage["illidan.defense"]);
    illidan.criticalDMG = parseFloat(localStorage["illidan.criticalDMG"]);
    illidan.resistCriticalDMG = parseFloat(localStorage["illidan.resistCriticalDMG"]);
    illidan.level = parseFloat(localStorage["illidan.level"]);
    illidan.select = parseFloat(localStorage["illidan.select"]);
  }
  
  $("#char-logs").prepend("Game has been successfully loaded!<br>");
}