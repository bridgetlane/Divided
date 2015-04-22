/*** Divided (c) Bridget Lane bridgetlane.com ***/
window.onload = function() {    
    "use strict";
    var w = 500;
    var h = 500;
    var game = new Phaser.Game(
                                w, h,               // Width, height of game in px
                                Phaser.AUTO,        // Graphic rendering
                                'game',     
                                { preload: preload, // Preload function
                                  create: create,   // Creation function
                                  update: update }  // Update function
                               );
    
    var cir;//sprite
    var strings;//bitmap
    var upper; var lower;//lines
    var lines = [
                  upper = { DATA: 0, X: w/2, Y: 0, TEXTURE: 'l1-texture' },
                  lower = { DATA: 0, X: w/2, Y: h, TEXTURE: 'l2-texture' }
                  ];
    var q; var imgs = ['q1', 'q2'];
    var img_offset = (50/2);//calculate img offset: half of orig img width
    var status; var hasLost = false;
    var health = 0; var healthText;
    
    function preload(){
            game.load.image('cir', 'assets/img/cir.png');
            game.load.image('l1-texture', 'assets/img/l1-texture.png');
            game.load.image('l2-texture', 'assets/img/l2-texture.png');
            game.load.image('q1', 'assets/img/q1.png');
            game.load.image('q2', 'assets/img/q2.png');
            game.load.audio('bg', ['assets/audio/bg.mp3'], ['assets/audio/bg.ogg']);
    };
    
    function create(){
            audioStartUp();

            game.physics.startSystem(Phaser.Physics.ARCADE);
            
            game.stage.backgroundColor = '#FFFFCC';
            
            q = game.add.group();
            q.enableBody = true;

            status = game.add.text(game.world.centerX, h/3, "", { font: "20px Arial", fill: "#000", align: "center" });
            status.anchor.set(0.5);

            healthText = game.add.text(w - (w/12), h - (h/12), health.toString(), { font: "20px Arial", fill: "#000", align: "center" });
            healthText.anchor.set(0.5);            

            setSprites();
            
            setBitmap();
    };

    function update(){
            //redraw bitmap
            redraw();
            
            //handle hits
            game.physics.arcade.overlap(cir, q, handleCrossed, null, this);
            
            //handle input
            if (game.input.keyboard.isDown(Phaser.Keyboard.W) && !hasLost){
                cir.position.y -= 5;
            }
            else if (game.input.keyboard.isDown(Phaser.Keyboard.S) && !hasLost){
                cir.position.y += 5;
            }
    };

    function audioStartUp() {
        var bgmusic = game.add.audio('bg', 1, true);
        bgmusic.play('', 0, 1, true);
    };
    
    function setSprites(){
            cir = game.add.sprite(game.world.centerX, game.world.centerY, 'cir');
            cir.anchor.setTo(0.5, 0.5);
            game.physics.enable(cir, Phaser.Physics.ARCADE);
            cir.body.collideWorldBounds = true;
           
            spawnTwo();
    };
    
    function spawnTwo(){
            var i; var spawnNum = 2;
            for (i = 0; i < spawnNum; i++){
                var x = (i === 0) ? 0 : w;
                var q1 = q.create(x, game.world.centerY, imgs[i]);
                game.physics.enable(q1, Phaser.Physics.ARCADE);
                q1.body.immovable = true;
                q1.body.collideWorldBounds = true;
                q1.anchor.setTo(0.5, 0.5);
                q1.scale.set(0.5, 0.5);
                q1.health = i;
            }
            q.forEach(function(q1){
                    //give the sprite random movements
                    game.time.events.loop(4000, function() {
                        var xcoord = game.world.randomX; var ycoord = game.world.randomY;
                        game.add.tween(q1).to({x: xcoord, y: ycoord}, 3500, Phaser.Easing.Quadratic.InOut, true);
                        setTimeout(function(){
                            if ((q1.health === 0) && q1.visible){
                                if (q1.position.x > (w/2)){
                                    status.setText("you lose");
                                    hasLost = true;
                                    //cir.position.x = game.world.centerX; cir.position.y = 0; cir.anchor.setTo(0.5, 0.5);
                                }
                            }
                            if ((q1.health === 1) && q1.visible){
                                if (q1.position.x < (w/2)){
                                    status.setText("you lose");
                                    hasLost = true;
                                    //cir.position.x = game.world.centerX; cir.position.y = 0; cir.anchor.setTo(0.5, 0.5);
                                }
                            }
                        }, 20);
                    }, this);
            });
    };

    function setBitmap(){
            //bitmap
            strings = game.add.bitmapData(game.width, game.height);
            game.add.image(0, 0, strings);
            
            //lines
            lines.forEach(function(line){
                line.DATA = new Phaser.Line(line.X, line.Y, game.world.centerX, game.world.centerY);
                strings.textureLine(line.DATA, line.TEXTURE, 'repeat');     
            });
            cir.bringToTop();
    };
    
    function redraw(){
            strings.context.clearRect(0, 0, game.width, game.height);
            lines.forEach(function(line){
                line.DATA.setTo(line.X, line.Y, cir.body.position.x + img_offset, cir.body.position.y + img_offset);
                strings.textureLine(line.DATA, line.TEXTURE, 'repeat');
            });
            cir.bringToTop();
            strings.dirty = true;
    };
    
    function handleCrossed(c, q){            
            q.destroy();
            health++;
            healthText.setText(health.toString());
            spawnTwo();
    };
}
