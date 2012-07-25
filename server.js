exports.Sock =
function(db, socket){
    db.connect(function(){
        console.log("connected to the db");
        socket.on('connection',function(socket){
            console.log("recieved socket connection request");

            var game =
            {
                session_id: null,
                user: null,
                walls:
                [
                    //[x1,y1,x2,y2]
                    [0,0,490,10],
                    [10,490,500,500],
                    [0,10,10,500],
                    [490,0,500,490],
                    [20,130,140,140],
                    [20,150,160,160],
                    [130,20,140,120],
                    [150,20,160,140],
                ],
                fn:
                {
                    join: function(user)
                    {
                        console.log("Initialising the user here");
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
                console.log(session_id);
                game.session_id	= session_id;

                db.query("SELECT id, x, y, color FROM users WHERE ?;", {session_id: session_id}, function(err, rows){
                    if(err){
                        console.log(err);
                    }
                    else{
                            if(rows.length)
                        {
                            console.log("--> This user is already present in the DB, just join the user.");
                            game.fn.join(rows[0]);
                        }
                        else
                        {
                            console.log("--> This user is not present in the DB.");
                            var color	= game.fn.randomColor();

                            db.query("INSERT INTO users SET ?;", {session_id: session_id, color: color}, function(err, result){
                                game.fn.join({id: result.insertId, x: 1, y: 1, color: color});
                            });
                        }
                    }
                console.log(err);
                });
                console.log("shit is going down");
            });

            socket.on('isWall', function(x, y, fn){
              var x1	= x*10;
              var y1	= y*10;
              var x2	= x1+10;
              var y2	= y1+10;
              console.log('in the socket for isWall');

              //do i need to run a loop everytime the user moves?
              //can this be optimized?
              for(var i = 0, j = game.walls.length; i < j; i++)
              {
                  var p	= game.walls[i];

                  var x3	= p[0];
                  var y3	= p[1];
                  var x4	= p[2];
                  var y4	= p[3];
                  //wtf is happening here? probably i am just too sleepy.
                  if(x2 > x3 && x1 < x4 && y2 > y3 && y1 < y4)
                  {
                    console.log('found a wall, calling with wall ID: '+i);
                    fn(i);
                  }
              }
              console.log('not a wall, returning undefined');
              fn(undefined);
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

            socket.on('user-change-color', function(fn){
                if(!game.user)
                {
                    return;
                }
                //TODO: keep a record of the colors currently alloted
                //TODO: dont give that color to the any other player
                //TODO: release the color once a player leave and make it free to be claimed.
                game.user.color	= game.fn.randomColor();
                console.log(game.user.id);
                //is this good to write to DB everytime the color changes? not scalable.
                db.query("UPDATE users SET color = ? WHERE id = ?;", [game.user.color, game.user.id], function(){
                    socket.broadcast.emit('user-moved', {id: game.user.id, x: game.user.x, y: game.user.y, color: game.user.color});
                });
                fn(game.user.color);
            });

            socket.on('user-action', function(user)
            {
                if(!game.user)
                {
                    return;
                }

                game.user.x	= user.x;
                game.user.y = user.y;
                db.query("UPDATE users SET x = ?, y = ? WHERE id = ?;", [user.x, user.y, game.user.id], function(){
                    socket.broadcast.emit('user-moved', {id: game.user.id, x: user.x, y: user.y, color: game.user.color});
                });
            });
    });
    });
};
