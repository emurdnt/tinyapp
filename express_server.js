const express = require("express");
const app = express();
const bcrypt = require('bcrypt');
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
//const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
//const { response } = require("express");


const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};


const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    //date: "31/10/2019",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    //date: "31/10/2019",
    password: "test"
  }
}


//app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', "key2"]
}));


function generateRandomString() {
  let result = '';
  let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for ( var i = 1; i <= 6; i++ ) {
     result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function urlsForUser(id){
  let urls = [];
  let details = {};
  for(let entry in urlDatabase){
    let urlDetails = urlDatabase[entry];
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


function findUserID(email){
  let userId = "";
  for(let user in users){
    let userDetails = users[user];
    if(userDetails['email'] === email){
       userId = userDetails['id'];
    }
  }
  return userId;
}
function doesUserEmailExist(email){
  let userExists = false;
  for(let user in users){
    let userDetails = users[user];
    if(userDetails['email'] === email){
      userExists = true; 
    }
  }
  return userExists;
}

function doesPasswordMatch(password){
  let match = false;
  for(let user in users){
    let userDetails = users[user];
    if(bcrypt.compareSync(password, userDetails['password'])){
      match = true; 
    }
  }
  return match;
}
function generateUserId(){
  //got this from stackOverflow
  //https://stackoverflow.com/questions/4317456/getting-the-last-item-in-a-javascript-object
  const lastUser = users[Object.keys(users)[Object.keys(users).length - 1]]['id'];
  const num = Number(lastUser.substr(4,1)) + 1; 

 return 'user'+num+'RandomID';
}

app.set("view engine", "ejs") ;

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
//redirect the shortened url to the long url
app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL]['longURL']);  
});

//new urls
app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: users[req.session.user_id]
  };
  console.log(templateVars);
  res.render("urls_new",templateVars);
});

//shortened url
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL, 
    longURL:urlDatabase[req.params.shortURL]['longURL'],
    id:urlDatabase[req.params.shortURL]['userID'],
    user: users[req.session.user_id]
  };
  console.log(urlDatabase, templateVars);
  res.render("urls_show", templateVars);
});

//login
app.get("/login", (req, res) => {
  let templateVars = {
    user: users[req.session.user_id]
  };
  res.render("urls_login", templateVars);
});


//resgister
app.get("/register", (req, res) => {
  let templateVars = {
    user: users[req.session.user_id]
  };
  res.render("urls_register", templateVars);
});

//show all the urls
app.get("/urls", (req, res) => {
  //check if they're logged in here or redirect to 
  
  let shortenedLinks = urlsForUser(req.session.user_id);
  // console.log(users);
  let templateVars = { 
    urls: shortenedLinks,
    user: users[req.session.user_id]
   };

   console.log(templateVars);
  res.render("urls_index", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  console.log(shortURL, req.params);
  console.log(urlDatabase);
  delete urlDatabase[shortURL];
  res.redirect('/urls');
  //send a more userfriendly message here when it's deleted
});


app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  urlDatabase[shortURL]['longURL'] = req.body.longURL;
  res.redirect('/urls');
});


app.post("/login", (req, res) => {
  //var value = res.body.username;
  //grab the vaalue in the input
  //assign it to a cookie
  const email = req.body.email;
  let userFound = doesUserEmailExist(email);
  let passMatch = doesPasswordMatch(req.body.password);

  if(!userFound){
    console.log("User not found");
    res.status(403);
    res.redirect('/login');
  } else if (userFound){
    console.log("User email found");
    if(passMatch){
      console.log("success!");
      req.session.user_id = findUserID(email);
      res.redirect('/urls');  
    } else {
      console.log("pass not match");
      res.redirect('/login');  
    }
  }

});

app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect('/login');
});

app.post("/register", (req, res) => {
  //check if it exists
  //check is email and password exists
  let userExists = doesUserEmailExist(req.body.email);
  if(req.body.email === '' || req.body.password === ''){
    //add message in the front end
    res.status(404);
    res.redirect('/register');
  }else if(userExists){
    res.status(404);
    //maybe redirect to login and then show message
    res.redirect('/register');
  } else {
    if(!userExists){
      console.log("adding to server a user");
      const newUserId = generateUserId();

      const password = req.body.password;
      const hashedPassword = bcrypt.hashSync(password, 10);
      //hash the password
      //encrypt the email and user id
      users[newUserId] = {
        'id': newUserId,
        'email': req.body.email,
        'password': hashedPassword
      }
      req.session.user_id = newUserId;
      res.redirect('/urls/');
    }
  }
  
});

app.post("/urls", (req, res) => {
  //generate string;
  let shortURL = generateRandomString();
  //add to object
  //maybe do checks here later
  urlDatabase[shortURL] ={
    'longURL':req.body.longURL,
    'userID': users[req.session.user_id]['id']
  } 

  // console.log(urlDatabase);
  //redirect
  //check if the url has value
  res.redirect('/urls/' + shortURL);  
 
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
