var socket	= io.connect('http://dev.anuary.com:81');

var game	=
{
	data: null,
	user: null,
	connected: false,
	user_coordinates: null,
	fn:
	{
		init: function(options)
		{
			socket.emit('authorize', options.session_id);
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
			switch(e.keyCode)
			{
				case 37: --game.user_coordinates.x; break;
				case 38: --game.user_coordinates.y; break;
				case 39: ++game.user_coordinates.x; break;
				case 40: ++game.user_coordinates.y; break;
				default: return; break;
			}		
			
			socket.emit('move', game.user_coordinates);
			
			draw(game.data.clients);
		};
	}
	
	draw(data.clients);
});

function draw(clients)
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