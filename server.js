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
					
					db.query("SELECT id, x, y FROM users WHERE `show` = 1 OR `id` = ?;", user.id, function(err, rows){
						socket.emit('populate', {clients: rows, user: user});
					});
				},
				populate: function()
				{
					db.query("SELECT id, x, y FROM users WHERE `show` = 1;", function(err, rows){
						socket.broadcast.emit('populate', {clients: rows});
					});
				}
			}
		};
		
		socket.on('authorize', function(session_id) {
			game.session_id	= session_id;
		
			db.query("UPDATE users SET `show` = 1 WHERE ?;", {session_id: session_id});
			
			db.query("SELECT id, x, y FROM users WHERE ?;", {session_id: session_id}, function(err, rows){
				if(rows.length)
				{
					game.fn.join(rows[0]);
				}
				else
				{
					db.query("INSERT INTO users SET ?;", {session_id: session_id}, function(err, result){
						game.fn.join({id: result.insertId, x: 1, y: 1});
					});
				}
			});
		});
		
		socket.on('disconnect', function(){
			if(!game.session_id)
			{
				return;
			}
			
			db.query("UPDATE users SET `show` = 0 WHERE ?;", {session_id: game.session_id});
		});
		
		socket.on('move', function(coordinates){
			if(!game.user)
			{
				return;
			}
					
			db.query("UPDATE users SET x = ?, y = ? WHERE id = ?;", [coordinates.x, coordinates.y, game.user.id], function(){				
				socket.broadcast.emit('user-moved', {id: game.user.id, x: coordinates.x, y: coordinates.y});
			
				//game.fn.populate();
			});
		});
	});
});