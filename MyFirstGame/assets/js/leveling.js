// Character Level up System //
var lvlup = function levelup() {
  var xpRate = Math.floor(Math.random() * 10 + monster.level);
  
  if(mainCharacter.xp <= 0) {
    mainCharacter.xp = 0;
    mainCharacter.xp += xpRate;
    $(".downinfo").prepend("<p>Character" + " " + xpRate + " " + "XP received" + " " + "</p>");
  } else if (mainCharacter.xp <= 100) {
    levelUp = mainCharacter.xp += xpRate;
    $(".downinfo").prepend("<p>Character" + " " + xpRate + " " + "XP received" + " " + "</p>");
  } else if (mainCharacter.xp >= 100) {
    levelUp = mainCharacter.level += 1;
    mainCharacter.damage += 10;
    mainCharacter.damage += 10;
    xpreset = mainCharacter.xp = 0;
    $(".downinfo").prepend("<p>Character level up!" + " " + "Character level" + " " + mainCharacter.level + " " + "</p>");
  }
}

var lvldown = function leveldown() {
  var xpRate = Math.floor(Math.random() * 5 + monster.level);
  
  if(mainCharacter.xp <= 0) {
    mainCharacter.xp -= xpRate;
    mainCharacter.xp = 0;
    $(".downinfo").prepend("<p>Character" + " " + xpRate + " " + "XP lost" + " " + "</p>");
  } else if (mainCharacter.xp == 100) {
    levelDown = mainCharacter.xp -= xpRate;
    $(".downinfo").prepend("<p>Character" + " " + xpRate + " " + "XP lost" + " " + "</p>");
  } else {
    mainCharacter.xp === mainCharacter.xp;
  }
}

// Monsters Level up System //

var monsterlvlup = function monsterlevelup() {
  var xpRate = Math.floor(Math.random() * 10 + mainCharacter.level);
  
  if(monster.xp <= 0) {
    monster.xp = 0;
    monster.xp += xpRate;
    $(".upinfo").prepend("<p>Monster" + " " + xpRate + " " + "XP received" + " " + "</p>");
  } else if (monster.xp <= 100) {
    levelUp = monster.xp += xpRate;
    $(".upinfo").prepend("<p>Monster" + " " + xpRate + " " + "XP received" + " " + "</p>");
  } else if (monster.xp >= 100) {
    levelUp = monster.level += 1;
    monster.damage += 5;
    monster.defense += 5;
    xpreset = monster.xp = 0;
    $(".upinfo").prepend("<p>Monster level up!" + " " + "Character level" + " " + monster.level + " " + "</p>");
  }
}

var monsterlvldown = function monsterleveldown() {
  var xpRate = Math.floor(Math.random() * 5 + mainCharacter.level);
  
  if(monster.xp <= 0) {
    monster.xp -= xpRate;
    monster.xp = 0;
    $(".upinfo").prepend("<p>Monster" + " " + xpRate + " " + "XP lost" + " " + "</p>");
  } else if (monster.xp == 100) {
    levelDown = monster.xp -= xpRate;
    $(".upinfo").prepend("<p>Monster" + " " + xpRate + " " + "XP lost" + " " + "</p>");
  } else {
    monster.xp === monster.xp;
  }
}