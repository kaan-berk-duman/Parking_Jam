import { Application } from "pixi.js";
import {
  Model,
  LightingEnvironment,
  ShadowCastingLight,
  ShadowQuality,
  ImageBasedLighting,
  Light,
  LightType,
  Camera,
} from "pixi3d";
import { createMap } from "./map";
import { createMenu } from "./menu";

let app = new Application({
  backgroundColor: 0xdddddd,
  resizeTo: window,
  antialias: true
});
document.body.appendChild(app.view);

app.loader.add(
  "diffuse.cubemap",
  "/assets/chromatic/diffuse.cubemap"
);
app.loader.add(
  "specular.cubemap",
  "/assets/chromatic/specular.cubemap"
);
app.loader.add(
  "ground.gltf",
  "/assets/ground.gltf"
);
app.loader.add(
  "house.gltf",
  "/assets/house.gltf"
);
app.loader.add(
  "racer.gltf",
  "/assets/racer.gltf"
);
app.loader.add(
  "racerLow.gltf",
  "/assets/racerLow.gltf"
);
app.loader.add(
  "road.gltf",
  "/assets/road.gltf"
);
app.loader.add(
  "roadCurve.gltf",
  "/assets/roadCurve.gltf"
);
app.loader.add(
  "speedster.gltf",
  "/assets/speedster.gltf"
);
app.loader.add(
  "tree.gltf",
  "/assets/tree.gltf"
);
app.loader.add(
  "truck.gltf",
  "/assets/truck.gltf"
);
app.loader.add(
  "suv.gltf",
  "/assets/suv.gltf"
);

app.loader.load((_, resources) => {

  function startGame() {
    app.stage.removeChild(menu);
    
    const mapContainer = createMap(resources);
    mapContainer.interactive = true;
    app.stage.addChild(mapContainer);

    // Light settings
    LightingEnvironment.main = new LightingEnvironment(
      app.renderer,
      new ImageBasedLighting(
        resources["diffuse.cubemap"].cubemap,
        resources["specular.cubemap"].cubemap
      )
    );
    const directionalLight = new Light();
    directionalLight.intensity = 1;
    directionalLight.type = LightType.directional;
    directionalLight.rotationQuaternion.setEulerAngles(45, 120, 0);
    LightingEnvironment.main.lights.push(directionalLight);

    const shadowCastingLight = new ShadowCastingLight(
      app.renderer,
      directionalLight,
      { shadowTextureSize: 1024, quality: ShadowQuality.high }
    );
    shadowCastingLight.softness = 1;
    shadowCastingLight.shadowArea = 30;

    const pipeline = app.renderer.plugins.pipeline;
    mapContainer.children.forEach((child) => {
      if (child instanceof Model) {
        pipeline.enableShadows(child, shadowCastingLight);
      }
    });
  }

  function openSettings() {
    console.log("Settings clicked");
  }

  const menu = createMenu(app, startGame, openSettings);
  app.stage.addChild(menu);
});

// Camera settings
const camera = new Camera(app.renderer);
camera.position.set(-5.5, 10, 5.5);
camera.rotationQuaternion.setEulerAngles(55, 135, 0);
Camera.main = camera;
