var express = require('express');
var app = express();

var eggController = require('./controllers/eggController');

//set up template engine
app.set('view engine', 'ejs');


//static files
app.use(express.static('./htmlPages'));

//fire controllers
eggController(app);

//listen to port
app.listen(3000);