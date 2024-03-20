const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
const jsonwebtoken = require('jsonwebtoken');
const app = express();
const port = 5000;

app.use(bodyParser.json());
app.use(cors());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'user_auth'
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL: ' + err.stack);
    return;
  }
  console.log('Connected to MySQL as id ' + db.threadId);
});

// Register endpoint
app.post('/register', (req, res) => {
  const { email, password } = req.body;
  const insertQuery = `INSERT INTO users (email, password) VALUES (?, ?)`;
  db.query(insertQuery, [email, password], (err, result) => {
    if (err) {
      console.error('Error registering user: ' + err.stack);
      res.status(500).send('Error registering user');
      return;
    }
    console.log('User registered successfully');
    res.status(200).send('User registered successfully');
  });
});

// Login endpoint
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const selectQuery = `SELECT * FROM users WHERE email = ? AND password = ?`;
  db.query(selectQuery, [email, password], (err, result) => {
    if (err) {
      console.error('Error logging in: ' + err.stack);
      res.status(500).send('Error logging in');
      return;
    }
    if (result.length === 0) {
      res.status(401).send('Invalid email or password');
    } else {
      const token = jsonwebtoken.sign({ email }, 'SECRET');
      console.log('User logged in successfully');
      res.status(200).send({ token });
    }
    
  });
});

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  console.log(token)
  if (!token) {
    res.status(401).send('Unauthorized request');
    return;
  }
  const verifiedToken = token.split(' ')[1];
  jsonwebtoken.verify(verifiedToken, 'SECRET', (err,
    decoded) => {
      if (err) {
        res.status(401).send('Unauthorized request');
        return;
      }
      req.decoded = decoded;
      console.log(req.decoded);
      next();
    }
    );
  } 

app.get('/news', verifyToken, (req, res) => {
  const selectNewsQuery = `SELECT main_title, main_content, sub_title1, sub_content1, sub_title2, sub_content2 FROM news`;
  db.query(selectNewsQuery, (err, result) => {
    if (err) {
      console.error('Error fetching news: ' + err.stack);
      res.status(500).send('Error fetching news');
      return;
    }
    console.log('News fetched successfully');
    res.status(200).json(result);
  });
});

app.get('/news/:id', (req, res) => {
  const { id } = req.params;
  const selectNewsQuery = `SELECT main_title, main_content, sub_title1, sub_content1, sub_title2, sub_content2 FROM news WHERE id =?`;
  db.query(selectNewsQuery, [id], (err, result) => {
    if (err) {
      console.error('Error fetching news: ', err);
    } else{
      if( result.length > 0) {
        res.status(200).send(result[0]);

      } else {
        res.status(500).send('Error fetching news');
    }
      
     }
  })
})

app.post("/logout", verifyToken, (req, res) => {
  res.status(200).send("Logged out successfully");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
