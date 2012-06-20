<?php
session_start();
?>
<!DOCTYPE html>
<html>
<head>
<style>
	body { padding: 0; margin: 0; background: #555; }
	.wrapper { margin: 50px auto; width: 300px; }
</style>
<script type="text/javascript" src="http://dev.anuary.com:81/socket.io/socket.io.js"></script>
<script type="text/javascript" src="client.js"></script>
<script type="text/javascript">
game.fn.init(<?=json_encode(['session_id' => session_id()])?>);
</script>
</head>
<body>
	<div class="wrapper">
		<canvas width="300" height="300" id="game"></canvas>
	</div>
</body>
</html>