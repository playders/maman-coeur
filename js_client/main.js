//configuration du jeu
var config = {
    type : Phaser.AUTO,
    backgroundColor : "#22E1EA",
    width : 800,
    height : 600,
    scene : {
        preload : preload,
        create : create,
        update : update,
    },
    physics :{
        default : "arcade",
        arcade : {
            gravity : {y : 1000}
        }
    }
}
//variable et constant
var players = null;
var cursor = null;
var Akey;
var Skey;
var laserReady = true;
var laser = false
var laserReady1 = true;
var laser1 = false

const game = new Phaser.Game(config);


//charger les image


function preload(){
    this.load.image("tiles", "tilesheet.png");
    this.load.tilemapTiledJSON("map","JeuPlateforme.json");
    this.load.image("Players","coeur.png");
    this.load.image("back","backgrond.png");
    this.load.image("alien","alienYellow.png");
    this.load.image("alien1","alienYellow_walk1.png");
    this.load.image("alien2","alienYellow_walk2.png");
    //charger audio
    this.load.audio("kick","kick.ogg");
}

//camera,placement des image
function create(){
    var cameraCentreX = this.cameras.main.centerX;
    var cameraCentreY = this.cameras.main.centerY;

    this.tilemap = this.make.tilemap({key: "map"});
    this.tileset = this.tilemap.addTilesetImage("tilesheet","tiles");

    this.downLayer = this.tilemap.createLayer("bot",this.tileset,0,0);
    this.worldLayer = this.tilemap.createLayer("world",this.tileset,0,0);
    this.topLayer = this.tilemap.createLayer("top",this.tileset,0,0);



    players = this.physics.add.sprite(cameraCentreX,200,"Players");
    players.setScale(0.5);

    //animation alien
    this.anims.create({
        key: "alienAnim",
        frames: [
            {key: "alien1"},
            {key: "alien2"}
        ],
        frameRate: 8,
        repeat: -1
    });
    var alienYellow = this.add.sprite(500,cameraCentreY,"alien1").play("alienAnim");
    var tween = this.tweens.add({
        targets : alienYellow,
        x : 800,
        ease : "Linear",
        duration : 1000,
        yoyo : true,
        repeat : -1,
        onStart : function (){},
        onComplete : function (){},
        onYoyo : function (){ alienYellow.flipX = !alienYellow.flipX},
        onRepeat : function (){alienYellow.flipX = !alienYellow.flipX}
    });
    //bouton du clavier
    cursor = this.input.keyboard.createCursorKeys();
    Akey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    Skey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    controlConfig = {
        camera : this.cameras.main,
        left : cursor.left,
        right : cursor.right,
        up : cursor.up,
        down : cursor.down,
        speed : 1
    }

    controls = new Phaser.Cameras.Controls.FixedKeyControl(controlConfig);
    
}


function update(time, delta){
    controls.update(delta);
    //deplacement du player
    if (cursor.left.isDown){
        players.x = players.x -= 7;
    }

    if (cursor.right.isDown){
        players.x = players.x += 7;
    }

    //lancer laser
    if (laser && laserReady){
        this.sound.play("kick");
        laserReady = false;
    }
    
    if (laser1 && laserReady1){
        this.sound.play("kick");
        laserReady1 = false;
    }
    
    if (Akey.isDown && laserReady) {
        laser = true;
    }
    
    if (Akey.isUp){
        laser = false;
        laserReady = true;
    }
    
    if (Skey.isDown && laserReady){
        laser1 = true;
    }
    
    if (Skey.isUp){
        laser1 = false;
        laserReady1 = true;
    }
}