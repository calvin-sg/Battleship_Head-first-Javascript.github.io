/* done
1. Grey out form input after game over
2. Keep log of cells already guessed by user, and prevent repeated guesses
*/

// keep display up to date with messages, hits and misses
var view = {

    // takes in a string message and display in messageArea
    displayMessage: function(msg) {
        var messageArea = document.getElementById("messageArea");
        messageArea.innerHTML = msg; // updates messageArea element by setting its innerHTML to msg
    },
    displayHit: function(location) {
        // location created from row and column, matches id of a <tr> element
        var cell = document.getElementById(location);
        cell.setAttribute("class","hit");
    },
    displayMiss: function(location) {
        var cell = document.getElementById(location);
        cell.setAttribute("class","miss");
    }
};

// keeps state of game, contains logic relates to state changes
// display: notifies view of state changes to be displayed to user
var model = {
    boardSize: 7,
    numShips: 3, // allows number of ships to be changed as a property
    shipLength: 3,
    shipSunk: 0, // keep track of number of ships sunk by player

    /*// hardcoded
    ships: [
        { locations: ["06", "16", "26"], hits: ["", "", ""] },
        { locations: ["24", "34", "44"], hits: ["", "", ""] },
        { locations: ["10", "11", "12"], hits: ["", "", ""] }
    ],*/

    // Stores location and hits of ships in hits array, starting with initial state
    ships: [
        { locations: [0, 0, 0], hits: ["", "", ""] },
        { locations: [0, 0, 0], hits: ["", "", ""] },
        { locations: [0, 0, 0], hits: ["", "", ""] }
    ],

    generateShipLocation: function () {
        var locations;
        for (var i = 0; i < this.numShips; i++) { // iterates, generates location for each ship
            do { // while loop executed at least once
                locations = this.generateShips(); // first, generates new sets of location as array
            } while (this.checkCollision(locations)); // then check if location generated overlaps with existing ships
            this.ships[i].locations = locations; // assigns generated location to ship's location property in model.ships array
        }
    },

    generateShips: function () {
        var direction = Math.floor(Math.random() *2); // generates integer 0 or 1
        var row, col;

        // vertical: 0, horizontal: 1
        if (direction === 1) {
            // generate starting location for horizontal ship
            row = Math.floor(Math.random() * this.boardSize);
            col = Math.floor(Math.random() * (this.boardSize - this.shipLength)); // to leave room for next 2 locations
        } else {
            // generate starting location for vertical ship
            row = Math.floor(Math.random() * (this.boardSize - this.shipLength)); // to leave room for next 2 locations
            col = Math.floor(Math.random() * this.boardSize);
        }

        // starts with empty array, locations added one by one
        var newShipLocations = [];

        // iterates for number of locations in a ship, starting from 0
        for (var i = 0; i < this.shipLength; i++) {
            if (direction === 1) {
                // add locations to array for new horizontal ship
                newShipLocations.push(row + "" + (col+i)); // i.e. 01, 02, 03
            } else {
                // add locations to array for new vertical ship
                newShipLocations.push((row+i) + "" + col); // i.e. 21, 31, 41
            }
        }
        return newShipLocations; // returns array of generated ship locations
    },

    // checks for overlaps between newly generated locations ang existing locations with nested for loop
    checkCollision: function (locations) {

        // iterates through existing ships on the board
        for (var i = 0; i < this.numShips; i++) {
            var ship = model.ships[i];

            // iterates through new locations generated
            for (var j = 0; j < locations.length; j++) {

                // takes existing location and searches generated location array, returns index if found
                // if more than 0, matched existing location, i.e. collision!
                if (ship.locations.indexOf(locations[j]) >= 0) {
                    return true; // if condition is true, stops iteration at return statement and exits function
                }
            }
        }
        return false; // no collision found within nested for loops
    },

    // function accepts userGuess, checks whether a hit or miss occurred
    fire: function (userGuess) {

        // iterates and checks through 3 ships on game board
        for (var i = 0; i < this.numShips; i++) {
            var ship = this.ships[i]; // get ship object

            // location as a temporary variable
            // get location of ship as an array
            locations = ship.locations;

            // checks if userGuess matches ship location
            // takes userGuess and searches location array, returns index if found or returns -1 if not found
            var index = locations.indexOf(userGuess);

            // condition is true if userGuess is in location array
            if (index >= 0){
                // hit!
                ship.hits[index] = "hit";
                view.displayHit(userGuess); // display: notifies view of a hit on location of userGuess
                view.displayMessage("HIT!") // notifies view to display message
                if(this.isSunk(ship)){
                    this.shipSunk++;
                }
                return true; // return true for fire function if hit, for controller.userGuess
            }
        }
        view.displayMiss(userGuess); // display: notifies view of a miss on location of userGuess
        view.displayMessage("You missed.") // notifies view to display message
        return false; // return false for fire function if miss, for controller.userGuess
    },

    // keeps track of locations of ships hit
    // when all locations on ships lengths are hit, ship is sunk
    isSunk: function (ship) {

        // iterates through every location within a ship
        for (var i = 0; i < this.shipLength; i++) {

            // check if there are any location left on a ship not hit
            if (ship.hits[i] !== "hit") {
                return false;
            }
        }
        return true;
    }
};

