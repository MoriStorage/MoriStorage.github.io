// js/game.js — Phaser 3 demo: walk, NPC, dialogue, simple menu
const TILE = 32;
const MAP_W = 25;
const MAP_H = 15;

class MainScene extends Phaser.Scene {
  constructor(){ super('MainScene'); }

  preload(){
    // Generate simple textures for player, npc and tiles
    const g = this.make.graphics({x:0,y:0,add:false});

    // ground tile (light)
    g.fillStyle(0x9bd37a,1); g.fillRect(0,0,TILE,TILE); g.generateTexture('ground',TILE,TILE);
    g.clear();

    // wall tile (dark)
    g.fillStyle(0x3b6b2b,1); g.fillRect(0,0,TILE,TILE); g.generateTexture('wall',TILE,TILE);
    g.clear();

    // player (blue circle)
    g.fillStyle(0x2b7cff,1); g.fillCircle(TILE/2,TILE/2,TILE/2 - 2); g.generateTexture('player',TILE - 4,TILE - 4);
    g.clear();

    // npc (orange)
    g.fillStyle(0xff9f43,1); g.fillCircle(TILE/2,TILE/2,TILE/2 - 2); g.generateTexture('npc',TILE - 4,TILE - 4);
    g.clear();

    // small font using DOM later; no external assets required
  }

  create(){
    this.cameras.main.setBackgroundColor('#88b36b');

    // simple tile map array: 0 ground, 1 wall
    this.map = [];
    for(let y=0;y<MAP_H;y++){
      this.map[y]=[];
      for(let x=0;x<MAP_W;x++){
        // border walls
        if(x===0||y===0||x===MAP_W-1||y===MAP_H-1) this.map[y][x]=1;
        else this.map[y][x]=0;
      }
    }
    // add some inner walls
    for(let x=4;x<10;x++) this.map[6][x]=1;
    for(let y=3;y<9;y++) this.map[y][12]=1;

    // draw tiles as static group with physics bodies for walls
    this.walls = this.physics.add.staticGroup();
    for(let y=0;y<MAP_H;y++){
      for(let x=0;x<MAP_W;x++){
        const px = x * TILE; const py = y * TILE;
        if(this.map[y][x]===0){
          this.add.image(px + TILE/2, py + TILE/2, 'ground').setOrigin(0.5);
        } else {
          const w = this.add.image(px + TILE/2, py + TILE/2, 'wall').setOrigin(0.5);
          this.walls.add(w);
        }
      }
    }

    // create player
    this.player = this.physics.add.sprite(TILE*2 + TILE/2, TILE*2 + TILE/2, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(20,20);
    this.player.body.setOffset(2,2);
    this.player.speed = 120;

    // npc
    this.npc = this.physics.add.staticSprite(TILE*8 + TILE/2, TILE*4 + TILE/2, 'npc');

    // collisions
    this.physics.add.collider(this.player, this.walls);

    // overlap for talking
    this.physics.add.overlap(this.player, this.npc, ()=>{ this.showDialogue("Hello! I'm a friendly NPC. Press Z to continue."); }, null, this);

    // camera
    this.cameras.main.startFollow(this.player, true, 0.08,0.08);
    this.cameras.main.setBounds(0,0,MAP_W*TILE, MAP_H*TILE);

    // input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyZ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    this.keyM = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);

    // UI: dialogue text and menu
    this.dialogueBox = this.add.rectangle(10, 10, 300, 70, 0x222222, 0.9).setOrigin(0).setScrollFactor(0).setVisible(false);
    this.dialogueText = this.add.text(18, 18, '', {font:'14px monospace',fill:'#fff',wordWrap:{width:270}}).setScrollFactor(0).setVisible(false);

    this.menuOpen = false;
    this.menuBox = this.add.rectangle(10, 90, 220, 120, 0x101010, 0.95).setOrigin(0).setScrollFactor(0).setVisible(false);
    this.menuText = this.add.text(18, 100, 'Menu\n- Inventory (empty)\n- Save (demo)', {font:'14px monospace',fill:'#fff'}).setScrollFactor(0).setVisible(false);

    // on Z press when dialogue visible, hide
    this.keyZ.on('down', ()=>{
      if(this.dialogueBox.visible) { this.hideDialogue(); }
      else {
        // if near npc open dialogue
        const dist = Phaser.Math.Distance.Between(this.player.x,this.player.y,this.npc.x,this.npc.y);
        if(dist < 44) this.showDialogue("Nice to meet you. This is a small demo built with Phaser 3.");
      }
    });

    // menu toggle
    this.keyM.on('down', ()=>{ this.toggleMenu(); });

    // instructions overlay
    this.instructions = this.add.text(8,8, 'Arrows: Move   Z: Talk   M: Menu', {font:'12px monospace',fill:'#fff'}).setScrollFactor(0);
  }

  update(time,dt){
    if(this.menuOpen) { this.player.setVelocity(0); return; }
    const speed = this.player.speed;
    let vx=0, vy=0;
    if(this.cursors.left.isDown) vx = -speed;
    else if(this.cursors.right.isDown) vx = speed;
    if(this.cursors.up.isDown) vy = -speed;
    else if(this.cursors.down.isDown) vy = speed;
    this.player.setVelocity(vx,vy);

    // small frictionless diagonal speed normalization
    if(vx!==0 && vy!==0){ this.player.setVelocity(vx*0.7071, vy*0.7071); }
  }

  showDialogue(text){
    this.dialogueBox.setVisible(true);
    this.dialogueText.setText(text).setVisible(true);
  }
  hideDialogue(){
    this.dialogueBox.setVisible(false);
    this.dialogueText.setVisible(false);
  }
  toggleMenu(){
    this.menuOpen = !this.menuOpen;
    this.menuBox.setVisible(this.menuOpen);
    this.menuText.setVisible(this.menuOpen);
  }
}

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 800,
  height: 480,
  backgroundColor: '#88b36b',
  physics: {
    default: 'arcade',
    arcade: { debug: false }
  },
  scene: [MainScene]
};

window.addEventListener('load', ()=>{ new Phaser.Game(config); });
