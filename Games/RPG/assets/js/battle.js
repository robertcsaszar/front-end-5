// // Battle System //
var battle = function() {
  equiptItems();
  upgradeInfo();
  playerStats();
  enemyStats();

  // Spell Cooldowns //
  $("#skill1").click(function() {
    var btn = $(this);
    document.getElementById("skill1").style.filter = "grayscale(100%)";
    btn.prop('disabled', true);
    setTimeout(function() {
      document.getElementById("skill1").style.filter = "grayscale(0%)";
      btn.prop('disabled', false);
    }, 3000);
  });

  $("#skill2").click(function() {
    var btn = $(this);
    if (charSylvanas.select === 1) {
      if (charSylvanas.mana > spells[1].mana) {
        document.getElementById("skill2").style.filter = "grayscale(100%)";
        btn.prop('disabled', true);
        setTimeout(function() {
          document.getElementById("skill2").style.filter = "grayscale(0%)";
          btn.prop('disabled', false);
        }, 7000);
      }
    } else if (charMaiev.select === 1) {
      if (charMaiev.mana > spells[1].mana) {
        document.getElementById("skill2").style.filter = "grayscale(100%)";
        btn.prop('disabled', true);
        setTimeout(function() {
          document.getElementById("skill2").style.filter = "grayscale(0%)";
          btn.prop('disabled', false);
        }, 7000);
      }
    } else if (charIllidan.select === 1) {
      if (charIllidan.mana > spells[1].mana) {
        document.getElementById("skill2").style.filter = "grayscale(100%)";
        btn.prop('disabled', true);
        setTimeout(function() {
          document.getElementById("skill2").style.filter = "grayscale(0%)";
          btn.prop('disabled', false);
        }, 7000);
      }
    }
  });

  $("#skill3").click(function() {
    var btn = $(this);
    if (charSylvanas.select === 1) {
      if (charSylvanas.mana > spells[2].mana) {
        document.getElementById("skill3").style.filter = "grayscale(100%)";
        btn.prop('disabled', true);
        setTimeout(function() {
          document.getElementById("skill3").style.filter = "grayscale(0%)";
          btn.prop('disabled', false);
        }, 5000);
      }
    } else if (charMaiev.select === 1) {
      if (charMaiev.mana > spells[2].mana) {
        document.getElementById("skill3").style.filter = "grayscale(100%)";
        btn.prop('disabled', true);
        setTimeout(function() {
          document.getElementById("skill3").style.filter = "grayscale(0%)";
          btn.prop('disabled', false);
        }, 5000);
      }
    } else if (charIllidan.select === 1) {
      if (charIllidan.mana > spells[2].mana) {
        document.getElementById("skill3").style.filter = "grayscale(100%)";
        btn.prop('disabled', true);
        setTimeout(function() {
          document.getElementById("skill3").style.filter = "grayscale(0%)";
          btn.prop('disabled', false);
        }, 5000);
      }
    }
  });

  $("#skill4").click(function() {
    var btn = $(this);
    if(charSylvanas.select === 1) {
      if (charSylvanas.mana > spells[3].mana) {
        document.getElementById("skill4").style.filter = "grayscale(100%)";
        btn.prop('disabled', true);
        setTimeout(function() {
          document.getElementById("skill4").style.filter = "grayscale(0%)";
          btn.prop('disabled', false);
        }, 30000);
      }
    } else if(charMaiev.select === 1) {
      if (charMaiev.mana > spells[3].mana) {
        document.getElementById("skill4").style.filter = "grayscale(100%)";
        btn.prop('disabled', true);
        setTimeout(function() {
          document.getElementById("skill4").style.filter = "grayscale(0%)";
          btn.prop('disabled', false);
        }, 30000);
      }
    } else if(charIllidan.select === 1) {
      if (charIllidan.mana > spells[3].mana) {
        document.getElementById("skill4").style.filter = "grayscale(100%)";
        btn.prop('disabled', true);
        setTimeout(function() {
          document.getElementById("skill4").style.filter = "grayscale(0%)";
          btn.prop('disabled', false);
        }, 30000);
      }
    }
  });

  $("#skill5").click(function() {
    var btn = $(this);
    if(charSylvanas.select === 1) {
      if (charSylvanas.mana > spells[4].mana) {
        document.getElementById("skill5").style.filter = "grayscale(100%)";
        btn.prop('disabled', true);
        setTimeout(function() {
          document.getElementById("skill5").style.filter = "grayscale(0%)";
          btn.prop('disabled', false);
        }, 30000);
      }
    } else if(charMaiev.select === 1) {
      if (charMaiev.mana > spells[4].mana) {
        document.getElementById("skill5").style.filter = "grayscale(100%)";
        btn.prop('disabled', true);
        setTimeout(function() {
          document.getElementById("skill5").style.filter = "grayscale(0%)";
          btn.prop('disabled', false);
        }, 30000);
      }
    } else if(charIllidan.select === 1) {
      if (charIllidan.mana > spells[4].mana) {
        document.getElementById("skill5").style.filter = "grayscale(100%)";
        btn.prop('disabled', true);
        setTimeout(function() {
          document.getElementById("skill5").style.filter = "grayscale(0%)";
          btn.prop('disabled', false);
        }, 30000);
      }
    }
  });

  $("#skill6").click(function() {
    var btn = $(this);
    if(charSylvanas.select === 1) {
      if (charSylvanas.hp < 25) {
        document.getElementById("skill6").style.filter = "grayscale(100%)";
        btn.prop('disabled', true);
        setTimeout(function() {
          document.getElementById("skill6").style.filter = "grayscale(0%)";
          btn.prop('disabled', false);
        }, 10000);
      }
    } else if(charMaiev.select === 1) {
      if (charMaiev.hp < 25) {
        document.getElementById("skill6").style.filter = "grayscale(100%)";
        btn.prop('disabled', true);
        setTimeout(function() {
          document.getElementById("skill6").style.filter = "grayscale(0%)";
          btn.prop('disabled', false);
        }, 10000);
      }
    } else if(charIllidan.select === 1) {
      if (charIllidan.hp < 25) {
        document.getElementById("skill6").style.filter = "grayscale(100%)";
        btn.prop('disabled', true);
        setTimeout(function() {
          document.getElementById("skill6").style.filter = "grayscale(0%)";
          btn.prop('disabled', false);
        }, 10000);
      }
    }
  });

  $("#skill7").click(function() {
    var btn = $(this);
    if(charSylvanas.select === 1) {
      if (charSylvanas.mana < 20) {
        document.getElementById("skill7").style.filter = "grayscale(100%)";
        btn.prop('disabled', true);
        setTimeout(function() {
          document.getElementById("skill7").style.filter = "grayscale(0%)";
          btn.prop('disabled', false);
        }, 10000);
      }
    } else if(charMaiev.select === 1) {
      if (charMaiev.mana < 20) {
        document.getElementById("skill7").style.filter = "grayscale(100%)";
        btn.prop('disabled', true);
        setTimeout(function() {
          document.getElementById("skill7").style.filter = "grayscale(0%)";
          btn.prop('disabled', false);
        }, 10000);
      }
    } else if(charIllidan.select === 1) {
      if (charIllidan.mana < 20) {
        document.getElementById("skill7").style.filter = "grayscale(100%)";
        btn.prop('disabled', true);
        setTimeout(function() {
          document.getElementById("skill7").style.filter = "grayscale(0%)";
          btn.prop('disabled', false);
        }, 10000);
      }
    }
  });

  //Player Attack //
  $("#skill1").click(function() {
    basicAttackSound();
    basicAttack();
    enemyHp();
    enemyMana();
    enemyAttack();
    playerHp();
    lowHpSound();
    lowManaSound();
    playerStats();
    gameOver();
  });

  $("#skill2").click(function() {
    ruptureSound();
    rupture();
    enemyHp();
    enemyMana();
    enemyAttack();
    playerHp();
    playerMana();
    lowHpSound();
    lowManaSound();
    playerStats();
    gameOver();
  });

  $("#skill3").click(function() {
    knivesSound();
    knives();
    enemyHp();
    enemyMana();
    enemyAttack();
    playerHp();
    playerMana();
    lowHpSound();
    lowManaSound();
    playerStats();
    gameOver();
  });

  $("#skill4").click(function() {
    avatarSound();
    avatar();
    spells[3].cooldown();
    playerHp();
    playerMana();
    lowManaSound();
    playerStats();
  });

  $("#skill5").click(function() {
    enrageSound();
    enrage();
    spells[4].cooldown();
    playerHp();
    playerMana();
    lowManaSound();
    playerStats();
  });

  $("#skill6").click(function() {
    hp();
    playerHp();
    playerStats();
  });

  $("#skill7").click(function() {
    mana();
    playerMana();
    playerStats();
  });


  // Game Over function //
  function gameOver() {
    var btn = $("#slot1, #slot2, #slot3, #slot4, #slot5, #slot6, #slot7");
    if(charSylvanas.select === 1) {
      if (charSylvanas.hp <= 0 && enemy.hp <= 0) {
        $("#char-logs").prepend("<p>It's a draw! Too bad you still died! Game Over!</p>");
        btn.hide();
        $("#reset").show();
      } else if (charSylvanas.hp <= 0) {
        charSylvanas.hp = 0
        loseSound();
        enemyStats();
        $("#enemy-logs").prepend("<p>You Lose! Game Over!</p>");
        btn.hide();
        $("#reset").show();
      } else if (enemy.hp <= 0) {
        enemy.hp = 0
        enemyStats();
        winSound();
        money();
        xp();
        levelUp();
        playerStats();
        $("#char-logs").prepend("<p>Congratulations! You Win!</p>");
        $("#enemy-logs").prepend("<p>Fasaki is dead!</p>");
        btn.hide();
        $("#reset").show();
      }
    } else if(charMaiev.select === 1) {
      if (charMaiev.hp <= 0 && enemy.hp <= 0) {
        $("#char-logs").prepend("<p>It's a draw! Too bad you still died! Game Over!</p>");
        btn.hide();
        $("#reset").show();
      } else if (charMaiev.hp <= 0) {
        loseSound();
        enemyStats();
        $("#enemy-logs").prepend("<p>You Lose! Game Over!</p>");
        btn.hide();
        $("#reset").show();
      } else if (enemy.hp <= 0) {
        enemy.hp = 0
        enemyStats();
        winSound();
        money();
        xp();
        levelUp();
        playerStats();
        $("#char-logs").prepend("<p>Congratulations! You Win!</p>");
        $("#enemy-logs").prepend("<p>Fasaki is dead!</p>");
        btn.hide();
        $("#reset").show();
      }
    } else if(charIllidan.select === 1) {
      if (charIllidan.hp <= 0 && enemy.hp <= 0) {
        $("#char-logs").prepend("<p>It's a draw! Too bad you still died! Game Over!</p>");
        btn.hide();
        $("#reset").show();
      } else if (charIllidan.hp <= 0) {
        loseSound();
        enemyStats();
        $("#enemy-logs").prepend("<p>You Lose! Game Over!</p>");
        btn.hide();
        $("#reset").show();
      } else if (enemy.hp <= 0) {
        enemy.hp = 0
        enemyStats();
        winSound();
        money();
        xp();
        levelUp();
        playerStats();
        $("#char-logs").prepend("<p>Congratulations! You Win!</p>");
        $("#enemy-logs").prepend("<p>Fasaki is dead!</p>");
        btn.hide();
        $("#reset").show();
      }
    }
  }

  // Restart Battle //
  $("#reset").click(function() {
    window.location.reload();
  });
}