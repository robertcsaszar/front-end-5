// Attack Function //
// function attack() {
//   $(".downinfo").prepend("<p>Battle Starts!</p>");
//   $(".downinfo").prepend("<p>Character HP:" + " " +  mainCharacter.hp + "</p>");
//   $(".downinfo").prepend("<p>Character Mana:" + " " + mainCharacter.mana + "</p>");
//   $(".downinfo").prepend("<p>Character Level:" + " " +  mainCharacter.level + "</p>");
//   $(".downinfo").prepend("<p>Character XP:" + " " +  mainCharacter.xp + "</p>");
//   $(".upinfo").prepend("<p>Monster HP:" + " " + monster.hp + "</p>");
  
//   var battle = true;
//   while(battle){
//     charStats();
//     monsterStats();
//     character();
//     charEnrageBuff();
//     if(monster.hp <= 0) {
//       monster.hp = 0;
//       charStats();
//       alert("The monster is dead!");
//       levelup();
//       battle = false;
//     }
//     if(monster.hp > 0) {
//       monsterStats();
//       monsterAttack();
//       monsterEnrageBuff();
//         if(mainCharacter.hp <= 0){
//           mainCharacter.hp = 0;
//           monsterStats();
//           alert("The character is dead!");
//           leveldown();
//           battle = false;
//         }
//     }
//   }
//   charStats();
//   monsterStats();
// }

