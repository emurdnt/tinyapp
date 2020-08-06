const express = require("express");
const bcrypt = require('bcrypt');
const methodOverride = require('method-override'); 
const app = express();
const PORT = 8080; 
const bodyParser = require("body-parser");

const {
  generateRandomString,
  urlsForUser,
  getUserByEmail,
  doesUserEmailExist,
  doesPasswordMatch,
  getCurrentDate,
  generateUserId
} = require('./helpers');

const cookieSession = require('cookie-session');

app.use(methodOverride('_method'));

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW", date: "31/10/2019", },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW", date: "31/10/2019" }
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
  const shortened = urlDatabase[req.params.id];
  if(shortened){
    res.redirect(urlDatabase[req.params.id]['longURL']);  
  } else {
    let templateVars = {
      user: users[req.session.user_id],
      error: "URL does not exist"
    };
    res.render("urls_new", templateVars);
  }
});

/*
  Render the New Urls Page but prevent the user that are not logged in.
*/ 
app.get("/urls/new", (req, res) => {
  const loggedUser = users[req.session.user_id];

  if(loggedUser){
    let templateVars = {
      user: loggedUser,
      error:""
    };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
  
});

/*
  Render the short url page but prevent the user that are not logged in and does not own the url.
*/ 
app.get("/urls/:id", (req, res) => {
  if(urlDatabase[req.params.id]){
    let templateVars = {
      shortURL: req.params.id, 
      longURL: urlDatabase[req.params.id]['longURL'],
      id: urlDatabase[req.params.id]['userID'],
      user: users[req.session.user_id],
      error:""
    };
    res.render("urls_show", templateVars);
  } else {
    let templateVars = {
     error: "URL ID does not exist",
     user: users[req.session.user_id]
    };
    res.render("urls_show", templateVars);
  }
});

/*
  Render the login page.
*/ 
app.get("/login", (req, res) => {
  const loggedUser = users[req.session.user_id];
  if(loggedUser){
    res.redirect("/urls");
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
  
  if(loggedUser){
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
  let templateVars = {
    urls: shortenedLinks,
    user: users[req.session.user_id],
  };
  res.render("urls_index", templateVars);
});

/*
  Delete a URL  
*/ 
app.delete("/urls/:id/delete", (req, res) => {
  const loggedUser = users[req.session.user_id];

  if(loggedUser){
    const shortURL = req.params.id;
    delete urlDatabase[shortURL];
    res.redirect('/urls');
    //send a more userfriendly message here when it's deleted
  } else {
    res.redirect("/login");
  }
});

/*
  Showing a specific URL  
*/ 
app.post("/urls/:id", (req, res) => {
  const loggedUser = users[req.session.user_id];

  if(loggedUser){
    const shortURL = req.params.id;
    urlDatabase[shortURL]['longURL'] = req.body.longURL;
    res.redirect('/urls');
  } else {
    res.redirect("/login");
  }

});

/*
  Login
*/ 
app.put("/login", (req, res) => {
  const {email, password} = req.body;
  let userFound = doesUserEmailExist(email, users);
  let passMatch = doesPasswordMatch(password, users);

  if (!userFound) {
    res.status(403);
    res.redirect('/login');
  } else if (userFound) {
    if (passMatch) {
      req.session.user_id = getUserByEmail(email, users);
      res.redirect('/urls');
    } else {
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
  const {email, password} = req.body;
  let userExists = doesUserEmailExist(req.body.email, users);
  if (email === '' || password === '') {
    res.status(404);
    res.redirect('/register');
  } else if (userExists) {
    res.status(404);
    res.redirect('/register');
  } else {
    if (!userExists) {
      const newUserId = generateUserId(users);

      const inputPassword = password;
      const hashedPassword = bcrypt.hashSync(inputPassword, 10);

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
  const loggedUser = users[req.session.user_id];

  if(loggedUser){
    let shortURL = generateRandomString();
    urlDatabase[shortURL] = {
      'longURL': req.body.longURL,
      'userID': users[req.session.user_id]['id'],
      'date': getCurrentDate()
    };
    res.redirect('/urls/' + shortURL);  
  } else {
    res.redirect("/login");
  }
  
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
