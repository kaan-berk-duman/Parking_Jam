import * as PIXI from "pixi.js";

export function createMenu(app, onPlay, onSettings) {
  const menuContainer = new PIXI.Container();

  const backgroundTexture = PIXI.Texture.from("background.png");
  const background = new PIXI.Sprite(backgroundTexture);
  
  background.width = app.screen.width;
  background.height = app.screen.height;

  const blurFilter = new PIXI.filters.BlurFilter();
  blurFilter.blur = 5;
  background.filters = [blurFilter];

  menuContainer.addChild(background);

  const titleText = new PIXI.Text("Parking Jam 🚗", {
    fontFamily: "Roboto",
    fontSize: 40,
    fill: 0xffffff,
    fontWeight: "bold",
  });
  titleText.anchor.set(0.5);
  titleText.x = app.screen.width / 2;
  titleText.y = app.screen.height / 3;
  menuContainer.addChild(titleText);

  function createButton(text, x, y, onClick) {
    const buttonContainer = new PIXI.Container();

    const buttonBg = new PIXI.Graphics();
    buttonBg.beginFill(0x444444);
    buttonBg.drawRoundedRect(-75, -25, 150, 50, 10);
    buttonBg.endFill();

    const buttonText = new PIXI.Text(text, {
      fontFamily: "Arial",
      fontSize: 24,
      fill: 0xffffff,
    });
    buttonText.anchor.set(0.5);
    buttonContainer.addChild(buttonBg, buttonText);
    buttonContainer.x = x;
    buttonContainer.y = y;
    buttonContainer.interactive = true;
    buttonContainer.buttonMode = true;
    buttonContainer.on("pointerdown", onClick);

    // Hover effect
    buttonContainer.on("pointerover", () => {
      buttonBg.tint = 0x666666;
    });
    buttonContainer.on("pointerout", () => {
      buttonBg.tint = 0xffffff;
    });

    return buttonContainer;
  }

  const playButton = createButton("Play", app.screen.width / 2, app.screen.height / 2, onPlay);
  const settingsButton = createButton("Settings", app.screen.width / 2, app.screen.height / 2 + 80, onSettings);

  menuContainer.addChild(playButton, settingsButton);

  return menuContainer;
}
