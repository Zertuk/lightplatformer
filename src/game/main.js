var lpg = {};

lpg.load_state = {
	preload: function() {
		this.load.tilemap('test', '/assets/test.json', null, Phaser.Tilemap.TILED_JSON);
		lpg.game.load.image('sky', '/assets/sky.png');
		lpg.game.load.image('oil', '/assets/oil.png');
		lpg.game.load.image('tileset', '/assets/tileset.png');
		lpg.game.load.image('player', '/assets/player.png');
		lpg.game.load.image('fuelUI', '/assets/fuelbase.png');
		lpg.game.load.image('baseUI', '/assets/uibase.png');
		lpg.game.load.image('heart', '/assets/heart.png');
	},
	create: function() {
		this.game.state.start('play');
	}
}

lpg.play_state = {
	create: function() {

		lpg.map = this.game.add.tilemap('test');
		lpg.map.addTilesetImage('lpgtiles', 'tileset');

		this.Backset = lpg.map.createLayer('Backset');
		this.Background = lpg.map.createLayer('Background');
		lpg.baseUI = lpg.game.add.sprite(20, 20, 'baseUI');
		lpg.baseUI.width = 200;
		lpg.baseUI.fixedToCamera = true;
		lpg.fuelUI = lpg.game.add.sprite(20, 20, 'fuelUI');
		lpg.fuelUI.fixedToCamera = true;
		lpg.heart = lpg.game.add.sprite(20, 36, 'heart');
		lpg.heart.fixedToCamera = true;
		lpg.heart.scale.setTo(1.5, 1.5);
		lpg.heart.smoothed = false;

		this.collideLayer = lpg.map.createLayer('Collide');
		this.collideLayer.enableBody = true;

		lpg.map.setCollisionBetween(1, 10000, true, 'Collide');

		this.game.time.advancedTiming = true;

		this.Background.resizeWorld();

		lpg.platform = lpg.game.add.group();
		lpg.platform.enableBody = true;




		lpg.player = lpg.game.add.sprite(10, 0, 'player');
		lpg.game.physics.arcade.enable(lpg.player);
		lpg.player.anchor.setTo(0.5, 1);
		lpg.player.body.gravity.y = 3000;
		lpg.player.body.collideWorldBounds = true;
		lpg.player.smoothed = false;
		lpg.player.scale.setTo(2, 2);

		lpg.playerObject = {
			oil: 50,
			health: 3,
			lightOn: true,
			secondJump: true
		}

		this.cursors = this.game.input.keyboard.createCursorKeys();
		this.cursors.up.onDown.add(this.playerJump, this);

		this.LIGHT_RADIUS = 300;
		this.toggleLight = this.game.input.keyboard.addKey(Phaser.Keyboard.F);

		this.shadowTexture = this.game.add.bitmapData(this.game.width + 100, this.game.height + 100);
		this.lightSprite = this.game.add.image(this.camera.x, this.camera.y, this.shadowTexture);
		this.lightSprite.blendMode = Phaser.blendModes.MULTIPLY;

		this.game.camera.roundPx = true
		lpg.player.roundPx = true;
		this.game.camera.follow(lpg.player);

		this.createItems();
		this.game.world.bringToTop(lpg.baseUI);
		this.game.world.bringToTop(lpg.fuelUI);
		this.game.world.bringToTop(lpg.heart);

	},
	update: function() {
		lpg.fuelUI.width = lpg.playerObject.oil * 2;
		this.lightSprite.reset(this.camera.x, this.camera.y);
		this.updateShadowTexture();
		lpg.game.physics.arcade.collide(lpg.player, this.collideLayer);
		lpg.game.physics.arcade.collide(lpg.player, lpg.platform);

		lpg.game.physics.arcade.overlap(lpg.player, lpg.items, this.collect, null, this);

		// console.log("FPS: " + this.game.time.fps);
		this.playerMove();
		this.checkFuelUsage();
		this.toggleLight.onDown.add(this.lanternToggle, this);
		if (lpg.player.body.blocked.down) {
			lpg.playerObject.secondJump = false;
		}
		this.checkDeath();
	},
	checkDeath: function() {
		console.log(lpg.player.body.y);
		if (lpg.player.body.y > 670) {
			console.log('dead');
		}
	},
	collect: function(player, collectable) {
		console.log(collectable)
		var text = this.game.add.text(collectable.body.x - 20, collectable.body.y - 20, "+10 oil", { font: "18px Arial", fill: "#ff0044", align: "center" });
		collectable.destroy();
		function destroyText() {
			text.destroy();
		}
		lpg.playerObject.oil = lpg.playerObject.oil + 10;
		if (lpg.playerObject.oil >= 100) {
			lpg.playerObject.oil = 100.5;
		}
		setTimeout(destroyText, 1000);
	},
	playerMove: function() {
		if (this.cursors.left.isDown) {
			lpg.player.body.velocity.x = -325;
			lpg.player.scale.x = 2;
		}
		else if (this.cursors.right.isDown) {
			lpg.player.body.velocity.x = 325;
			lpg.player.scale.x = -2;
		}
		else {
			lpg.player.body.velocity.x = 0;
		}
	},
	playerJump: function() {
		if (this.cursors.up.isDown && lpg.player.body.blocked.down) {
			lpg.player.body.velocity.y = -750;            
		}
		else if (!lpg.playerObject.secondJump && this.cursors.up.isDown) {
			lpg.player.body.velocity.y = -600;
			lpg.playerObject.secondJump = true;
			console.log(lpg.playerObject.secondJump)
		}
	},
	lanternToggle: function() {
		if (lpg.playerObject.lightOn) {
			lpg.playerObject.lightOn = false;
			this.LIGHT_RADIUS = 0;
		}
		else {
			lpg.playerObject.lightOn = true;
			this.LIGHT_RADIUS = 300;
		}
	},
	checkFuelUsage: function() {
		if (lpg.playerObject.lightOn) {
			if (lpg.playerObject.oil > 0) {
				lpg.playerObject.oil = lpg.playerObject.oil - 0.01;
			}
		}
	},
	updateShadowTexture: function() {
		// This function updates the shadow texture (this.shadowTexture).
		// First, it fills the entire texture with a dark shadow color.
		// Then it draws a white circle centered on the pointer position.
		// Because the texture is drawn to the screen using the MULTIPLY
		// blend mode, the dark areas of the texture make all of the colors
		// underneath it darker, while the white area is unaffected.

		// Draw shadow
		// this.lightSprite.destroy();
		// this.lightSprite = this.game.add.image(lpg.player.body.x , lpg.player.body.y - 200, this.shadowTexture );
		if (lpg.playerObject.oil <= 0) {
			lpg.playerObject.lightOn = false;
			this.LIGHT_RADIUS = 0;
		}

		this.shadowTexture.context.fillStyle = 'rgb(10, 10, 10)';
		this.shadowTexture.context.fillRect(0, 0, this.game.width, this.game.height);

		playerX = lpg.player.x - this.game.camera.x,
		playerY = lpg.player.y - this.game.camera.y;

		var gradient = this.shadowTexture.context.createRadialGradient(
		playerX , playerY , this.LIGHT_RADIUS * 0,
		playerX , playerY , this.LIGHT_RADIUS);
		gradient.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
		gradient.addColorStop(1, 'rgba(255, 255, 255, 0.0)');

		// Draw circle of light
		this.shadowTexture.context.beginPath();
		this.shadowTexture.context.fillStyle = gradient;
		this.shadowTexture.context.arc(playerX, playerY, this.LIGHT_RADIUS, 0, Math.PI*2, false);
		this.shadowTexture.context.fill();

		// This just tells the engine it should update the texture cache
		this.shadowTexture.dirty = true;


	},
	findObjectsByType: function(type, map, layer) {
		lpg.result = [];
		lpg.map.objects[layer].forEach(function(element){
			console.log(type);
			console.log(element.properties.type);
		  if(element.properties.type === type) {
			//Phaser uses top left, Tiled bottom left so we have to adjust the y position
			//also keep in mind that the cup images are a bit smaller than the tile which is 16x16
			//so they might not be placed in the exact pixel position as in Tiled
			element.y -= lpg.map.tileHeight;
			lpg.result.push(element);
			console.log(lpg.result);

		  }      
		});
	},
	createItems: function() {
		//create items
		lpg.items = lpg.game.add.group();
		lpg.items.enableBody = true;
		console.log(lpg.items)
		var item;

		lpg.result = this.findObjectsByType('item', lpg.map, 'Objects');
		console.log(this.findObjectsByType('item', lpg.map, 'Objects'));

		lpg.result.forEach(function(element){
			this.createFromTiledObject(element, lpg.items);
		}, this);
	},
	createFromTiledObject: function(element, group) {
		var sprite = group.create(element.x, element.y, element.properties.sprite);
		//copy all properties to the sprite
		Object.keys(element.properties).forEach(function(key){
			sprite[key] = element.properties[key];

		});
	}
}

lpg.game = new Phaser.Game(800, 400, Phaser.AUTO, 'game_container');

lpg.game.state.add('loading', lpg.load_state);
// game.state.add('menu', menu_state);
lpg.game.state.add('play', lpg.play_state);


lpg.game.state.start('loading');