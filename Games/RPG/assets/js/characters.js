// Player and Enemy //
var player = {
  name: "",
  money: 0,
  characters: []
};

player.characters.push(sylvanas);
player.characters.push(maiev);
player.characters.push(illidan);

var charSylvanas = player.characters[0];
var charMaiev = player.characters[1];
var charIllidan = player.characters[2];

// Add items on all characters (Training Set) //

charSylvanas.items = items;
charMaiev.items = items;
charIllidan.items = items;

// Equip the Training Set //

var equiptItems = function() {
  var helm = items[0];
  var amulet = items[1];
  var shoulder = items[2];
  var chest = items[3];
  var back = items[4];
  var wrist = items[5];
  var gloves = items[6];
  var waist = items[7];
  var pants = items[8];
  var boots = items[9];
  var ring = items[10];
  var weapon = items[11];
  if (charSylvanas.select === 1) {
    charSylvanas.defense += helm.defense
    charSylvanas.defense += amulet.defense
    charSylvanas.defense += shoulder.defense
    charSylvanas.defense += chest.defense
    charSylvanas.defense += back.defense
    charSylvanas.defense += wrist.defense
    charSylvanas.defense += gloves.defense
    charSylvanas.defense += waist.defense
    charSylvanas.defense += pants.defense
    charSylvanas.defense += boots.defense
    charSylvanas.defense += ring.defense
    charSylvanas.attack += weapon.attack
  } else if (charMaiev.select === 1) {
    charMaiev.defense += helm.defense
    charMaiev.defense += amulet.defense
    charMaiev.defense += shoulder.defense
    charMaiev.defense += chest.defense
    charMaiev.defense += back.defense
    charMaiev.defense += wrist.defense
    charMaiev.defense += gloves.defense
    charMaiev.defense += waist.defense
    charMaiev.defense += pants.defense
    charMaiev.defense += boots.defense
    charMaiev.defense += ring.defense
    charMaiev.attack += weapon.attack
  } else if (charIllidan.select === 1) {
    charIllidan.defense += helm.defense
    charIllidan.defense += amulet.defense
    charIllidan.defense += shoulder.defense
    charIllidan.defense += chest.defense
    charIllidan.defense += back.defense
    charIllidan.defense += wrist.defense
    charIllidan.defense += gloves.defense
    charIllidan.defense += waist.defense
    charIllidan.defense += pants.defense
    charIllidan.defense += boots.defense
    charIllidan.defense += ring.defense
    charIllidan.attack += weapon.attack
  }
}


var enemy = {
  hp: 100,
  mana: 100,
  attack: 36,
  defense: 40,
  criticalDMG: 10,
  resistCriticalDMG: 5,
  level: 1
};

// Player Stats //

