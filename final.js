const express = require('express');
const http = require('http');
const { fetch } = require('./db-fetch');
const hj = new fetch();
const bodyparser = require('body-parser');
const session = require('express-session');
const RedisStore = require('connect-redis').default;
const { createClient } = require('redis');
const redisclient = createClient();
redisclient.connect().catch(console.error);
let redisstore = new RedisStore({ client: redisclient, prefix: 'app' });
console.log(__dirname)
class hello{
    constructor(){
        this.app = express();
        const server = http.createServer(this.app);
        server.listen(8000, () => {
            console.log('server running http://localhost:8000');
        });
        this.use();
    }
    use(){
        this.app.use([bodyparser.json(), bodyparser.urlencoded({ extended: true })]);
        this.app.use(session({ store: redisstore, secret: 'asdfghjkl', cookie: { maxAge: 86400000 }, resave: true, saveUninitialized: false }));
        this.app.use((req, res, next) => {
            if (req.url === '/favicon.ico') {
                console.log(req.url);
                res.status(200).end();
            } else {
                next();
            }
        });
        this.app.use((req, res, next) => {
            
            if (req.url == '/check' || req.url == '/add?') { console.log(req.url); next(); }
            else if (!req.session.userid) {
                res.sendFile(__dirname+'/login.html');
            }
            else {
                next();
            }
        });
        this.app.set('view engine', 'ejs');

    }
    routes() {
        this.app.get("/", this.firstpage);
        this.app.get("/login",this.login);
        this.app.get("/add",this.add);
        this.app.get("/logout",this.logout);
        this.app.post("/get",this.get);
        this.app.post("/add",this.adduser);
        this.app.post("/check",this.check);

    }
    firstpage(req,res) {
        hj.allcomp().then((names) => res.render('example', { data: names })).catch((err) => { if (err) { res.send('error') } });
    }
    login(req,res) {
        res.sendFile(__dirname+'/login.html');
    }
    add(req, res) {
        res.sendFile(__dirname+'/create.html');
    }
    logout(req, res) {
        req.session.destroy((error) => { if (error) { console.log(error) } });
        res.redirect("/login");
    }
    get(req,res) {
        if (req.body.symbol == 'all') {
            hj.allcomp().then((names) => { res.render('example', { data: names, time: req.session.data }); }).catch(() => res.send('error'));

        } else {
            hj.comp(req.body.symbol).then((names) => { res.render('example', { data: names, time: req.session.data }); }).catch(() => res.send('error'));
        }
    }
    adduser(req, res) {
        let add = hj.adduser(req.body.username, req.body.password);
        if (add) {
            req.session.userid = req.body.username;
            res.redirect("/login");
        }
        else {
            res.send("error in adding user");
            console.log('error');
        }
    }
    check(req, res) {
        hj.login(req.body.username, req.body.password).then((data) => {
            if (data) {
                //console.log(data);
                req.session.userid = req.body.username;
                req.session.save((err) => { if (err) { console.log(err) } });
                res.redirect("/");
            } else { console.log("login"); res.redirect("/login") }
        }).catch((err) => { if (err) { console.log(err) } });
    }

}

module.exports = { hello };