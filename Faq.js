
const express = require('express');
const app = express();
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');

app.use(bodyParser.json());
app.use(cors());

const con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'user_auth'
});

app.post("/addquestions", (req, res) => {
    const { question, answer } = req.body; // Extract question and answer from request body
    con.query("INSERT INTO faqs (question, answer) VALUES (?, ?)", [question, answer], (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send("Error occurred");
        } else {
            console.log("Values Inserted");
            res.status(200).send("Values Inserted");
        }
    });
});


app.listen(2000, () => {
    console.log('Server is running on port 2000');
});

app.get("/questions", (req, res) => {
    con.query("SELECT * FROM faqs", (err, result) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(200).send(result);
        }
    });
});
