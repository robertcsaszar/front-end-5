// Attack Functions //

var enemyAttack = function() {
  var skillRate = Math.floor(Math.random() * 40);
  var criticalRate = Math.floor(Math.random() * 40);
  var healRate = Math.floor(Math.random() * 40);
  var heal = 25;
  if (charSylvanas.select === 1) {
    var criticalDamageS = enemy.attack - charSylvanas.defense - charSylvanas.resistCriticalDMG + (enemy.criticalDMG * 2);
    var dmgS = enemy.attack + enemy.criticalDMG - charSylvanas.defense - charSylvanas.resistCriticalDMG;
    // Critical Rate & Critical Damage //
    if (criticalRate >= 30) {
      charSylvanas.hp -= criticalDamageS;
      $("#enemy-logs").prepend("<span class='enemyAttackCritical-logs'>Fasaki deals " + criticalDamageS + " CRITICAL damage!</span><br>");
    } else {
      if (dmgS < charSylvanas.defense && skillRate > 25) {
        enemy.attack += 5
        enemyStats();
        $("#enemy-logs").prepend("<span class='enemyAttack-logs'>Fasaki increased his damage!</span><br>");
        charSylvanas.hp -= dmgS;
        $("#enemy-logs").prepend("<span class='enemyAttack-logs'>Fasaki deals " + dmgS + " damage!</span><br>");
      } else {
        enemyStats();
        charSylvanas.hp -= dmgS;
        $("#enemy-logs").prepend("<span class='enemyAttack-logs'>Fasaki deals " + dmgS + " damage!</span><br>");
      }
    }
    // Heal Rate & Heal //
    if (healRate >= 30 && enemy.hp < 100) {
      if (enemy.hp > 100) {
        enemy.hp = 100
        enemyStats();
      } else {
        enemyStats();
        enemy.hp += heal;
        enemyHp();
        $("#enemy-logs").prepend("<span class='enemyHeal-logs'>Fasaki heals with " + heal + " !</span><br>");
      }
    }
    // Skills  & Buff //
    if (skillRate > 30) {
      var skillDmgS = enemy.attack + enemySpells[1].attack - charSylvanas.defense;
      enemy.mana -= enemySpells[1].mana;
      enemyMana();
      charSylvanas.hp -= skillDmgS;
      $("#enemy-logs").prepend("<span class='enemyHeal-logs'>Fasaki deals " + skillDmgS + " damage with " + enemySpells[1].name + " !</span><br>");
    }
    if (enemy.hp <= 50 && skillRate > 30) {
      if (enemy.hp <= 0) {
        enemy.hp = 0
      } else {
        enemy.hp -= enemySpells[0].hp;
        enemy.mana -= enemySpells[0].mana;
        enemy.attack += enemySpells[0].attack;
        enemy.defense += enemySpells[0].defense;
        enemyStats();
        $("#enemy-logs").prepend("<span class='enemyHeal-logs'>Fasaki casted " + enemySpells[0].name + " ! Enemy HP decreased with " + enemySpells[0].hp + "! <br> Attack increased with " + enemySpells[0].attack + " !<br> Defense increased with " + enemySpells[0].defense + " !</span><br>");
        $(".enemy-buff").prepend("<span class='m-1' id='berserk-cd'>" + enemySpells[0].icon + "</span>");
      }

    }
  } else if (charMaiev.select === 1) {
    var criticalDamageM = enemy.attack - charMaiev.defense - charMaiev.resistCriticalDMG + (enemy.criticalDMG * 2);
    var dmgM = enemy.attack + enemy.criticalDMG - charMaiev.defense - charMaiev.resistCriticalDMG;
    // Critical Rate & Critical Damage //
    if (criticalRate >= 30) {
      charMaiev.hp -= criticalDamageM;
      $("#enemy-logs").prepend("<span class='enemyAttackCritical-logs'>Fasaki deals " + criticalDamageM + " CRITICAL damage!</span><br>");
    } else {
      if (dmgM < charMaiev.defense) {
        enemy.attack += 5
        enemyStats();
        $("#enemy-logs").prepend("<span class='enemyAttack-logs'>Fasaki increased his damage!</span><br>");
      } else {
        charMaiev.hp -= dmgM;
        $("#enemy-logs").prepend("<span class='enemyAttack-logs'>Fasaki deals " + dmgM + " damage!</span><br>");
      }
    }
    // Heal Rate & Heal //
    if (healRate >= 30 && enemy.hp < 100) {
      enemy.hp += heal;
      enemyHp();
      $("#enemy-logs").prepend("<span class='enemyHeal-logs'>Fasaki heals with " + heal + " !</span><br>");
    }
    // Skills  & Buff //
    if (skillRate > 30) {
      var skillDmgM = enemy.attack + enemySpells[1].attack - charMaiev.defense;
      enemy.mana -= enemySpells[1].mana;
      enemyMana();
      charMaiev.hp -= skillDmgM;
      $("#enemy-logs").prepend("<span class='enemyHeal-logs'>Fasaki deals " + skillDmgM + " damage with " + enemySpells[1].name + " !</span><br>");
    }
    if (enemy.hp < 50 && skillRate > 30) {
      if (enemy.hp <= 0) {
        enemy.hp = 0
      } else {
        enemy.hp -= enemySpells[0].hp;
        enemy.mana -= enemySpells[0].mana;
        enemy.attack += enemySpells[0].attack;
        enemy.defense += enemySpells[0].defense;
        enemyStats();
        $("#enemy-logs").prepend("<span class='enemyHeal-logs'>Fasaki casted " + enemySpells[0].name + " ! Enemy HP decreased with " + enemySpells[0].hp + "! <br> Attack increased with " + enemySpells[0].attack + " !<br> Defense increased with " + enemySpells[0].defense + " !</span><br>");
        $(".enemy-buff").prepend("<span class='m-1' id='berserk-cd'>" + enemySpells[0].icon + "</span>");
      }
    }
  } else if (charIllidan.select === 1) {
    var criticalDamageI = enemy.attack - charIllidan.defense - charIllidan.resistCriticalDMG + (enemy.criticalDMG * 2);
    var dmgI = enemy.attack + enemy.criticalDMG - charIllidan.defense - charIllidan.resistCriticalDMG;
    // Critical Rate & Critical Damage //
    if (criticalRate >= 30) {
      charIllidan.hp -= criticalDamageI;
      $("#enemy-logs").prepend("<span class='enemyAttackCritical-logs'>Fasaki deals " + criticalDamageI + " CRITICAL damage!</span><br>");
    } else {
      if (dmgI < charIllidan.defense) {
        enemy.attack += 5
        enemyStats();
        $("#enemy-logs").prepend("<span class='enemyAttack-logs'>Fasaki increased his damage!</span><br>");
      } else {
        charIllidan.hp -= dmgI;
        $("#enemy-logs").prepend("<span class='enemyAttack-logs'>Fasaki deals " + dmgI + " damage!</span><br>");
      }
    }
    // Heal Rate & Heal //
    if (healRate >= 30 && enemy.hp < 100) {
      enemy.hp += heal;
      enemyHp();
      $("#enemy-logs").prepend("<span class='enemyHeal-logs'>Fasaki heals with " + heal + " !</span><br>");
    }
    // Skills  & Buff //
    if (skillRate > 30) {
      var skillDmgI = enemy.attack + enemySpells[1].attack - charIllidan.defense;
      enemy.mana -= enemySpells[1].mana;
      enemyMana();
      charIllidan.hp -= skillDmgI;
      $("#enemy-logs").prepend("<span class='enemyHeal-logs'>Fasaki deals " + skillDmgI + " damage with " + enemySpells[1].name + " !</span><br>");
    }
    if (enemy.hp < 50 && skillRate > 30) {
      if (enemy.hp <= 0) {
        enemy.hp = 0
      } else {
        enemy.hp -= enemySpells[0].hp;
        enemy.mana -= enemySpells[0].mana;
        enemy.attack += enemySpells[0].attack;
        enemy.defense += enemySpells[0].defense;
        enemyStats();
        $("#enemy-logs").prepend("<span class='enemyHeal-logs'>Fasaki casted " + enemySpells[0].name + " ! Enemy HP decreased with " + enemySpells[0].hp + "! <br> Attack increased with " + enemySpells[0].attack + " !<br> Defense increased with " + enemySpells[0].defense + " !</span><br>");
        $(".enemy-buff").prepend("<span class='m-1' id='berserk-cd'>" + enemySpells[0].icon + "</span>");
      }
    }
  }
}

var increaseStats = function() {
  enemy.attack += 5;
  enemy.defense += 5;
  enemy.criticalDMG += 3;
  enemy.resistCriticalDMG += 2;
  enemyStats();
}

var increaseLevel = function() {
  enemy.level++;
  enemyStats();
}

var resetStats = function () {
  enemy.level = 1;
  enemy.attack = 36;
  enemy.defense = 40;
  enemy.criticalDMG = 10;
  enemy.resistCriticalDMG = 5;
  enemyStats();
}