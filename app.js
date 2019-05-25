const express = require('express');
const mysql = require('mysql');
const path = require('path');
const upload = require('express-fileupload');
const parser = require('body-parser');
const session = require('express-session');
const app = express();

const monthName = ["January" , "Febuary" , "March" , "April" , "May" , "June" , "July" , "August" , "September" , "October" , "November" , "December"];

app.use(parser());
app.use(session({
    secret: 'ssshhhhh',
    resave: false,
    saveUninitialized: false
}))

app.use(express.static(path.join(__dirname, 'public')));
app.use('/admin', express.static(path.join(__dirname, 'public')));


//Create connection
const con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
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

app.get('/admin/manageaccount', (req, res) => {
    res.sendFile(__dirname+'/manageaccount.html')
});

//Client View
app.get('/profile',(req,res) =>{
    res.sendFile(__dirname+'/profile.html')
});

app.get('/editProfile',(req,res) => {
    res.sendFile(__dirname+'/editProfile.html')
});


app.post('/signin',(req, res) => {
    console.log('Sign in requested...');
    let sql = `SELECT * FROM user_info WHERE email = '${req.body.email}'`;
    let query = con.query(sql, (err, result) => {
        if(err){ //Query is not success
            console.log(err);
            res.redirect('/signin');
        }
        else{ //Query is success
            if(result.length == 0) {//There is no email
                res.redirect('/signin');
            }
            else {//There is an email
                if(result[0].password == req.body.password) {//Login is valid
                    sess = req.session;
                    sess.email = result[0].email;
                    sess.rank = result[0].rank;
                    sess.fullName = result[0].fullName;
                    sess.phone = result[0].userPhone;
                    sess.password = result[0].password;
                    sess.dob = result[0].birthDate;
                    //format date
                    var formattedDate = new Date(sess.dob);
                    sess.dobd = formattedDate.getDate();
                    sess.dobm = formattedDate.getMonth();
                    sess.dobmname = monthName[formattedDate.getMonth()];
                    sess.doby = formattedDate.getFullYear();
                    console.log(`Birth of Date = ${sess.dobd} ${sess.dobm} ${sess.doby}`);
                    //end format date
                    if(result[0].rank == 'Admin'){

                        res.redirect('/admin');
                    }
                    else if(result[0].rank == 'Client'){
                        res.redirect('/');
                    }
                }
                else { //Log in is invalid
                    res.redirect('/signin');
                }
            }
        }
    })
});

app.post('/signup',(req, res) => {
    console.log('Sign up requested...');
    var ranking = 'client';
    let sql = `INSERT INTO user_info(email, fullName, password, rank, userPhone, birthDate)
                VALUES('${req.body.email}', '${req.body.fullName}', '${req.body.password}',
                '${ranking}', '${req.body.userPhone}', ${req.body.birthDate})`;
    let query = con.query(sql, (err, result) => {
        if(err){ //Query is not success
            console.log(err);
            res.redirect('/signup');
        }
        else{ //Query is success
            console.log('sign up successfully...');
            const sess = req.session;
            sess.email = req.body.email;
            sess.rank = req.body.rank;
            sess.fullName = req.body.fullName;
            res.redirect('/');
        }
    });
});

app.get('/checksession', (req, res) => {
    sess = req.session
    res.send(JSON.stringify(sess))
})

app.get('/signout', (req, res) => {
    req.session.destroy( (err) => {
        if(err){
            console.log(err)
        }
        else{
            res.redirect('/signin');
        }
    })
})

app.get('/admin/getaccount', (req, res) => {
    let sql = `SELECT * FROM user_info WHERE 1`;
    let query = con.query(sql, (err, results) => {
        res.send(JSON.stringify(results))
    })
})

app.get('/signin',(req, res) => {
    console.log('Sign in requested...');
    let sql = `SELECT * FROM user_info WHERE email = '${req.body.email}'`;
    let query = con.query(sql, (err, result) => {
        if(err){ //Query is not success
            console.log(err);
            res.redirect('/signin');
        }
        else{ //Query is success
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
});

app.post('/admin/delete', (req, res) => {
    console.log(req.body);
    let sql = `DELETE FROM user_info WHERE user_id = ${req.body.user_id}`;
    let query = con.query(sql, (err, results) => {
        res.send('success');
    })
});

//editing profile
app.post('/editing',(req,res)=>{
    console.log(req.body);
    let temp = {};
    let sql = `SELECT * FROM user_info WHERE email = "${req.body.email}"`;
    
    sess = req.session;
    let checkquery = con.query(sql,(err,result)=>{
        if(err)
        {
            console.log(err);
            res.redirect('/editing')
        }
        else
        {
            if(result.length == 0)//emptyslot
            {
                console.log("empty data");
            }
            else
            {
                console.log(result[0]);
                if(req.body.fullName == "")
                {
                    req.body.fullName = result[0].fullName;
                }
                if(req.body.password == "")
                {
                    req.body.password = result[0].password;

                }
                if(req.body.phone == "")
                {
                    req.body.phone = result[0].userPhone;
                }
                console.log(req.body);
                if(req.body.fullName != "" && req.body.password != "" && req.body.phone != "")
                {
                    let sqlUpdate = `UPDATE user_info SET fullName="${req.body.fullName}" , password="${req.body.password}", userPhone="${req.body.phone}" WHERE email = "${req.body.email}"`;
                    console.log(sqlUpdate);
                    let queryUpdate = con.query(sqlUpdate,(err,result2)=>{
                        console.log("WTF")
                        if(err)
                        {
                            console.log(err);
                            res.redirect('/editing');
                        }
                        else
                        {
                            console.log("updated");
                            sess.fullName = req.body.fullName;
                            sess.phone = req.body.phone;
                            res.redirect('/profile');
                        }
                    });
                }
            }
        }
    });    
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server started on port ${port}!`)
});