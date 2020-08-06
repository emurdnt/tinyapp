const { assert } = require('chai');
const {
  generateRandomString,
  urlsForUser,
  getUserByEmail,
  doesUserEmailExist,
  doesPasswordMatch
} = require('../helpers');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  },
  "aJ48lW": {
    id: "aJ48lW", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  },
  "user3RandomID":{ id: 'user3RandomID',
  email: 'em@em.com',
  password:
   '$2b$10$.bTI27Q.mFdG1O6DOO8cpuV4HLFSUmYdf6PJ2cl6TP4Tlx1M11s/6' }
};

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "userRandomID" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" },
  Gb023R: { longURL: "https://www.aritzia.com", userID: "aJ48lW" },
  dHrpI0: { longURL: "https://www.lululemon.com", userID: "aJ48lW" },
  hjIeR7: { longURL: "https://www.abs-cbn.com", userID: "aJ48lW" }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    assert.equal(user,expectedOutput);
  });

  it('should return an empty string with an  invalid email', function() {
    const user = getUserByEmail("user3@example.com", testUsers)
    const expectedOutput = "";
    assert.equal(user,expectedOutput);
  });
});

describe('generateRandomString', function() {
  it('should return a 6 letter string', function() {
    const urlId = generateRandomString()
    assert.equal(urlId.length,6);
  });

});

describe('urlsForUser', function() {
  it('should return an array of url objects when given a valid user_id', function() {
    const urls = urlsForUser('aJ48lW', urlDatabase)
    const result = [{
      shortURL:"i3BoGr",
      longURL: "https://www.google.ca",
    },
    {
      shortURL:"Gb023R",
      longURL: "https://www.aritzia.com"
    },
    {
      shortURL:"dHrpI0",
      longURL: "https://www.lululemon.com",
    },
    {
      shortURL:"hjIeR7",
      longURL: "https://www.abs-cbn.com",
    }]
    assert.deepEqual(urls,result);
  });

  it('should return an empty array when given a valid user_id that has not shortened any links', function() {
    const urls = urlsForUser('user2RandomID', urlDatabase);
    const result = [];
    assert.deepEqual(urls,result);
  });

  it('should return an empty array when given a invalid user_id', function() {
    const urls = urlsForUser('user10RandomID', urlDatabase);
    const result = [];
    assert.deepEqual(urls,result);
  });

});

describe('doesUserEmailExist', function() {
  it('should return true when given an email that already exists', function() {
    const exists = doesUserEmailExist('user2@example.com', testUsers);
    assert.isTrue(exists);
  });

  it('should return false when given an email that is not in our users', function() {
    const exists = doesUserEmailExist('user10@example.com', testUsers);
    assert.isFalse(exists);
  });

});

describe('doesPasswordMatch', function() {
  it('should return true when given an password that matches', function() {
    const exists = doesPasswordMatch('test', testUsers);
    assert.isTrue(exists);
  });

  it('should return false when given password that doesn\'t match', function() {
    const exists = doesPasswordMatch('hdjslalsjdnfksk', testUsers);
    assert.isFalse(exists);
  });

});