var playerStats = function() {
  $(".helm").html(items[0].icon);
  $(".amulet").html(items[1].icon);
  $(".shoulder").html(items[2].icon);
  $(".chest").html(items[3].icon);
  $(".back").html(items[4].icon);
  $(".wrist").html(items[5].icon);
  $(".gloves").html(items[6].icon);
  $(".waist").html(items[7].icon);
  $(".pants").html(items[8].icon);
  $(".boots").html(items[9].icon);
  $(".ring").html(items[10].icon);
  $(".weapon").html(items[11].icon);
  if (charSylvanas.select === 1) {
    $("#level").html(charSylvanas.level)
    $("#attack").html(charSylvanas.attack)
    $("#defense").html(charSylvanas.defense)
    $("#critDmg").html(charSylvanas.criticalDMG)
    $("#resistCritDmg").html(charSylvanas.resistCriticalDMG)
    $("#money").html(player.money)
    var displaySylvanas = $("#displayChar");
    var displayInvSylvanas = $("#invCharDisplay");
    var htmlSylvanas = '<img src="assets/resources/images/characters/sylvanas.png" class="img-fluid w3-animate-opacity" alt="character" />'
    var htmlInvSylvanas = '<img src="assets/resources/images/characters/sylvanas.png" class="mt-3 img-fluid w3-animate-opacity" alt="character" />'
    displaySylvanas.html(htmlSylvanas)
    displayInvSylvanas.html(htmlInvSylvanas)
  } else if (charMaiev.select === 1) {
    $("#level").html(charMaiev.level)
    $("#attack").html(charMaiev.attack)
    $("#defense").html(charMaiev.defense)
    $("#critDmg").html(charMaiev.criticalDMG)
    $("#resistCritDmg").html(charMaiev.resistCriticalDMG)
    $("#money").html(player.money)
    var displayMaiev = $("#displayChar");
    var displayInvMaiev = $("#invCharDisplay");
    var htmlMaiev = '<img src="assets/resources/images/characters/maiev.png" class="img-fluid w3-animate-opacity" alt="character" />'
    var htmlInvMaiev = '<img src="assets/resources/images/characters/maiev.png" class="mt-3 img-fluid w3-animate-opacity" alt="character" />'
    displayMaiev.html(htmlMaiev)
    displayInvMaiev.html(htmlInvMaiev)
  } else if (charIllidan.select === 1) {
    $("#level").html(charIllidan.level)
    $("#attack").html(charIllidan.attack)
    $("#defense").html(charIllidan.defense)
    $("#critDmg").html(charIllidan.criticalDMG)
    $("#resistCritDmg").html(charIllidan.resistCriticalDMG)
    $("#money").html(player.money)
    var displayIllidan = $("#displayChar");
    var displayInvIllidan = $("#invCharDisplay");
    var htmlIllidan = '<img src="assets/resources/images/characters/illidan.png" class="img-fluid w3-animate-opacity" alt="character" />'
    var htmlInvIllidan = '<img src="assets/resources/images/characters/illidan.png" class="mt-3 img-fluid w3-animate-opacity" alt="character" />'
    displayIllidan.html(htmlIllidan)
    displayInvIllidan.html(htmlInvIllidan)
  } else {
    console.log("There's no character selected! Please select a character.")
  }
}


var enemyStats = function() {
  $("#enemyLevel").html(enemy.level)
  $("#enemyAttack").html(enemy.attack)
  $("#enemyDef").html(enemy.defense)
  $("#enemyCrit").html(enemy.criticalDMG)
  $("#enemyCritResist").html(enemy.resistCriticalDMG)
}

// Player and Enemy HP bar update //

var playerHp = function() {
  if (charSylvanas.select === 1) {
    var hpS = Number(charSylvanas.hp / 100).toLocaleString(undefined, {
      style: 'percent',
      minimumFractionDigits: 2
    });
    $(".char-hp").css("width", hpS)
    $("#charShowHp").text(hpS)
  } else if (charMaiev.select === 1) {
    var hpM = Number(charMaiev.hp / 100).toLocaleString(undefined, {
      style: 'percent',
      minimumFractionDigits: 2
    });
    $(".char-hp").css("width", hpM)
    $("#charShowHp").text(hpM)
  } else if (charIllidan.select === 1) {
    var hpI = Number(charIllidan.hp / 100).toLocaleString(undefined, {
      style: 'percent',
      minimumFractionDigits: 2
    });
    $(".char-hp").css("width", hpI)
    $("#charShowHp").text(hpI)
  }
}

var playerMana = function() {
  if (charSylvanas.select === 1) {
    var manaS = Number(charSylvanas.mana / 100).toLocaleString(undefined, {
      style: 'percent',
      minimumFractionDigits: 2
    });
    $(".char-mana").css("width", manaS)
    $("#charShowMana").text(manaS)
  } else if (charMaiev.select === 1) {
    var manaM = Number(charMaiev.mana / 100).toLocaleString(undefined, {
      style: 'percent',
      minimumFractionDigits: 2
    });
    $(".char-mana").css("width", manaM)
    $("#charShowMana").text(manaM)
  } else if (charIllidan.select === 1) {
    var manaI = Number(charIllidan.mana / 100).toLocaleString(undefined, {
      style: 'percent',
      minimumFractionDigits: 2
    });
    $(".char-mana").css("width", manaI)
    $("#charShowMana").text(manaI)
  }
}

var enemyHp = function() {
  var hp = Number(enemy.hp / 100).toLocaleString(undefined, {
    style: 'percent',
    minimumFractionDigits: 2
  });
  $(".enemy-hp").css("width", hp);
  $("#enemyShowHp").text(hp);
}

var enemyMana = function() {
  var mana = Number(enemy.mana / 100).toLocaleString(undefined, {
    style: 'percent',
    minimumFractionDigits: 2
  });
  $(".enemy-mana").css("width", mana);
  $("#enemyShowMana").text(mana)
}