var socket	= io.connect('http://dev.anuary.com:81');

var game	=
{
	data: null,
	user: null,
	walls:
	[
		//[x1,y1,x2,y2]
		[0,0,290,10],
		[0,10,10,300],
		[10,290,300,300],
		[290,0,300,290],
		[20,140,280,150],
		[20,160,280,170]
	],
	connected: false,
	user_coordinates: null,
	fn:
	{
		init: function(options)
		{
			socket.emit('authorize', options.session_id);
		},
		isWall: function(x,y)
		{		
			var x1	= x*10;
			var y1	= y*10;
			var x2	= x1+10;
			var y2	= y1+10;
			
			for(var i = 0, j = game.walls.length; i < j; i++)
			{
				var p	= game.walls[i];
				
				var x3	= p[0];
				var y3	= p[1];
				var x4	= p[2];
				var y4	= p[3];
				
				if(x2 > x3 && x1 < x4 && y2 > y3 && y1 < y4)
				{
					return true;
				}
			}
			
			return false;
		}
	}
};

socket.on('populate', function(data)
{
	game.data	= data;
	
	if(data.user)
	{
		game.user	= data.user;
	}

	for(var i = 0, j = data.clients.length; i < j; i++)
	{
		if(data.clients[i].id == game.user.id)
		{
			game.user_coordinates	= data.clients[i];
			
			break;
		}
	}
	
	if(!game.connected)
	{
		game.connected		= true;
	
		document.onkeydown	= function(e)
		{
			var x	= 0;
			var y 	= 0;
			
			switch(e.keyCode)
			{
				case 37: --x; break;
				case 38: --y; break;
				case 39: ++x; break;
				case 40: ++y; break;
				default: return; break;
			}
			
			if(!game.fn.isWall(game.user_coordinates.x+x, game.user_coordinates.y+y))
			{
				game.user_coordinates.x	+= x;
				game.user_coordinates.y	+= y;
				
				socket.emit('move', game.user_coordinates);
			
				draw(game.data.clients);
			}
		};
	}
	
	draw(data.clients);
});

function draw3(clients)
{
	var canvas	= document.getElementById('game');
	
	var ctx		= canvas.getContext('2d');
	
	ctx.fillStyle	= '#FFF';
	
	ctx.clearRect(0,0,300,300);
	
	ctx.save();
	
	var linear_gradient	= ctx.createLinearGradient(0,0,300,300);
	
	linear_gradient.addColorStop(0, '#232256');
	linear_gradient.addColorStop(1, '#143778');
	
	ctx.fillStyle	= linear_gradient;
	ctx.fillRect(0,0,300,300);
	
	ctx.restore();
	
	for(var i = 0, j = clients.length; i < j; i++)
	{
		ctx.fillRect(clients[i].x*10, clients[i].y*10, 10, 10);
	};
}

function draw(clients)
{
	var canvas	= document.getElementById('game');
	
	var ctx		= canvas.getContext('2d');
		
	ctx.save();
	
	var linear_gradient	= ctx.createLinearGradient(0,0,300,300);
	
	linear_gradient.addColorStop(0, '#232256');
	linear_gradient.addColorStop(1, '#143778');
	
	ctx.fillStyle	= linear_gradient;
	ctx.fillRect(0,0,300,300);
	
	ctx.restore();

	ctx.save();
	
	ctx.fillStyle	= '#000000';
	
	// draw walls
	for(var i = 0, j = game.walls.length; i < j; i++)
	{
		ctx.fillRect(game.walls[i][0], game.walls[i][1], game.walls[i][2]-game.walls[i][0], game.walls[i][3]-game.walls[i][1]);
	}
	
	ctx.restore();
	
	//console.log('test');
	
	ctx.fillStyle	= '#FFF';
	
	for(var i = 0, j = clients.length; i < j; i++)
	{
		ctx.fillRect(clients[i].x*10, clients[i].y*10, 10, 10);
	}
}