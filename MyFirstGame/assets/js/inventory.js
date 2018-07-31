Inventory = function(){
    var self = {
        items:[] //{id:"itemId",amount:1}
    }
    self.addItem = function(id,amount){
		for(var i = 0 ; i < self.items.length; i++){
			if(self.items[i].id === id){
				self.items[i].amount += amount;
				self.refreshRender();
				return;
			}
		}
		self.items.push({id:id,amount:amount});
		self.refreshRender();
    }
    self.removeItem = function(id,amount){
		for(var i = 0 ; i < self.items.length; i++){
			if(self.items[i].id === id){
				self.items[i].amount -= amount;
				if(self.items[i].amount <= 0)
					self.items.splice(i,1);
				self.refreshRender();
				return;
			}
		}    
    }
    self.hasItem = function(id,amount){
		for(var i = 0 ; i < self.items.length; i++){
			if(self.items[i].id === id){
				return self.items[i].amount >= amount;
			}
		}  
		return false;
    }
	self.refreshRender = function(){
		var str = "";
		for(var i = 0 ; i < self.items.length; i++){
			let item = Item.List[self.items[i].id];
			let onclick = "Item.List['" + item.id + "'].event()";
			str += "<button onclick=\"" + onclick + "\">" + item.name + " x" + self.items[i].amount + "</button><br>";
		}

		document.getElementById("inventory").innerHTML = str;
	}


	return self;
}


Item = function(id, name, event) {
  var self = {
    id: id,
    name: name,
    event: event
  }
  Item.List[self.id] = self;
  return self;
}

Item.List = {};

// Character items //
Item("helm", "Training Helm", function(){
  mainCharacter.hpMax += helm.hpMax;
  mainCharacter.defense += helm.defense;
});
Item("amulet", "Training Amulet", function(){
  mainCharacter.hpMax += amulet.hpMax;
  mainCharacter.manaMax += amulet.manaMax;
});
Item("shoulder", "Training Shoulder", function(){
  mainCharacter.hpMax += shoulder.hpMax;
  mainCharacter.defense += shoulder.defense;
});
Item("cloak", "Training Cloak", function(){
  mainCharacter.hpMax += cloak.hpMax;
  mainCharacter.defense += cloak.defense;
});
Item("chest", "Training Chest", function(){
  mainCharacter.hpMax += chest.hpMax;
  mainCharacter.defense += chest.defense;
});
Item("gloves", "Training Gloves", function(){
  mainCharacter.hpMax += gloves.hpMax;
  mainCharacter.defense += gloves.defense;
});
Item("bracelet", "Training Bracelet", function(){
  mainCharacter.hpMax += bracelet.hpMax;
  mainCharacter.manaMax += bracelet.manaMax;
});
Item("pants", "Training Pants", function(){
  mainCharacter.hpMax += pants.hpMax;
  mainCharacter.defense += pants.defense;
});
Item("boots", "Training Boots", function(){
  mainCharacter.hpMax += boots.hpMax;
  mainCharacter.defense += boots.defense;
});
Item("ring", "Training Ring", function(){
  mainCharacter.hpMax += amulet.hpMax;
  mainCharacter.manaMax += amulet.manaMax;
});
Item("weapon", "Training weapon", function(){
  mainCharacter.damage += weapon.damage;
});
Item("shield", "Training Shield", function(){
  mainCharacter.hpMax += shield.hpMax;
  mainCharacter.defense += shield.defense;
});


// Hp & Mana Potions
Item("hpPotion", "HP Potion", function(){
  mainCharacter.hp += healPotion.hp;
  playerInventory.removeItem("hpPotion", 1);
});

Item("manaPotion", "Mana Potion", function(){
  mainCharacter.mana += manaPotion.mana;
  playerInventory.removeItem("manaPotion", 1);
});

playerInventory = Inventory();