//  Testing Battle //
var battle = function(){
  
  // Hide Reset Button //
  $("#reset").hide();
 
  // Spell Cooldowns //
  $("#skill1").click(function(){
    var btn = $(this);
    document.getElementById("skill1").style.filter = "grayscale(100%)";
    btn.prop('disabled', true);
    setTimeout(function(){
      document.getElementById("skill1").style.filter = "grayscale(0%)";
      btn.prop('disabled', false);
    }, 4000);
  });
  
  $("#skill2").click(function(){
    var btn = $(this);
    document.getElementById("skill2").style.filter = "grayscale(100%)";
    btn.prop('disabled', true);
    setTimeout(function(){
      document.getElementById("skill2").style.filter = "grayscale(0%)";
      btn.prop('disabled', false);
    }, 4000);
  });
  
  $("#skill3").click(function(){
    var btn = $(this);
    document.getElementById("skill3").style.filter = "grayscale(100%)";
    btn.prop('disabled', true);
    setTimeout(function(){
      document.getElementById("skill3").style.filter = "grayscale(0%)";
      btn.prop('disabled', false);
    }, 4000);
  });
  
  $("#skill4").click(function(){
    var btn = $(this);
    document.getElementById("skill4").style.filter = "grayscale(100%)";
    btn.prop('disabled', true);
    setTimeout(function(){
      document.getElementById("skill4").style.filter = "grayscale(0%)";
      btn.prop('disabled', false);
    }, 40000000);
  });
  
  $("#skill5").click(function(){
    var btn = $(this);
    document.getElementById("skill5").style.filter = "grayscale(100%)";
    btn.prop('disabled', true);
    setTimeout(function(){
      document.getElementById("skill5").style.filter = "grayscale(0%)";
      btn.prop('disabled', false);
    }, 40000000);
  });
  
  $("#skill6").click(function(){
    var btn = $(this);
    document.getElementById("skill6").style.filter = "grayscale(100%)";
    btn.prop('disabled', true);
    setTimeout(function(){
      document.getElementById("skill6").style.filter = "grayscale(0%)";
      btn.prop('disabled', false);
    }, 10000);
  });
  
  $("#skill7").click(function(){
    var btn = $(this);
    document.getElementById("skill7").style.filter = "grayscale(100%)";
    btn.prop('disabled', true);
    setTimeout(function(){
      document.getElementById("skill7").style.filter = "grayscale(0%)";
      btn.prop('disabled', false);
    }, 10000);
  });
  
  //Player Attack //
  $("#skill1").click(function(){
    var accuracy = Math.floor(Math.random() * 10) + 1;
    var characterDmg = (mainCharacter.damage + Math.floor(Math.random() * 5 + 1)) - monster.defense;
    var criticalRate = Math.floor(Math.random() * 30) + 1;
    var criticalDamage = criticalRate + mainCharacter.damage;
    
    if(accuracy > 5 && accuracy < 30) {
      monster.hp -= criticalDamage;
      $(".downinfo").prepend("<p style=color:red >Character Critical HIT!" + " " + criticalDamage + " " + "damage</p>")
      console.log("Character Critical HIT! " + criticalDamage + " " + "damage");
    } else {
      monster.hp -= mainCharacter.damage;
      $(".downinfo").prepend("<p>The character hits for " + mainCharacter.damage + " damage!</p>");
    }
    monsterStats();
    
    healthChange();
    
    enemyAttack(); // Enemy turn
    charStats();
    gameOver(); // End Battle
  });
  
  $("#skill2").click(function(){
    ruptureAtk();
    monsterStats();
    
    healthChange();
    
    enemyAttack(); // Enemy turn
    charStats();
    gameOver(); // End Battle
  });
  
  $("#skill3").click(function(){
    knivesAtk();
    
    enemyAttack(); // Enemy turn
    gameOver(); // End Battle
  });
  
  $("#skill4").click(function(){
    avatarBuff();
    
    monsterStats();
    
    healthChange();
    
    charStats();
  });
  
  $("#skill5").click(function(){
    charEnrageBuff();
    
    monsterStats();
    
    healthChange();
    
    charStats();
  });
  
  $("#skill6").click(function(){
    healPot();
    monsterStats();
    
    healthChange();
    
    charStats();
  });
  
  $("#skill7").click(function(){
    manaPot();
    monsterStats();
    
    healthChange();
    
    charStats();
  });
    
  // Game Over function //
  function gameOver() {
    if (mainCharacter.hp <= 0 && monster.hp <= 0) {
      $(".downinfo").prepend("<p>It's a draw! Too bad you still died! Game Over!</p>");
      $("#skill1,#skill2,#skill3,#skill4,#skill5,#skill6,#skill7").hide();
      $("#reset").show();
    } else if (mainCharacter.hp <= 0) {
      lvldown();
      monsterlvlup();
      clearBuff();
      $(".upinfo").prepend("<p>You Lose! Game Over!</p>");
      $("#skill1,#skill2,#skill3,#skill4,#skill5,#skill6,#skill7").hide();
      $("#reset").show();
    } else if (monster.hp <= 0) {
      lvlup();
      monsterlvldown();
      clearBuff();
      charStats();
      $(".downinfo").prepend("<p>Congratulations! You Win!</p>");
      $("#skill1,#skill2,#skill3,#skill4,#skill5,#skill6,#skill7").hide();
      $("#reset").show();
    }
  }
  
  // Restart Battle //
  $("#reset").click(function() {
    window.location.reload();
  });
  
  // Enemy Attack //
  function enemyAttack() {
    var accuracy = Math.floor(Math.random() * 11);
    var monsterDmg = (monster.damage + Math.floor(Math.random() * 30 + 10)) - mainCharacter.defense;
    var criticalRate = Math.floor(Math.random() * 30 + 15);
    var criticalDamage = (criticalRate + monster.damage) - mainCharacter.defense;
    
    if(accuracy > 5 && accuracy < 30 || criticalRate > 10 && criticalRate < 30) {
      mainCharacter.hp -= criticalDamage;
      $(".upinfo").prepend("<p style=color:red >Monster Critical HIT!" + " " + criticalDamage + " " + "damage</p>")
      console.log("Monster Critical HIT! " + criticalDamage + " " + "damage");
    } else {
      mainCharacter.hp -= monsterDmg;
      $(".upinfo").prepend("<p>The enemy hits for " + monsterDmg + " damage!</p>");
    }
    
    monsterStats();
    
    healthChange();
    
    charStats();
//     $(".upinfo").css("Health: " + mainCharacter.hp + "/100");
  }
}

