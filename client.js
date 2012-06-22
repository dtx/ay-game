var socket	= io.connect('http://dev.anuary.com:81');

/**
 * Overwrites obj1's values with obj2's and adds obj2's if non existent in obj1
 * @param obj1
 * @param obj2
 * @returns obj3 a new object based on obj1 and obj2
 */
function merge_options(obj1,obj2){
    var obj3 = {};
    for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
    for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
    return obj3;
}
//THINK: I think this is the main game.
var game	=
{
	session: null,
	user: null,
	data: null,
	walls:
	[
		//[x1,y1,x2,y2]
		[0,0,290,10],
		[0,10,10,300],
		[10,290,300,300],
		[290,0,300,290],
		[20,130,140,140],
		[20,150,160,160],
		[130,20,140,120],
		[150,20,160,140],
	],
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
					return true;
				}
			}
			
			return false;
		},
		userAction: function(key)
		{
			if(!game.user)
			{
				return;
			}
			
			if(key == 32)
			{
				socket.emit('user-change-color', function(color){				
					game.user.color	= color;
					
					game.fn.updateCanvas();
				});
			}
			else
			{
				var x	= 0;
				var y 	= 0;
				
				switch(key)
				{
					case 37: --x; break;
					case 38: --y; break;
					case 39: ++x; break;
					case 40: ++y; break;
					default: return; break;
				}
			    	
				if(!game.fn.isWall(game.user.x+x, game.user.y+y))
				{
					game.user.x	+= x;
					game.user.y	+= y;
					
					socket.emit('user-action', game.user);
				
					game.fn.updateCanvas();
				}
			}
		},
		updateCanvas: function()
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
			
			for(var i = 0, j = game.data.users.length; i < j; i++)
			{
				ctx.fillStyle	= game.data.users[i].color; 
				
				//console.log(game.data.users[i].color);
				
				ctx.fillRect(game.data.users[i].x*10, game.data.users[i].y*10, 10, 10);
			}
		}
	}
};

socket.on('user-moved', function(user){
	if(!game.data)
	{
		return;
	}

	for(var i = 0, j = game.data.users.length; i < j; i++)
	{
		if(game.data.users[i].id == user.id)
		{
			game.data.users[i]	= user;
			
			break;
		}
	}
	
	game.fn.updateCanvas();
})

socket.on('propogate', function(data)
{
	game.data	= data;
	
	// data.user object is sent only
	// upon first propogation of data
	if(game.data.user)
	{
		game.session	= game.data.user;
		
		document.onkeydown	= function(e)
		{
			game.fn.userAction(e.keyCode);
		};
	}
	

	for(var i = 0, j = game.data.users.length; i < j; i++)
	{
		if(game.data.users[i].id == game.session.id)
		{
			game.user	= game.data.users[i];
			
			break;
		}
	}
	
	game.fn.updateCanvas();
});
