// js/game.js — Expanded Phaser 3 demo: multiple NPCs, dialogue queue, collectible item, inventory
const TILE = 32;
const MAP_W = 30;
const MAP_H = 20;

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

    // npc variant (pink)
    g.fillStyle(0xff6b9f,1); g.fillCircle(TILE/2,TILE/2,TILE/2 - 2); g.generateTexture('npc2',TILE - 4,TILE - 4);
    g.clear();

    // item (star-like circle)
    g.fillStyle(0xffe66d,1); g.fillCircle(TILE/2,TILE/2,8); g.generateTexture('item',16,16);
    g.clear();

    // toast background
    g.fillStyle(0x000000,0.7); g.fillRoundedRect(0,0,220,34,6); g.generateTexture('toastBg',220,34);
    g.clear();
  }

  create(){
    this.cameras.main.setBackgroundColor('#88b36b');

    // tile map array: 0 ground, 1 wall
    this.map = [];
    for(let y=0;y<MAP_H;y++){
      this.map[y]=[];
      for(let x=0;x<MAP_W;x++){
        // border walls
        if(x===0||y===0||x===MAP_W-1||y===MAP_H-1) this.map[y][x]=1;
        else this.map[y][x]=0;
      }
    }
    // add some inner walls to create corridors
    for(let x=4;x<14;x++) this.map[7][x]=1;
    for(let y=5;y<14;y++) this.map[y][15]=1;
    for(let x=10;x<22;x++) this.map[12][x]=1;

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

    // NPCs: create an array of npc descriptors (position + dialogue array)
    this.npcs = [];
    const npcDefs = [
      {x: TILE*8 + TILE/2, y: TILE*4 + TILE/2, key: 'npc', name: 'Old Fisher', lines:[
        "Hey there, stranger! The lake is calm today.",
        "I once caught a very big fish — or so I say..."
      ]},
      {x: TILE*18 + TILE/2, y: TILE*6 + TILE/2, key: 'npc2', name: 'Baker', lines:[
        "Fresh bread today! Would you like some?",
        "I heard there's an item hidden under a rock near the big tree."
      ]},
      {x: TILE*20 + TILE/2, y: TILE*14 + TILE/2, key: 'npc', name: 'Traveler', lines:[
        "I travel far and wide. This town is peaceful.",
        "Safe travels to you."
      ]}
    ];

    this.npcGroup = this.physics.add.staticGroup();
    npcDefs.forEach((d, i)=>{
      const s = this.physics.add.staticSprite(d.x, d.y, d.key);
      s.setData('name', d.name);
      s.setData('lines', d.lines.slice()); // copy
      s.setData('id', i);
      this.npcGroup.add(s);
      this.npcs.push(s);
    });

    // collision
    this.physics.add.collider(this.player, this.walls);

    // items (collectibles)
    this.items = this.physics.add.staticGroup();
    const item = this.physics.add.staticSprite(TILE*14 + TILE/2, TILE*10 + TILE/2, 'item');
    item.setData('type','coin');
    item.setData('value',1);
    this.items.add(item);

    // inventory
    this.inventory = { coin: 0 };

    // camera
    this.cameras.main.startFollow(this.player, true, 0.08,0.08);
    this.cameras.main.setBounds(0,0,MAP_W*TILE, MAP_H*TILE);

    // input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyZ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    this.keyM = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);

    // UI: dialogue text and menu
    this.dialogueBox = this.add.rectangle(10, 10, 380, 90, 0x222222, 0.95).setOrigin(0).setScrollFactor(0).setVisible(false);
    this.dialogueText = this.add.text(18, 18, '', {font:'14px monospace',fill:'#fff',wordWrap:{width:350}}).setScrollFactor(0).setVisible(false);
    this.dialogueName = this.add.text(18, 8, '', {font:'12px monospace',fill:'#ffd37a'}).setScrollFactor(0).setVisible(false);

    this.menuOpen = false;
    this.menuBox = this.add.rectangle(10, 110, 260, 160, 0x101010, 0.95).setOrigin(0).setScrollFactor(0).setVisible(false);
    this.menuText = this.add.text(18, 120, '', {font:'14px monospace',fill:'#fff'}).setScrollFactor(0).setVisible(false);

    // toast for pickup
    this.toast = this.add.container(0,0).setScrollFactor(0).setVisible(false);
    const bg = this.add.image(0,0,'toastBg').setOrigin(0);
    const toastText = this.add.text(12,6,'', {font:'13px monospace',fill:'#fff'});
    this.toast.add([bg, toastText]);
    this.toast.setPosition(10, 280);
    this._toastText = toastText;

    // dialogue queue state
    this.dialogueQueue = null; // {name, lines, index}

    // Z key behavior: advance/hide dialogue OR start dialogue OR pick up item
    this.keyZ.on('down', ()=>{
      if(this.dialogueQueue){
        this.advanceDialogue();
        return;
      }
      // check nearest NPC within range
      const npc = this.findNearbyNPC(48);
      if(npc){
        this.startDialogue(npc.getData('name'), npc.getData('lines'));
        return;
      }
      // check nearby item
      const found = this.findNearbyItem(32);
      if(found){ this.pickupItem(found); return; }
    });

    // menu toggle
    this.keyM.on('down', ()=>{ this.toggleMenu(); });

    // instructions overlay
    this.instructions = this.add.text(8,8, 'Arrows: Move   Z: Talk/Pickup   M: Menu', {font:'12px monospace',fill:'#fff'}).setScrollFactor(0);
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

    // diagonal normalization
    if(vx!==0 && vy!==0){ this.player.setVelocity(vx*0.7071, vy*0.7071); }
  }

  // helpers
  findNearbyNPC(range){
    let nearest = null; let dist = Infinity;
    this.npcs.forEach(n => {
      const d = Phaser.Math.Distance.Between(this.player.x,this.player.y,n.x,n.y);
      if(d < range && d < dist){ nearest = n; dist = d; }
    });
    return nearest;
  }
  findNearbyItem(range){
    let found = null; let dist = Infinity;
    this.items.getChildren().forEach(it => {
      const d = Phaser.Math.Distance.Between(this.player.x,this.player.y,it.x,it.y);
      if(d < range && d < dist){ found = it; dist = d; }
    });
    return found;
  }

  startDialogue(name, lines){
    // copy lines to avoid mutating original
    this.dialogueQueue = { name, lines: lines.slice(), index: 0 };
    this.showDialogueLine();
  }
  showDialogueLine(){
    if(!this.dialogueQueue) return;
    const { name, lines, index } = this.dialogueQueue;
    const text = lines[index] || '';
    this.dialogueName.setText(name).setVisible(true);
    this.dialogueBox.setVisible(true);
    this.dialogueText.setText(text).setVisible(true);
  }
  advanceDialogue(){
    if(!this.dialogueQueue) return;
    this.dialogueQueue.index += 1;
    if(this.dialogueQueue.index >= this.dialogueQueue.lines.length){
      this.endDialogue();
    } else {
      this.showDialogueLine();
    }
  }
  endDialogue(){
    this.dialogueQueue = null;
    this.dialogueBox.setVisible(false);
    this.dialogueText.setVisible(false);
    this.dialogueName.setVisible(false);
  }

  pickupItem(item){
    const type = item.getData('type');
    const val = item.getData('value') || 1;
    if(type === 'coin'){
      this.inventory.coin += val;
      // remove item
      item.destroy();
      this.showToast(`Picked up a coin!   Total: ${this.inventory.coin}`);
      // update menu text if open
      if(this.menuOpen) this.updateMenuText();
    }
  }

  showToast(text, duration=1800){
    this._toastText.setText(text);
    this.toast.setVisible(true);
    if(this._toastTimer) this._toastTimer.remove();
    this._toastTimer = this.time.delayedCall(duration, ()=>{ this.toast.setVisible(false); }, [], this);
  }

  toggleMenu(){
    this.menuOpen = !this.menuOpen;
    this.menuBox.setVisible(this.menuOpen);
    this.menuText.setVisible(this.menuOpen);
    if(this.menuOpen) this.updateMenuText();
  }
  updateMenuText(){
    const lines = [];
    lines.push('Menu');
    lines.push('----');
    lines.push(`Coins: ${this.inventory.coin}`);
    lines.push('Inventory: (demo)');
    lines.push('\nControls: Arrows, Z, M');
    this.menuText.setText(lines.join('\n'));
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
