
const { Sequelize, DataTypes } = require('sequelize');
const sql = require('mssql');

const database = "";
const username = "";
const password = "";
const instanceName = "";
const sequelize = new Sequelize(database, username,password, {
    dialect: 'mssql',
    dialectOptions: {
        authentication: {
            type: 'default',
            
        },
        options: {
            instanceName: instanceName,
            trustServerCertificate: true,
        }
    }
});
sequelize.authenticate().then(() => {
    console.log('connection successful');
}).catch(console.error);

const users = sequelize.define('users', { username: { primaryKey: true, type: DataTypes.STRING(20) }, passwords: DataTypes.STRING(10) }, { tableName: 'users', timestamps: false });

class fetch{
     login(username, password) {
         return new Promise((resolve, reject) => {
             users.findAll({ where: { username: username } }).then((data) => {
                 let x;
                 try {
                      x = data[0].passwords;
                 } catch {
                     console.log('wrong password');
                 }
                 if (x == password) { resolve(true) } else { resolve(false) };
             }).catch((error) => { reject(error) });
         });
    }
    adduser(username,password) {
        async function add() {
            try {
                await users.create({ username: username, passwords: password });
                return true;
            }
            catch {
                return false;
            }
        };
        return add();
        
    }
     allcomp() {
         return new Promise((resolve, reject) => {
             locks.findAll({}).then((data) => {  resolve(data) }).catch((err) => reject(err));
         })
    }
    comp(name) {
        return new Promise((resolve, reject) => {
            locks.findAll({ where: { symbol: name } }).then((data) => { resolve(data) }).catch((err)=>reject(err));
        })
    }
};

module.exports = { fetch };