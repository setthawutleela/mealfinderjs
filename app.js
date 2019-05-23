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

app.post('/signin',(req, res) => {
    console.log('Login request;');
    let sql = `SELECT * FROM user_info WHERE email = '${req.body.email}'`;
    let query = con.query(sql, (err, result) => {
        if(err){
            console.log(err);
            res.send('error')
        }
        else{

            if(result.length == 0) {
                res.redirect('/signin');
            }
            else {
                if(result[0].password == req.body.password) {
                }
                else {
                }
            }
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

app.get('/dsa', (req, res) => {

    sess = req.session
    sess.email = 'asdasdasd'
    console.log(req.session)
    res.send('พอ dsa');
})

app.get('/qwe', (req, res) => {

    sess = req.session

    if(!sess.email) {
        res.redirect('/signin')
    }
    else {
        res.send('wow')
    }
})

app.get('/logout', (req, res) => {
    req.session.destroy( (err) => {
        if(err) console.log(err)
        else
            res.send('destroy')
    })
})

const port = 80;
app.listen(port, () => {
    console.log(`Server started on port ${port}!`)
});