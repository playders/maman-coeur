
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

// Variable et constant
var players = null;
var cursor = null;
var isJumping = false;
var score = 0;
var spawn = null;
var spawn1 = null;
var spawn2 = null;
var life = 2;
var level = 1;

// Initialise le tableau des scores
getScores().map(s => addScoreLine(s.name, s.score));

document.getElementById("start").onclick = function() {
    document.getElementById("startgame").style.display = "none";
    new Phaser.Game(config);
    life = 2;
    level = 1;
    score = 0;
};

document.getElementById("valider-nom").onclick = function() {
    document.getElementById("insert-name").style.display = "none";
    document.getElementById("tableau-score").style.display = "block";
};

// Chargement des éléments
function preload() {

    // Charge les tiles pour la carte
    this.load.image("tiles", "tilesheet.png");
    this.load.tilemapTiledJSON("map", "levels.json");
    
    // Charge l'image du player
    this.load.image("Players","coeur.png");
    this.load.image("Blesse","coeur_blesse.png");

    // Charge la vie ä 2 et le délai à "true"
    this.power = 2;
    this.delaiOK = true;

    // Charge l'image de l'arrière plan
    this.load.image("back","backgrond.png");

    // Charge les images des enemis
    this.load.image("alien","alienYellow.png");
    this.load.image("alien1","alienYellow_walk1.png");
    this.load.image("alien2","alienYellow_walk2.png");

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
    this.downLayer = this.tilemap.createLayer("bot-level" + level,this.tileset,0, 0);
    this.worldLayer = this.tilemap.createLayer("world-level" + level,this.tileset,0, 0);
    this.overlapLayer = this.tilemap.createLayer("overlap-level" + level,this.tileset,0, 0);

    //spawn du players
    this.spawn = this.tilemap.findObject("objet", obj => obj.name === "spawn");

    //spawn enemis
    this.spawns = [];
    this.spawns.push(this.tilemap.findObject("objet", obj => obj.name === "enemis1"));
    this.spawns.push(this.tilemap.findObject("objet", obj => obj.name === "enemis2"));

    // Défini les limites de la carte
    this.worldLayer.setCollisionByProperty({colides : true});
    this.physics.world.setBounds(0,0,this.tilemap.widthInPixels,this.tilemap.heightInPixels);

    // Afficher le score
    var policeTitre = {
        fontSize : "32px",
        color : "#FF0000",
        fontFamily : "ZCOOL KuaiLe"
    }
    this.scoreText = this.add.text (16 , 16, "Score : " + score, policeTitre);
    this.scoreText.setScrollFactor(0);

    // Afficher le score
    this.lifeText = this.add.text (316 , 16, "Life : " + life, policeTitre);
    this.lifeText.setScrollFactor(0);

    // Crée le joueur et défini les limite du joueur sur la carte
    players = this.physics.add.sprite(this.spawn.x,this.spawn.y,"Players");
    players.setScale(0.8);
    players.setCollideWorldBounds(true);

    // Va au prochain niveau
    function NextLevel() {
        level++;
        if (level > 3) {
            this.game.destroy();
            FinDePartie(this.game, true);
        } else {
            this.scene.restart();
        }
    }

    // Ajoute une vie
    function AddLife(obj, tile) {
        this.power = 2;
        players.setTexture("Players");
        this.overlapLayer.removeTileAt(tile.x,tile.y).destroy();
    }

    //recuperer jemes
    this.overlapLayer.setTileIndexCallback(50, collectGemme, this);
    this.overlapLayer.setTileIndexCallback(51, collectGemme, this);
    this.overlapLayer.setTileIndexCallback(52, collectGemme, this);
    this.overlapLayer.setTileIndexCallback(53, collectGemme, this);
    this.physics.add.overlap(players, this.overlapLayer);

    // Pic
    this.overlapLayer.setTileIndexCallback(71, PlayersBlesse, this);

    // Portail
    this.overlapLayer.setTileIndexCallback(26, NextLevel, this);
    this.overlapLayer.setTileIndexCallback(11, NextLevel, this);

    // Coeur
    this.overlapLayer.setTileIndexCallback(68, AddLife, this);
 
    // Animation alien
    this.anims.create({
        key: "alienAnim",
        frames: [
            {key: "alien1"},
            {key: "alien2"}
        ],
        frameRate: 8,
        repeat: -1
    });
    
    this.aliensYellow = [];
    this.aliensYellow.push(this.physics.add.sprite(this.spawns[0].x,this.spawns[0].y, "alien1").play("alienAnim"));
    this.aliensYellow.push(this.physics.add.sprite(this.spawns[1].x,this.spawns[1].y, "alien1").play("alienAnim"));

    this.aliensYellow.map((alienYellow, index) => {
        this.physics.add.collider(alienYellow, this.worldLayer);
        alienYellow.setScale(0.5);
        console.log('index', index);
        console.log('this.spawns', this.spawns);
        var tween = this.tweens.add({
            targets : alienYellow,
            x : this.spawns[index].x + 150,
            ease : "Linear",
            duration : 1000,
            yoyo : true,
            repeat : -1,
            onStart : function (){},
            onComplete : function (){},
            onYoyo : function (){ alienYellow.flipX = !alienYellow.flipX},
            onRepeat : function (){alienYellow.flipX = !alienYellow.flipX}
        });
    });

    // Bouton du clavier
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

    function attaque(){
        if (!players.body.onFloor()){
            console.log("enemie mort");
        }
        else {
            console.log("tu est mort");
        }
    }    
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

    if (cursor.space.isDown && !this.isJumping) {
        this.sound.play("jump");
        players.setVelocityY(-400);
    }

    // Vide
    if (players.y > 900) {
        perdUneVie(this);
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

    // Gère la collision entre le joueur et l'enemi.
    this.aliensYellow.map(alienYellow => {
        this.physics.world.collide(players, alienYellow, function(player, enemy){
    
            // Lorsque le joueur saute sur l'enemi, tue l'enemi.
            if(enemy.body.touching.up && player.body.touching.down){
                alienYellow.destroy();
            }
            // Sinon blesse le joueur.
            else {
                PlayersBlesse(this);
            }
        }, null, this);
    });
}

// Players blessé
function PlayersBlesse(obj, obj2) {
    if (obj2) {
        obj = this;
    }
    if (obj.delaiOK) {
        obj.delaiOK = false;
        if (obj.power === 2) {
            players.setTexture("Blesse");
            setTimeout(() => {
                obj.delaiOK = true;
            }, 1000);
            obj.power--;
        } else {
            perdUneVie(obj);            
        }
    }
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
            score+=5;
            break;
        case 51:
            score+=10;
            break;
        case 52:
            score+=1;
            break;
        case 53:
            score+=20;
            break;
    }
    this.scoreText.setText("Score : " + score);
}

function perdUneVie(game) {
    if (life > 0) {
        game.scene.restart();
    } else {
        FinDePartie(game.game, false);
    }
    life--;
}

function FinDePartie(game, win) {
    game.destroy(true, false);
    if (win) {
        document.getElementById("message").innerHTML = "Vous avez gagné avec " + score + " points !";
    } else {
        document.getElementById("message").innerHTML = "Game over"
    }

    addScore(score);
    document.getElementById("start").innerHTML = "Restart Game";
    document.getElementById("startgame").style.display = "block";
}

// Récupère la liste des scores
function getScores() {
    return JSON.parse(localStorage.getItem('scores')) || [];
}

// Ajoute un score
function addScore(score) {
    const name = document.getElementById("playername").value;
    newScore = {
        name,
        score
    }
    addScoreLine(name, score);
    scores = getScores();
    scores.push(newScore);
    localStorage.setItem('scores', JSON.stringify(scores));
}

function addScoreLine(name, score) {
    var ul = document.getElementById("list-scores");
    var li = document.createElement("li");
    li.classList.add("list-group-item");
    li.appendChild(document.createTextNode(name + " : " + score));
    ul.appendChild(li);
}
