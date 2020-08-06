const express = require("express");
const bcrypt = require('bcrypt');
const app = express();
const PORT = 8080; 
const bodyParser = require("body-parser");

const {
  generateRandomString,
  urlsForUser,
  getUserByEmail,
  doesUserEmailExist,
  doesPasswordMatch,
  generateUserId
} = require('./helpers');

const cookieSession = require('cookie-session');

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
};

//app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieSession({
  name: 'session',
  keys: ['key1', "key2"]
}));

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

/*
  Redirect the short URL to the longURL
*/ 
app.get("/u/:id", (req, res) => {
  if(urlDatabase[req.params.shortURL]['longURL']){
    res.redirect(urlDatabase[req.params.shortURL]['longURL']);  
  } else {
    //return error message here
  }
});

/*
  Render the New Urls Page but prevent the user that are not logged in.
*/ 
app.get("/urls/new", (req, res) => {
  const loggedUser = users[req.session.user_id];

  if(user){
    let templateVars = {
      user: loggedUser
    };
    //console.log(templateVars);
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
  
});

/*
  Render the short url page but prevent the user that are not logged in and does not own the url.
*/ 
app.get("/urls/:id", (req, res) => {

  if(urlDatabase[req.params.shortURL]['longURL']){
    let templateVars = {
      shortURL: req.params.shortURL, 
      longURL: urlDatabase[req.params.shortURL]['longURL'],
      id: urlDatabase[req.params.shortURL]['userID'],
      user: users[req.session.user_id]
    };

    res.render("urls_show", templateVars);
  } else {
    //return error message here
    //maybe initialize template vars with an error message instead & check for errors
  }
});

/*
  Render the login page.
*/ 
app.get("/login", (req, res) => {
  const loggedUser = users[req.session.user_id];

  if(user){
    res.redirect("/login");
  } else {
    let templateVars = {
      user: loggedUser
    };
    res.render("urls_login", templateVars);
  }
  
});


/*
  Render the register page.
*/ 
app.get("/register", (req, res) => {
  const loggedUser = users[req.session.user_id];

  if(user){
    res.redirect("/urls");
  } else {
    let templateVars = {
      user: loggedUser
    };
    res.render("urls_register", templateVars);
  }
  
});

/*
  Render the page that shows all the URLs.
*/ 
app.get("/urls", (req, res) => {
  //check if they're logged in here or redirect to 
  let shortenedLinks = urlsForUser(req.session.user_id,urlDatabase);
  // console.log(users);
  let templateVars = {
    urls: shortenedLinks,
    user: users[req.session.user_id]
  };

  console.log(templateVars);
  res.render("urls_index", templateVars);
});

/*
  Delete a URL  
*/ 
app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  console.log(shortURL, req.params);
  console.log(urlDatabase);
  delete urlDatabase[shortURL];
  res.redirect('/urls');
  //send a more userfriendly message here when it's deleted
});

/*
  Showing a specific URL  
*/ 
app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  urlDatabase[shortURL]['longURL'] = req.body.longURL;
  res.redirect('/urls');
});

/*
  Login
*/ 
app.post("/login", (req, res) => {
  //var value = res.body.username;
  //grab the vaalue in the input
  //assign it to a cookie
  //check session cookies
  const {email, password} = req.body;
  let userFound = doesUserEmailExist(email, users);
  let passMatch = doesPasswordMatch(password, users);

  if (!userFound) {
    console.log("User not found");
    res.status(403);
    res.redirect('/login');
  } else if (userFound) {
    console.log("User email found");
    if (passMatch) {
      console.log("success!");
      req.session.user_id = getUserByEmail(email, users);
      res.redirect('/urls');
    } else {
      console.log("pass not match");
      res.redirect('/login');
    }
  }

});

/*
  Logout and clear the cookie session.
*/ 
app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect('/login');
});

/*
  Registering a new user.
*/ 
app.post("/register", (req, res) => {
  //check if it exists
  //check is email and password exists
  const {email, password} = req.body;
  let userExists = doesUserEmailExist(req.body.email, users);
  if (email === '' || password === '') {
    //add message in the front end
    res.status(404);
    res.redirect('/register');
  } else if (userExists) {
    res.status(404);
    //maybe redirect to login and then show message
    res.redirect('/register');
  } else {
    if (!userExists) {
      console.log("adding to server a user");
      const newUserId = generateUserId(users);

      const inputPassword = password;
      const hashedPassword = bcrypt.hashSync(inputPassword, 10);
      //hash the password
      //encrypt the email and user id
      users[newUserId] = {
        'id': newUserId,
        'email': email,
        'password': hashedPassword
      };
      req.session.user_id = newUserId;
      res.redirect('/urls/');
    }
  }
});

/*
  Show all the URLS that the specific user has created.
*/ 
app.post("/urls", (req, res) => {
  //generate string;
  let shortURL = generateRandomString();
  //add to object
  //maybe do checks here later
  urlDatabase[shortURL] = {
    'longURL': req.body.longURL,
    'userID': users[req.session.user_id]['id']
  };

  // console.log(urlDatabase);
  //redirect
  //check if the url has value
  res.redirect('/urls/' + shortURL);  
 
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
