var bodyParser = require('body-parser');
var mysql = require('mysql');


var urlencodedParser = bodyParser.urlencoded({extended: false});

var con = mysql.createConnection({
	host: 'localhost', 
	user: 'Nathan', 
	password: 'Karasuno12', 
	database: 'Egg_Database'
	});

function formatDate(date) {
	var d = new Date(date),
		month = '' + (d.getMonth() + 1),
		day = '' + d.getDate(),
		year = d.getFullYear();

	if (month.length < 2) 
		month = '0' + month;
	if (day.length < 2) 
		day = '0' + day;

	return [year, month, day].join('-');
}


module.exports = function(app)
{
	app.locals.errorInfo = {success: '', eggNumbers: ''};
	app.locals.tableInfo;
	app.locals.user = {userName: ''};

	app.get('/addEggs', function(req,res)
	{
		app.locals.errorInfo = {success: '', eggNumbers: ''};

		if(app.locals.user.userName == 'Slave' || app.locals.user.userName == 'Amma')
		{
			con.query("SELECT * FROM egg_inventory ORDER BY Id DESC LIMIT 5", function (err, result, fields)
			{
				if (err) throw err;
				app.locals.tableInfo = result;
				app.locals.errorInfo = {success: '', eggNumbers: ''};
				res.render('addEggs');
			});	
		}
		else
		{
			res.render('userLogin');
		}
	});
	app.get('/home', function(req,res)
	{
		res.render('home');
	});
	app.get('/removeEggs', function(req,res)
	{
		app.locals.errorInfo = {success: '', eggNumbers: ''};

		if(app.locals.user.userName == 'Slave' || app.locals.user.userName == 'Amma')
		{
			con.query("SELECT * FROM egg_inventory ORDER BY Id ASC LIMIT 5", function (err, result, fields)
			{
				if (err) throw err;
				app.locals.tableInfo = result;
				app.locals.errorInfo.success = '';
				app.locals.errorInfo.eggNumbers = '';
				res.render('removeEggs');
			});
		}
		else
		{
			res.render('userLogin');
		}	
	});
	app.get('/placeOrder', function(req,res)
	{
		app.locals.errorInfo = {success: '', eggNumbers: ''};

		if(app.locals.user.userName == '')
		{
			res.render('userLogin');
		}
		else if(app.locals.user.userName == 'Amma' ||app.locals.user.userName == 'Lily')
		{
			app.locals.table2Info = [{}];
			res.render('placeOrder');
		}
		else
		{
			con.query(`SELECT Id FROM Customer_Info WHERE Username = '${app.locals.user.userName.toUpperCase()}'`, function (err, result, fields) {
				if (err) throw err;
				customerId = result[0].Id;
				con.query(`SELECT * FROM Orders WHERE Customer_Id = ${customerId}`, function (err, result, fields)
				{
					if (err) throw err;
					app.locals.table2Info = result;
					res.render('placeOrder');
				});
			});
			
		}
	});
	app.get('/Logout', function(req,res)
	{
		app.locals.user.userName = '';

		res.render('home');
	});
	app.get('/Login', function(req,res)
	{
		app.locals.errorInfo = {success: '', eggNumbers: ''};
		res.render('userLogin');
	});
	app.get('/createCustomer', function(req,res)
	{
		app.locals.errorInfo = {success: '', eggNumbers: ''};
		res.render('createCustomer');
	});
	app.get('/admin', function(req,res)
	{
		if(app.locals.user.userName != 'Amma')
		{
			res.render('userLogin');
		}
		else
		{
			con.query("SELECT * FROM egg_inventory", function (err, result, fields)
			{
				if (err) throw err;
				app.locals.tableInfo = result;
				app.locals.errorInfo = {success: '', eggNumbers: ''};
				con.query("SELECT * FROM orders", function (err, result, fields)
				{
					if (err) throw err;
					app.locals.table2Info = result;
					app.locals.errorInfo = {success: '', eggNumbers: ''};
					con.query("SELECT * FROM Removal_History", function (err, result, fields)
					{
						if (err) throw err;
						app.locals.table3Info = result;
						app.locals.errorInfo = {success: '', eggNumbers: ''};
						con.query("SELECT * FROM Customer_Info", function (err, result, fields)
						{
							if (err) throw err;
							app.locals.table4Info = result;
							app.locals.errorInfo = {success: '', eggNumbers: ''};
							res.render('admin');
						});
					});
				});	
			});	
		}
		
	});


	app.post('/addEggs', urlencodedParser, function(req,res)
	{
		app.locals.errorInfo = {success: '', eggNumbers: ''};

		if(req.body['pickDate'] == '')
		{
			var date = new Date();
			date.setDate(date.getDate() + 30);
			var expiryDate = formatDate(date);
			var name = req.body['uName'].toUpperCase();

			for(var i = 0;i<req.body['numEggs'];i++)
			{
				var sql = `INSERT INTO Egg_Inventory(Picker_Name, Expiry_Date) VALUES('${name}','${expiryDate}')`;
				con.query(sql, function (err, result) 
				{if (err) throw err;});
			}
		}
		else
		{
			var date = new Date(req.body['pickDate']);
			date.setDate(date.getDate() + 1);
			var pickDate = formatDate(date);
			date.setDate(date.getDate() + 30);
			var expiryDate = formatDate(date);
			var name = req.body['uName'].toUpperCase();

			for(var i = 0;i<req.body['numEggs'];i++)
			{
				var sql = `INSERT INTO Egg_Inventory(Picker_Name, Pick_Date, Expiry_Date) VALUES('${name}','${pickDate}','${expiryDate}')`;
				con.query(sql, function (err, result) 
				{if (err) throw err;});
			}
		}

		app.locals.errorInfo.success = 'Successfully Added ' + req.body['numEggs'] + ' Eggs';
		
		con.query("SELECT * FROM egg_inventory ORDER BY Id DESC LIMIT 5", function (err, result, fields) {
			if (err) throw err;
			app.locals.tableInfo = result;
			res.render('addEggs');
		});	
	});


	app.post('/removeEggs', urlencodedParser, function(req,res)
	{
		var records; 
		if(req.body['eggDate'] == '' && req.body['ids'] == '')
		{
			con.query("SELECT * FROM Egg_Inventory", function(err, result,fields)
			{
				if(err) throw err;
				records = result;
				if(records.length >= req.body['numEggs'])
				{
					app.locals.errorInfo.eggNumbers = 'Please Remove Eggs Numbered: ';

					for(var i=0; i<req.body['numEggs']; i++)
					{
						con.query("SELECT Id FROM egg_inventory ORDER BY Id LIMIT 1", function(err, result,fields)
						{
							if(err) throw err;
							app.locals.errorInfo.eggNumbers = app.locals.errorInfo.eggNumbers + result[0].Id + ', ';
						});
						con.query("DELETE FROM Egg_Inventory ORDER BY Id LIMIT 1", function(err, result,fields)
						{
							if(err) throw err;
						});
					}
					app.locals.errorInfo.success = 'Sucessfully Removed ' + req.body['numEggs'] + ' Eggs';
					con.query("SELECT * FROM egg_inventory ORDER BY Id ASC LIMIT 5", function (err, result, fields) {
						if (err) throw err;
						app.locals.tableInfo = result;
						res.render('removeEggs');
					});
					con.query(`INSERT INTO Removal_History(Number_Removed, Name) VALUES('${req.body['numEggs']}', '${req.body['uName']}')`, function (err, result, fields) {
						if (err) throw err;
					});
				}
				else
				{
					app.locals.errorInfo.success = 'Insufficient Eggs in Database'
				}
			});	
			
		}
		else if(req.body['ids'] == '')
		{
			var date = new Date(req.body['eggDate']);
			date.setDate(date.getDate() + 1);
			var pickDate = formatDate(date);

			con.query(`SELECT * FROM Egg_Inventory WHERE Pick_Date = '${pickDate}'`, function(err, result,fields)
			{
				if(err) throw err;
				records = result;

				if(records.length >= req.body['numEggs'])
				{
					app.locals.errorInfo.eggNumbers = 'Please Remove Eggs Numbered: ';
					
					for(var i=0; i<req.body['numEggs']; i++)
					{
						con.query(`SELECT * FROM egg_inventory WHERE Pick_Date = '${pickDate}' LIMIT 1`, function(err, result,fields)
						{
							if(err) throw err;
							console.log(result[0].Id);
							app.locals.errorInfo.eggNumbers = app.locals.errorInfo.eggNumbers + result[0].Id + ', ';
							console.log(app.locals.errorInfo.eggNumbers);
						});
						con.query(`DELETE FROM egg_inventory WHERE Pick_Date = '${pickDate}' LIMIT 1`, function(err, result,fields)
						{
							if(err) throw err;
						});
					}
					app.locals.errorInfo.success = 'Sucessfully Removed ' + req.body['numEggs'] + ' Eggs';
					con.query("SELECT * FROM egg_inventory ORDER BY Id ASC LIMIT 5", function (err, result, fields) {
						if (err) throw err;
						app.locals.tableInfo = result;
						res.render('removeEggs');
					});	
					con.query(`INSERT INTO Removal_History(Number_Removed, Name) VALUES('${req.body['numEggs']}', '${req.body['uName']}')`, function (err, result, fields) {
						if (err) throw err;
					});
				}
				else
				{
					app.locals.errorInfo.success = 'Insufficient Eggs From Selected Date'
				}
			});
		}
		else
		{
			var idsArray = req.body['ids'].split(',');
			var idNotFound = 0;

			for(var i = 0; i<idsArray.length; i++)
			{
				con.query(`SELECT * FROM egg_inventory WHERE Id = '${idsArray[i]}'`, function(err, result,fields)
				{
					if(err) throw err;
					if(result.Id == '')
					{
						app.locals.errorInfo.success = 'Id ' + idsArray[i] + ' Could Not Be Fonud';
						idNotFound = 1;
						return;
					}
				});	
			}
			if(idNotFound == 0)
			{
				app.locals.errorInfo.eggNumbers = 'Please Remove Eggs Numbered: ' + req.body['ids'];

				for(var i = 0; i<idsArray.length; i++)
				{
					con.query(`DELETE FROM egg_inventory WHERE Id = '${idsArray[i]}'`, function(err, result,fields)
					{
						if(err) throw err;
					});
				}
				app.locals.errorInfo.success = 'Successfully Removed ' + req.body['numEggs'] + ' Eggs';
				con.query("SELECT * FROM egg_inventory ORDER BY Id ASC LIMIT 5", function (err, result, fields) {
					if (err) throw err;
					app.locals.tableInfo = result;
					res.render('removeEggs');
				});	
				con.query(`INSERT INTO Removal_History(Number_Removed, Name) VALUES('${req.body['numEggs']}', '${req.body['uName'].toUpperCase()}')`, function (err, result, fields) {
						if (err) throw err;
				});
			}
		}
	});


	app.post('/placeOrder', urlencodedParser, function(req,res)
	{
		var date = new Date(req.body['dateNeeded']);
		date.setDate(date.getDate() + 1);
		var dateNeeded = formatDate(date);
		var price = req.body['numEggs'] * 0.33;
		price = price.toFixed(2);
		var customerId;
		var moneyOwed = parseFloat(price);
		var eggsOutstanding = parseInt(req.body['numEggs']);
		
		con.query(`SELECT Id FROM Customer_Info WHERE Username = '${app.locals.user.userName.toUpperCase()}'`, function (err, result, fields) {
			if (err) throw err;
			customerId = result[0].Id;

			con.query(`INSERT INTO Orders(Number_Eggs, Customer_Id, Date_Needed, Price) VALUES('${req.body['numEggs']}', '${customerId}', '${dateNeeded}', '${price}')`, function (err, result, fields) {
				if (err) throw err;
			});

			con.query(`SELECT * FROM Customer_Info WHERE Username = '${app.locals.user.userName.toUpperCase()}'`, function (err, result, fields) {
				if (err) throw err;
				moneyOwed = moneyOwed + parseFloat(result[0].Money_Owed);
				eggsOutstanding = eggsOutstanding + parseInt(result[0].Eggs_Outstanding);
				console.log(moneyOwed);
				console.log(eggsOutstanding);
				con.query(`UPDATE Customer_Info SET Money_Owed = '${moneyOwed}', Eggs_Outstanding = '${eggsOutstanding}' WHERE Id = '${customerId}'`, function (err, result, fields) {
					if (err) throw err;
					con.query(`SELECT * FROM Orders WHERE Customer_Id = ${customerId}`, function (err, result, fields)
					{
						if (err) throw err;
						app.locals.table2Info = result;
					});
				});
			});
		});

		app.locals.errorInfo.success = 'You Have Successfully Placed an Order for ' + req.body['numEggs'] + ' Eggs';
		app.locals.errorInfo.eggNumbers = 'Your Total is: $' + price;

		res.render('placeOrder');
	});


	app.post('/userLogin', urlencodedParser, function(req,res)
	{
		if(req.body['uName'] == 'Admin')
		{
			if(req.body['password'] == 'amma')
			{
				app.locals.user.userName = 'Amma';
				res.render('home')
			}
		}
		else if(req.body['uName'] == 'Slave')
		{
			if(req.body['password'] == 'egg')
			{
				app.locals.user.userName = 'Slave';
				res.render('home')
			}
		}
		con.query(`SELECT EXISTS(SELECT * FROM Customer_Info WHERE Username = '${req.body['uName'].toUpperCase()}')`, function (err, result, fields) {
			if (err) throw err;
			if(result[0][`EXISTS(SELECT * FROM Customer_Info WHERE Username = '${req.body['uName'].toUpperCase()}')`] == 1)
			{
				con.query(`SELECT * FROM Customer_Info WHERE Username = '${req.body['uName'].toUpperCase()}'`, function (err, result, fields) {
					if (err) throw err;
					if(result[0].Password == req.body['password'])
					{
						app.locals.user.userName = req.body['uName'];
						res.render('home');
					}
					else
					{
						app.locals.errorInfo.success = 'Incorrect Password';
						res.render('userLogin');
					}
				});
			}
			else
			{
				app.locals.errorInfo.success = 'The Username Entered Does Not Exist';
				res.render('userLogin');
			}
		});
	});


	app.post('/createCustomer', urlencodedParser, function(req,res)
	{
		con.query(`SELECT EXISTS(SELECT * FROM Customer_Info WHERE Username = '${req.body['uName'].toUpperCase()}')`, function (err, result, fields) {
			if (err) throw err;
			if(result[0]["EXISTS(SELECT * FROM Customer_Info WHERE Username = 'BOB')"] == 1)
			{
				app.locals.errorInfo.success = 'The Username Already Exists';
				res.render('createCustomer');
			}
			else if(req.body['password'] != req.body['passwordRe'])
			{
				app.locals.errorInfo.success = 'The Passwords Entered do not Match';
				res.render('createCustomer');
			}
			else
			{
				con.query(`INSERT INTO Customer_Info(Username, Password, Money_Owed, Eggs_Outstanding) VALUES('${req.body['uName'].toUpperCase()}','${req.body['password']}', 0, 0)`, function (err, result, fields) {
					if (err) throw err;
				});

				app.locals.errorInfo.success = 'Customer Has Been Created';
				res.render('createCustomer');
			}
		});
	});

	app.post('/admin', urlencodedParser, function(req,res)
	{
		var price;
		var custID;
		var moneyOwed;
		con.query(`SELECT * FROM Orders WHERE Id = ${req.body['orderId']}`, function (err, result, fields) {
			if (err) throw err;
			if(result == '')
			{
				con.query("SELECT * FROM egg_inventory", function (err, result, fields)
				{
					if (err) throw err;
					app.locals.tableInfo = result;
					app.locals.errorInfo = {success: '', eggNumbers: ''};
					con.query("SELECT * FROM orders", function (err, result, fields)
					{
						if (err) throw err;
						app.locals.table2Info = result;
						app.locals.errorInfo.success = 'Order ID Could Not Be Found';
						res.render('admin');
					});	
				});	
			}
			else
			{
				price = result[0].Price;
				custID = result[0].Customer_Id;

				con.query(`DELETE FROM Orders WHERE Id = ${req.body['orderId']}`, function (err, result, fields) {
					if (err) throw err;
				});
				con.query(`SELECT * FROM Customer_Info WHERE Id = ${custID}`, function (err, result, fields) {
					if (err) throw err;
					moneyOwed = parseFloat(result[0].Money_Owed);
					moneyOwed = moneyOwed - parseFloat(price);

					con.query(`UPDATE Customer_Info SET Money_Owed =${moneyOwed} WHERE Id = ${custID}`, function (err, result, fields) {
						if (err) throw err;
						con.query("SELECT * FROM egg_inventory", function (err, result, fields)
						{
							if (err) throw err;
							app.locals.tableInfo = result;
							app.locals.errorInfo = {success: '', eggNumbers: ''};
							con.query("SELECT * FROM orders", function (err, result, fields)
							{
								if (err) throw err;
								app.locals.table2Info = result;
								app.locals.errorInfo.success = 'Order Removed';
								res.render('admin');
							});	
						});	
					});
				});
			}
		});
	});
}
