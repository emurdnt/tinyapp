const bcrypt = require('bcrypt');

/*
Function to generate User IDs.
Takes in the the users objects.
Maintains the pattern userNRandomID where N is the number that increments.
Returns a string.
*/
const generateUserId = (database) => {
  //got this from stackOverflow
  //https://stackoverflow.com/questions/4317456/getting-the-last-item-in-a-javascript-object
  const lastUser = database[Object.keys(database)[Object.keys(database).length - 1]]['id'];
  const num = Number(lastUser.substr(4,1)) + 1;

  return 'user' + num + 'RandomID';
};

/*
Function to filter our the URLS by user.
Takes in the ID and the url object.
Returns an array of objects.
*/
const urlsForUser = (id, database) => {
  let urls = [];
  let details = {};
  for (let entry in database) {
    let urlDetails = database[entry];
    if (urlDetails['userID'] === id) {
      details = {
        'shortURL': entry,
        'longURL': urlDetails['longURL'],
        'date': urlDetails['date']
      };
      urls.push(details);
    }
  }
  return urls;
};

/*
Finds the user ID using the email of the user.
Accepts the email and the users objects.
Returns a string.
*/
const getUserByEmail = (email, database) => {
  let userId = "";
  for (let user in database) {
    let userDetails = database[user];
    if (userDetails['email'] === email) {
      userId = userDetails['id'];
    }
  }
  return userId;
};

/*
Checks if the email already exists in the users object.
Accepts an email and the users object.
Returns a boolean.
*/
const doesUserEmailExist = (email,database) => {
  let userExists = false;
  for (let user in database) {
    let userDetails = database[user];
    if (userDetails['email'] === email) {
      userExists = true;
    }
  }
  return userExists;
};

/*
Checks if the password typed matches the password in the users object.
Accepts an password and the users object.
Returns a boolean.
*/
const doesPasswordMatch = (password, database) => {
  let match = false;
  for (let user in database) {
    let userDetails = database[user];
    if (bcrypt.compareSync(password, userDetails['password'])) {
      match = true;
    }
  }
  return match;
};


module.exports = {
  urlsForUser,
  getUserByEmail,
  doesUserEmailExist,
  doesPasswordMatch,
  generateUserId
};