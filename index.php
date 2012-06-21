<?php
session_start();
?>
<!DOCTYPE html>
<html>
<head>
<style>
	body { padding: 0; margin: 0; background: #555; font: normal 12px/20px 'Lucida Grande', Arial, Sans-Serif; }
	.wrapper { margin: 50px auto; width: 300px; }
	a { color: #CCC; }
</style>
<script type="text/javascript" src="http://dev.anuary.com:81/socket.io/socket.io.js"></script>
<script type="text/javascript" src="client.js"></script>
<script type="text/javascript">
game.fn.init(<?=json_encode(['session_id' => session_id()])?>);

<?php if(!empty($_GET['bot'])):?>
setInterval(function(){
	var keys	= [37,38,39,40];

	game.fn.userAction(keys[Math.floor(Math.random() * keys.length)]);
}, 250);
<?php endif;?>
</script>
</head>
<body>
	<div class="wrapper">
		<canvas width="300" height="300" id="game"></canvas>
		
		<p>This is an experimental game board. Contribute <a href="https://github.com/anuary/ay-game" target="_blank">https://github.com/anuary/ay-game</a>.</p>
	</div>
</body>
</html>