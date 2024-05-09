// Character prototype
function Character(name, health) {
    this.name = name;
    this.health = health;
  }
  
  Character.prototype.printStats = function() {
    console.log(`${this.name} Remaining Health: ${this.health}`);
  };
  
  // Player constructor
  function Player(name, health, level) {
    // Implement inheritance
    Character.call(this, name, health);
    this.level = level;
  }
  
  Player.prototype = Object.create(Character.prototype);
  Player.prototype.constructor = Player;
  
  // Enemy constructor
  function Enemy(name, health) {
    // Implement inheritance
    Character.call(this, name, health);
  }
  
  Enemy.prototype = Object.create(Character.prototype);
  Enemy.prototype.constructor = Enemy;
  
  // Implement levelUp method for Player
  Player.prototype.levelUp = function(){
    this.level++;
    this.health += 10;
    console.log(`${this.name} is now level ${this.level}!`);
  }
  
  
  // Implement attack method for Enemy
  Enemy.prototype.attack = function(target) {
    console.log(`${this.name} attacks ${target.name}!`);
    target.health -= 10; 
    if (target.health <= 0) {
      console.log(`${target.name} is dead!`);
    }
  };
  
  Player.prototype.attack = function(target) {
    console.log(`${this.name} attacks ${target.name}!`);
    target.health -= 5;
    if (target.health <= 0) {
      console.log(`${target.name} is dead!`);
    }
  }
  
  // Create instances and demonstrate functionalities
  const player = new Player("Hero", 100, 1);
  const enemy = new Enemy("Monster", 50);
  
  // Demonstrate functionalities
  player.printStats();
  enemy.printStats();
  // Perform attacks, level up, etc.
  enemy.attack(player);
  player.attack(enemy);
  player.levelUp();