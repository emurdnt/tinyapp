const bcrypt = require('bcrypt');
function generateRandomString() {
  let result = '';
  let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for ( var i = 1; i <= 6; i++ ) {
     result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function generateUserId(database){
  //got this from stackOverflow
  //https://stackoverflow.com/questions/4317456/getting-the-last-item-in-a-javascript-object
  const lastUser = database[Object.keys(database)[Object.keys(database).length - 1]]['id'];
  console.log(lastUser);
  const num = Number(lastUser.substr(4,1)) + 1; 

 return 'user'+num+'RandomID';
}

function urlsForUser(id,database){
  let urls = [];
  let details = {};
  for(let entry in database){
    let urlDetails = database[entry];
    if(urlDetails['userID'] === id){
      details = {
        'shortURL': entry,
        'longURL': urlDetails['longURL']
      }
      urls.push(details);
    }
  }
  return urls;
}


function findUserID(email,database){
  let userId = "";
  for(let user in database){
    let userDetails = database[user];
    if(userDetails['email'] === email){
       userId = userDetails['id'];
    }
  }
  return userId;
}

function doesUserEmailExist(email,database){
  let userExists = false;
  for(let user in database){
    let userDetails = database[user];
    if(userDetails['email'] === email){
      userExists = true; 
    }
  }
  return userExists;
}

function doesPasswordMatch(password,database){
  let match = false;
  for(let user in database){
    let userDetails = database[user];
    if(bcrypt.compareSync(password, userDetails['password'])){
      match = true; 
    }
  }
  return match;
}



module.exports = {
  generateRandomString,
  urlsForUser,
  findUserID,
  doesUserEmailExist,
  doesPasswordMatch,
  generateUserId
}