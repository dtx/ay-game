var io		= require('socket.io').listen(81);

var mysql	= require('mysql');

var db		= mysql.createConnection({
  host: 'localhost',
  user: 'game',
  password: 'nodejsgame',
  database: '2012 06 20 game'
});

db.connect(function(){
	io.sockets.on('connection', function(socket){

		var game	=
		{
			session_id: null,
			user: null,
			fn:
			{
				join: function(user)
				{
					game.user	= user;
				
					db.query("UPDATE users SET `show` = 1 WHERE ?;", {id: user.id}, function(){
						db.query("SELECT id, x, y, color FROM users WHERE `show` = 1;", user.id, function(err, rows){
							socket.emit('propogate', {users: rows, user: user});
							
							game.fn.propogate();
						});
					});
				},
				propogate: function()
				{
					db.query("SELECT id, x, y, color FROM users WHERE `show` = 1;", function(err, rows){
						socket.broadcast.emit('propogate', {users: rows});
					});
				},
				randomColor: function()
				{
					return '#' + Math.floor(Math.random()*16777215).toString(16);
				}
			}
		};
		
		socket.on('authorize', function(session_id)
		{
			game.session_id	= session_id;
			
			db.query("SELECT id, x, y, color FROM users WHERE ?;", {session_id: session_id}, function(err, rows){
				if(rows.length)
				{
					game.fn.join(rows[0]);
				}
				else
				{
					var color	= game.fn.randomColor();
				
					db.query("INSERT INTO users SET ?;", {session_id: session_id, color: color}, function(err, result){
						game.fn.join({id: result.insertId, x: 1, y: 1, color: color});
					});
				}
			});
		});
		
		socket.on('disconnect', function()
		{
			if(!game.session_id)
			{
				return;
			}
			
			db.query("UPDATE users SET `show` = 0 WHERE ?;", {session_id: game.session_id}, function(){
				game.fn.propogate();
			});
		});
		
		socket.on('user-action', function(user)
		{
			if(!game.user)
			{
				return;
			}
					
			db.query("UPDATE users SET x = ?, y = ? WHERE id = ?;", [user.x, user.y, game.user.id], function(){				
				socket.broadcast.emit('user-moved', {id: game.user.id, x: user.x, y: user.y, color: game.user.color});
			});
		});
	});
});