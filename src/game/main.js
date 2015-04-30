var lpg = {

}

lpg.load_state = {
    preload: function() {
        lpg.game.load.image('sky', '/assets/sky.png');
        lpg.game.load.image('platform', '/assets/platform.png');
        lpg.game.load.image('player', '/assets/player.png');
    },
    create: function() {
        this.game.state.start('play');
    }
}

lpg.play_state = {
    create: function() {


        lpg.game.world.setBounds(0, 0, 800, 400);
        this.game.time.advancedTiming = true;


        lpg.platform = lpg.game.add.group();
        lpg.platform.enableBody = true;

        var grounds = lpg.platform.create(0, 368, 'platform');
        grounds.body.immovable = true;
        grounds.scale.setTo(5, 1);

        var grounds = lpg.platform.create(400, 368, 'platform');
        grounds.body.immovable = true;
        grounds.scale.setTo(5, 1);

        lpg.player = lpg.game.add.sprite(10, 250, 'player');
        lpg.game.physics.arcade.enable(lpg.player);
        lpg.player.body.gravity.y = 600;
        lpg.player.body.collideWorldBounds = true;

        this.cursors = this.game.input.keyboard.createCursorKeys();

        this.LIGHT_RADIUS = 300;
        this.game.stage.backgroundColor = 0x4488cc;
        this.toggleLight = this.game.input.keyboard.addKey(Phaser.Keyboard.F);

        this.shadowTexture = this.game.add.bitmapData(this.game.width, this.game.height);
        var lightSprite = this.game.add.image(0, 0, this.shadowTexture);
        lightSprite.blendMode = Phaser.blendModes.MULTIPLY;
        this.game.input.activePointer.x = this.game.width;
        this.game.input.activePointer.y = this.game.height;

    },
    update: function() {
        this.updateShadowTexture();

        lpg.game.physics.arcade.collide(lpg.player, lpg.platform);
        console.log("FPS: " + this.game.time.fps);
        this.playerMove();
        this.playerJump();
        this.toggleLight.onDown.add(this.lanternToggle, this);
    },
    playerMove: function() {
        if (this.cursors.left.isDown) {
            lpg.player.body.velocity.x = -200;
        }
        else if (this.cursors.right.isDown) {
            lpg.player.body.velocity.x = 200;
        }
        else {
            lpg.player.body.velocity.x = 0;
        }
    },
    playerJump: function() {
        if (this.cursors.up.isDown && lpg.player.body.touching.down) {
            lpg.player.body.velocity.y = -400;
        }
    },
    lanternToggle: function() {
        console.log('toggled');
        if (this.LIGHT_RADIUS == 0) {
            this.LIGHT_RADIUS = 300;
        }
        else {
            this.LIGHT_RADIUS = 0;
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
    this.shadowTexture.context.fillStyle = 'rgb(30, 30, 30)';
    this.shadowTexture.context.fillRect(0, 0, this.game.width, this.game.height);

     var gradient = this.shadowTexture.context.createRadialGradient(
    lpg.player.body.x  + 20, lpg.player.body.y + 30, this.LIGHT_RADIUS * 0.75,
    lpg.player.body.x  + 20, lpg.player.body.y + 30, this.LIGHT_RADIUS);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0.0)');

    // Draw circle of light
    this.shadowTexture.context.beginPath();
    this.shadowTexture.context.fillStyle = gradient;
    this.shadowTexture.context.arc(lpg.player.body.x  + 20, lpg.player.body.y + 30, this.LIGHT_RADIUS, 0, Math.PI*2);
    this.shadowTexture.context.fill();

    // This just tells the engine it should update the texture cache
    this.shadowTexture.dirty = true;
}
}

lpg.game = new Phaser.Game(800, 400, Phaser.AUTO, 'game_container');

lpg.game.state.add('loading', lpg.load_state);
// game.state.add('menu', menu_state);
lpg.game.state.add('play', lpg.play_state);


lpg.game.state.start('loading');