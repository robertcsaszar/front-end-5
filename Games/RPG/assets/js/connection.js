var sylvanasBtn = $("#sylvanas:checked");
var maievBtn = $("#maiev:checked");
var illidanBtn = $("#illidan:checked");

function sylvanasCheck() {
  if (sylvanasBtn) {
    check_value = $('#sylvanas:checked').val();
    if(characters[1].select === 0) {
      characters[0].select = 1
    } else if (characters[2].select === 0) {
      characters[0].select = 1
    } else {
      characters[0].select = 1
    }
  }
}

function maievCheck() {
  if (maievBtn) {
    check_value = $('#sylvanas:checked').val();
    if(characters[2].select === 0) {
      characters[1].select = 1
    } else if (characters[0].select === 0) {
      characters[1].select = 1
    } else {
      characters[1].select = 1
    }
  }
}

function illidanCheck() {
  if (illidanBtn) {
    check_value = $('#sylvanas:checked').val();
    if(characters[0].select === 0) {
      characters[2].select = 1
    } else if (characters[1].select === 0) {
      characters[2].select = 1
    } else {
      characters[2].select = 1
    }
  }
}