const express = require('express');
const mysql = require('mysql');
const path = require('path');
const upload = require('express-fileupload');
const parser = require('body-parser');
const session = require('express-session');
const app = express();

app.use(parser());
app.use(session({
    secret: 'ssshhhhh',
    resave: false,
    saveUninitialized: false
}))

app.use(express.static(path.join(__dirname, 'public')));

//Create connection
const con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'mealfinder'
});
//Connect database
con.connect((err) => {
    if(err){
        throw err;
    }
    console.log('Mysql is connected...');
});

app.get('/', (req, res) => {
    res.sendFile(__dirname+'/homepage.html')
});

app.get('/signin', (req, res) => {
    res.sendFile(__dirname+'/signin.html')
});

app.get('/signup', (req, res) => {
    res.sendFile(__dirname+'/signup.html')
});

app.get('/admin', (req, res) => {
    res.sendFile(__dirname+'/adminpage.html')
});



app.post('/signin',(req, res) => {
    console.log('Login request;');
    let sql = `SELECT * FROM user_info WHERE email = '${req.body.email}'`;
    let query = con.query(sql, (err, result) => {
        if(err){ //Query is success
            console.log(err);
            res.redirect('/signin');
        }
        else{ //Query is not success
            if(result.length == 0) {//There is no email
                res.redirect('/signin');
            }
            else {//There is an email
                if(result[0].password == req.body.password) {//Login is valid
                    sess = req.session;
                    sess.email = result[0].email;
                    sess.rank = result[0].rank;
                    sess.fullName = result[0].fullName;
                    if(result[0].rank == 'admin'){
                        res.redirect('/admin');
                    }
                    else if(result[0].rank == 'client'){
                        res.redirect('/');
                    }
                }
                else { //Log in is invalid
                    res.redirect('/signin');
                }
            }
        }
    })
})

app.get('/checksession', (req, res) => {

    sess = req.session

    res.send(JSON.stringify(sess))
})

app.get('/logout', (req, res) => {
    req.session.destroy( (err) => {
        if(err){
            console.log(err)
        }
        else{
            res.redirect('/signin');
        }
    })
})

app.get('/getuser', (req, res) => {
    res.sendFile(__dirname+'/getuser.html')
})

app.get('/qgetuser', (req, res) => {

    let sql = `SELECT * FROM user_info WHERE 1`;
    let query = con.query(sql, (err, results) => {
        res.send(JSON.stringify(results))
    })

})

const port = 3000;
app.listen(port, () => {
    console.log(`Server started on port ${port}!`)
});