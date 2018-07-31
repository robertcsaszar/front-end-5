var calculate = function() {
  a = 5;
  b = 10;
  c = a + b;
  return c
}

console.log("Calculate C: ", calculate());

var randomObjects = [1, 2, 3, 4, 5, 6, "Lemne", "Povesti"];
var pickAnObject = randomObjects[Math.floor(Math.random() * randomObjects.length)];

console.log("Random Object: ", pickAnObject)

var randomStuff = [
  {
    name: "Something",
    age: 10
  },
  {
    name: "Anything",
    age: 15
  },
  "Nothing", 1, 6, 7
];
var pickRandomStuff = randomStuff[Math.floor(Math.random() * randomStuff.length)];

console.log("Random Stuff: ", pickRandomStuff);

var robot = {
  name: "Robotel",
  weight: 150,
  height: 4,
  sayHello: function() {
    console.log("Hello friend!")
  },
  sayHiTo: function(name) {
    console.log("Hello " + name + "!")
  },
  run: function(){
    console.log("The robot is running")
  },
  hit: function(){
    console.log("The robot hits the wall!")
  },
  hitSomeone: function(name) {
    console.log("The robot hits " + name + "!")
  }
}

console.log("This is my robot: ", robot);
