# MoriStorage Web Game Demo (expanded)

This branch contains a Phaser 3 demo scaffold (branch: `web-game`) showing a small top-down scene. This commit expands the demo with the following features:

- Three NPCs with individual dialogue sequences (press Z near an NPC to talk; press Z to advance dialogue).
- A collectible item (coin) that can be picked up by pressing Z when nearby; collected coins show in the menu.
- Inventory counter displayed in the M menu.
- Larger map with more walls/corridors and simple toast messages for pickups.

How to run locally

- Option A (quick, Python):
  - python3 -m http.server 8000 (from repository root) and open http://localhost:8000/index.html
- Option B (Node):
  - npx http-server -c-1

Testing the new features

- Move close to each NPC and press Z to start dialogue. Press Z to advance through lines.
- Move to the coin (near the center of the map) and press Z to pick it up — you will see a toast and the menu (M) will show the updated coin count.

Next steps I can take

- Replace placeholder programmatically-generated art with images from your site (you can specify paths).
- Add map scenes and a scene transition system, or import Tiled maps.
- Add a persistent save (localStorage) and more inventory item types.

If you want this expanded demo published to the live Pages site, tell me and I will push the web-game changes to the main branch and enable Pages (or open a PR to merge).
