//configuration du jeu
var config = {
    type : Phaser.AUTO,
    backgroundColor : "#22E1EA",
    width : 600,
    height : 400,
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
var laser = false;
var laserReady1 = true;
var laser1 = false;
var isJumping = false;

const game = new Phaser.Game(config);


// Chargement des éléments
function preload() {
    // Charge les tiles pour la carte
    this.load.image("tiles", "tilesheet.png");
    this.load.tilemapTiledJSON("map","1erN.json");
    
    // Charge l'image du player
    this.load.image("Players","coeur.png");

    // Charge l'image de l'arrière plan
    this.load.image("back","backgrond.png");

    // Charge les images des enemis
    this.load.image("alien","alienYellow.png");
    this.load.image("alien1","alienYellow_walk1.png");
    this.load.image("alien2","alienYellow_walk2.png");

    // Charge le son du coup de pied
    this.load.audio("kick","kick.ogg");
}

// Création du jeu
function create(){

    // Positionnement de la caméra au centre du jeu
    var cameraCentreX = this.cameras.main.centerX;
    var cameraCentreY = this.cameras.main.centerY;

    // Affichage de la carte
    this.tilemap = this.make.tilemap({key: "map"});
    this.tileset = this.tilemap.addTilesetImage("tilesheet","tiles");

    // Affichage des couches de la carte
    this.downLayer = this.tilemap.createStaticLayer("bot",this.tileset,0, 0);
    this.worldLayer = this.tilemap.createStaticLayer("world",this.tileset,0, 0);
    this.topLayer = this.tilemap.createStaticLayer("top",this.tileset, 0, 0);
    this.overlapLayer = this.tilemap.createDynamicLayer("overlap",this.tileset,0, 0);

    // Défini les limites de la carte
    this.worldLayer.setCollisionByProperty({colides : true});
    this.physics.world.setBounds(0,0,this.tilemap.widthInPixels,this.tilemap.heightInPixels);

    // Crée le joueur et défini les limite du joueur sur la carte
    players = this.physics.add.sprite(100, 620,"Players");
    players.setScale(0.8);
    players.setCollideWorldBounds(true);

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
    var alienYellow = this.add.sprite(500, cameraCentreY,"alien1").play("alienAnim");
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
        speed : 0.1
    }

    // Ajoute la collision entre worldLayer et players.
    this.physics.add.collider(players, this.worldLayer);

    // Gère la caméra
    this.cameras.main.startFollow(players);
    this.cameras.main.setBounds(0, 0,this.tilemap.widthInPixels,this.tilemap.heightInPixels);
}


function update(time, delta){
    //controls.update(delta);
    //deplacement du player
    if (cursor.left.isDown){
        players.setVelocityX(-250);
    } else if (cursor.right.isDown){
        players.setVelocityX(250);
    } else {
        players.setVelocityX(0);
    }

    // isJumping est vrai si le joueur ne touche pas le sol.
    this.isJumping = !players.body.onFloor();

    if (cursor.up.isDown && !this.isJumping) {
        players.setVelocityY(-400);
    }

    if (players.y > 900) {
        console.log('Game over');
        this.game.destroy();
    }

    //lancer laser
    /*
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
    */
    AjusterTailleEcran();
}

    function AjusterTailleEcran(){
        var canvas = document.querySelector("canvas");
        var fenetreWidth = window.innerWidth;
        var fenetreHeight = window.innerHeight;
        var fenetreRacio = fenetreWidth / fenetreHeight;
        var configRacio = config.width/config.height;
        if(fenetreRacio < configRacio){
            canvas.style.width = fenetreWidth + "px";
            canvas.style.height = (fenetreWidth/configRacio) + "px";
    }
        else {
            canvas.style.width = (fenetreHeight * configRacio) + "px";
            canvas.style.height = fenetreHeight + "px";
    }
}