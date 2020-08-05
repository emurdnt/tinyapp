const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const { response } = require("express");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "test"
  }
}


app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));

function generateRandomString() {
  let result = '';
  let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for ( var i = 1; i <= 6; i++ ) {
     result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
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
  res.redirect(urlDatabase[req.params.shortURL]);  
});

//new urls
app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
    user: users[req.cookies["user_id"]]
  };
  console.log(templateVars);
  res.render("urls_new",templateVars);
});

//shortened url
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL, 
    longURL:urlDatabase[req.params.shortURL],
    username: req.cookies["username"],
    user: users[req.cookies["user_id"]]
  };

  res.render("urls_show", templateVars);
  
});

//show all the urls
app.get("/register", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_register", templateVars);
});

//show all the urls
app.get("/urls", (req, res) => {
  let templateVars = { 
    urls: urlDatabase,
    username: req.cookies["username"],
    user: users[req.cookies["user_id"]]
   };
  res.render("urls_index", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
  //send a more userfriendly message here when it's deleted
});


app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect('/urls');
});


app.post("/login", (req, res) => {
  //var value = res.body.username;
  //grab the vaalue in the input
  //assign it to a cookie
  const user = req.body.username;
  res.cookie('username',user);
  res.redirect('/urls');  
 
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls'); 
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
      users[newUserId] = {
        'id': newUserId,
        'email': req.body.email,
        'password': req.body.password
      }
      res.cookie('user_id',newUserId);
      res.redirect('/urls/');
    }
  }
  
});

app.post("/urls", (req, res) => {
  //generate string;
  let shortURL = generateRandomString();
  //add to object
  //maybe do checks here later
  urlDatabase[shortURL] = req.body.longURL;
  //redirect
  //check if the url has value
  res.redirect('/urls/' + shortURL);  
 
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