// keeps tracks of user's guess, progress, user input and brings to model
var controller = {

    // 2-keeps tracks of number of guesses
    countGuesses: 0,

    // 1-get and parse user's guess
    processGuess: function (userGuess) {
        var location = parseGuess(userGuess); // takes in parsed userGuess, e.g. 12

        // 6 falsey values: null, undefined, 0, "", [], {}
        // returns true if not null (null is falsey)
        if (location) {
            this.countGuesses++; // increments number of guesses so far

            // 3-notifies model to update
            // returns true if userGuess is a hit
            var hit = model.fire(location);

            // 4-determines if all ships are sunk, i.e. game over
            if (hit && // if userGuess is a hit and
                model.shipSunk === model.numShips) { // number of ships sunk is equals to number of ships on the board

                view.displayMessage("All ships on the board is sunk, in " + this.countGuesses + " guesses. Refresh the page to try again!");

                // disables form input and button after game over
                var userGuessInput = document.getElementById("guessInput");
                userGuessInput.setAttribute("disabled", "disabled");

                var fireButton = document.getElementById("fireButton");
                fireButton.setAttribute("disabled", "disabled");
            }
        }
    }
};

// keeps tracks of user guesses, to prevent and notify user of repeated guesses
var storeUserGuesses= {
    previousUserGuess: []
}

function parseGuess(guess) {
    var alphabet = ["A", "B", "C", "D", "E", "F", "G"];

    if (guess === null || guess.length !== 2){
        alert("Oops! Please enter a valid entry of a letter and number, e.g. A0");
    } else {
        var firstChar = guess.charAt(0); // grabs first character of user's guess

        // takes firstChar and searches alphabet array, returns index if found or -1 if not found
        var row = alphabet.indexOf(firstChar);

        var column = guess.charAt(1); // grabs second character of user's guess

        // checks parsed first character and second character is valid
        if (isNaN(row) || isNaN(column)) {
            alert("Oops! Please enter a valid entry that is on the board (letter and number, e.g. A0)");
        }
        // check row/column numbers are from 0 to board size (6)
        else if (row < 0 ||
            row >= model.boardSize ||
            column < 0 ||
            column >= model.boardSize) {
            alert("Oops! Please enter a valid entry that is on the board (letter and number, e.g. A0)");
        } else {
            return row + column; // concatenates parsed row + column as string, e.g. 12
        }
    }
}

// event handlers
// called whenever button is clicked
function handleFireButton() {

    // grabs user guess from form input, upon button click
    var userGuessInput = document.getElementById("guessInput");
    // element's value property gets value from form input text element
    var userGuess = userGuessInput.value.trim().toUpperCase();

    // takes userGuess and searches previousUserGuess array, returns index if found or -1 if not found
    if (storeUserGuesses.previousUserGuess.indexOf(userGuess) >= 0) {
        userGuessInput.value = ""; // resets form input element to empty string
        alert("You've entered a repeated guess. Try another!");
    } else {
        storeUserGuesses.previousUserGuess.push(userGuess); // adds new userGuess to previousUserGuess array
        controller.processGuess(userGuess); // brings user guess to controller
        userGuessInput.value = ""; // resets form input element to empty string
    }
}
// event handler called whenever key is pressed in HTML input field
function handleKeyPress(event) {
    var fireButton = document.getElementById("fireButton");

    // when user press return key in form input, event's keyCode property set to 13
    if (event.keyCode === 13) {
        fireButton.click(); // causes fire button to be clicked
        return false; // so form do not do anything else (e.g. submit itself)
    }
}

/*// debugging for view()
view.displayHit("13");
view.displayMiss("26");
view.displayHit("42");
view.displayMiss("05");
view.displayMessage("Hello?");*/

/*// debugging for model()
model.fire("53"); // miss

model.fire("06"); // hit
model.fire("16"); // hit
model.fire("26"); // hit

model.fire("34"); // hit
model.fire("24"); // hit
model.fire("44"); // hit

model.fire("12"); // hit
model.fire("11"); // hit
model.fire("10"); // hit*/

/*// debugging for parseGuess()
console.log("Testing parseGuess");
console.log(parseGuess("A0"));
console.log(parseGuess("B6"));
console.log(parseGuess("G3"));
console.log(parseGuess("H0")); // invalid
console.log(parseGuess("A7")); // invalid*/

/*// debugging for controller
controller.processGuess("A0"); // miss

controller.processGuess("A6"); // hit
controller.processGuess("B6"); // hit
controller.processGuess("C6"); // hit

controller.processGuess("C4"); // hit
controller.processGuess("D4"); // hit
controller.processGuess("E4"); // hit

controller.processGuess("B0"); // hit
controller.processGuess("B1"); // hit
controller.processGuess("B2"); // hit*/

// called only when the page has completed loading
function init() {

    // handles onclick Fire! button
    var fireButton = document.getElementById("fireButton"); // button id
    fireButton.onclick = handleFireButton;

    // handles keypress events (return key) in HTML input field
    var userGuessInput = document.getElementById("guessInput");
    userGuessInput.onkeypress = handleKeyPress;

    // places ships on game board
    model.generateShipLocation();
}

window.onload = init;