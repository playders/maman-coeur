
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
var score = 0;
var spawn = null;
var isAlive = true;
var restart = null;

const game = new Phaser.Game(config);


// Chargement des éléments
function preload() {
    // Charge les tiles pour la carte
    this.load.image("tiles", "tilesheet.png");
    this.load.tilemapTiledJSON("map","1erN.json");
    
    // Charge l'image du player
    this.load.image("Players","coeur.png");
    this.load.image("Blesse","coeur_blesse.png");


    // Charge l'image de l'arrière plan
    this.load.image("back","backgrond.png");

    // Charge les images des enemis
    this.load.image("alien","alienYellow.png");
    this.load.image("alien1","alienYellow_walk1.png");
    this.load.image("alien2","alienYellow_walk2.png");

    //charger Game Over
    this.load.image("GameOver","GameOver.jpg");
    this.load.image("restart","restart1.png")

    // Charge les sons
    this.load.audio("gemme","gemme.ogg");
    this.load.audio("jump","jump.wav");
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

    //spawn du players
    this.spawn = this.tilemap.findObject("objet", obj => obj.name === "spawn");

    // Défini les limites de la carte
    this.worldLayer.setCollisionByProperty({colides : true});
    this.physics.world.setBounds(0,0,this.tilemap.widthInPixels,this.tilemap.heightInPixels);

    //afficher le score
    var policeTitre = {
        fontSize : "32px",
        color : "#FF0000",
        fontFamily : "ZCOOL KuaiLe"
    }
    this.scoreText = this.add.text (16 , 16, "Score : 0", policeTitre);
    this.scoreText.setScrollFactor(0);
    this.score = 0;

    // Crée le joueur et défini les limite du joueur sur la carte
    players = this.physics.add.sprite(this.spawn.x,this.spawn.y,"Players");
    players.setScale(0.8);
    players.setCollideWorldBounds(true);

    //TODO
    //players blessé
    function PlayersBlessé(){
        players.setTexture("Blesse");
        this.add.sprite(750,500,"GameOver");
        restart = this.add.sprite(750,630,"restart").setInteractive();
        restart.setScale(0.5);
        restart.on("pointerdown", function(){
            
        });
        isAlive = false;
    }

    //recuperer jemes
    this.overlapLayer.setTileIndexCallback(50, collectGemme, this);
    this.overlapLayer.setTileIndexCallback(51, collectGemme, this);
    this.overlapLayer.setTileIndexCallback(52, collectGemme, this);
    this.overlapLayer.setTileIndexCallback(53, collectGemme, this);
    this.physics.add.overlap(players, this.overlapLayer);

    //pic
    this.overlapLayer.setTileIndexCallback(71, PlayersBlessé, this);

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
    var alienYellow = this.physics.add.sprite(340,620,"alien1").play("alienAnim");
    this.physics.add.collider(alienYellow, this.worldLayer);
    this.physics.add.overlap(players, alienYellow, attaque);
    alienYellow.setScale(0.5);
    var tween = this.tweens.add({
        targets : alienYellow,
        x : 450,
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
function attaque(){
    if (isJumping){
        console.log("enemie mort");
    }
    else if (!isJumping){
        console.log("tu est mort");
    }
}


function update(time, delta){
    //controls.update(delta);
    //deplacement du player
    if (cursor.left.isDown && isAlive){
        players.setVelocityX(-250);
    } else if (cursor.right.isDown && isAlive){
        players.setVelocityX(250);
    } else {
        players.setVelocityX(0);
    }

    // isJumping est vrai si le joueur ne touche pas le sol.
    this.isJumping = !players.body.onFloor();

    if (cursor.up.isDown && !this.isJumping && isAlive) {
        this.sound.play("jump");
        players.setVelocityY(-400);
    }

    //vide
    if (players.y > 900) {
        this.game.destroy();
        //PlayersBlessé();
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
    if (fenetreRacio < configRacio) {
        canvas.style.width = fenetreWidth + "px";
        canvas.style.height = (fenetreWidth/configRacio) + "px";
    }
    else {
        canvas.style.width = (fenetreHeight * configRacio) + "px";
        canvas.style.height = fenetreHeight + "px";
    }
}

var collectGemme = function (players, tile){
    this.sound.play("gemme");
    this.overlapLayer.removeTileAt(tile.x,tile.y).destroy();
    switch(tile.index) {
        case 50:
            this.score+=5;
            break;
        case 51:
            this.score+=10;
            break;
        case 52:
            this.score+=1;
            break;
        case 53:
            this.score+=20;
            break;
    }
    this.scoreText.setText("Score : " + this.score);
}