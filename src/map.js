import * as PIXI from "pixi.js";
import { Container } from "pixi.js";
import { Model, PickingHitArea } from "pixi3d";
import { displaySuccessView } from "./finish.js";

export function createMap(resources) {
  const mapContainer = new Container();
  // Ground
  const ground = Model.from(resources["ground.gltf"].gltf);
  ground.scale.set(15, 0.1, 15);
  ground.position.set(-16, 0, 16);
  mapContainer.addChild(ground);

  // Corner roads
  const cornerTL = Model.from(resources["roadCurve.gltf"].gltf);
  cornerTL.scale.set(2);
  cornerTL.position.set(-3, 0.1, -4.5);
  cornerTL.rotationQuaternion.setEulerAngles(0, 270, 0);
  mapContainer.addChild(cornerTL);

  const cornerBR = Model.from(resources["roadCurve.gltf"].gltf);
  cornerBR.scale.set(2);
  cornerBR.position.set(4, 0.1, 5);
  cornerBR.rotationQuaternion.setEulerAngles(0, 90, 0);
  mapContainer.addChild(cornerBR);

  const cornerBL = Model.from(resources["roadCurve.gltf"].gltf);
  cornerBL.scale.set(2);
  cornerBL.position.set(-4.5, 0.1, 3.5);
  cornerBL.rotationQuaternion.setEulerAngles(0, 0, 0);
  mapContainer.addChild(cornerBL);

  // Straight roads
  const topRoad = Model.from(resources["road.gltf"].gltf);
  topRoad.scale.set(22, 2, 2);
  topRoad.position.set(7.5, 0.1, -6);
  topRoad.rotationQuaternion.setEulerAngles(0, 0, 0);
  mapContainer.addChild(topRoad);

  const rightRoad = Model.from(resources["road.gltf"].gltf);
  rightRoad.scale.set(7.7, 2, 2);
  rightRoad.position.set(4, 0.1, 0.3);
  rightRoad.rotationQuaternion.setEulerAngles(0, 90, 0);
  mapContainer.addChild(rightRoad);

  const bottomRoad = Model.from(resources["road.gltf"].gltf);
  bottomRoad.scale.set(8, 2, 2);
  bottomRoad.position.set(0.5, 0.1, 6.5);
  bottomRoad.rotationQuaternion.setEulerAngles(0, 180, 0);
  mapContainer.addChild(bottomRoad);

  const leftRoad = Model.from(resources["road.gltf"].gltf);
  leftRoad.scale.set(7.7, 2, 2);
  leftRoad.position.set(-3, 0.1, 0.3);
  leftRoad.rotationQuaternion.setEulerAngles(0, 270, 0);
  mapContainer.addChild(leftRoad);

  // Houses and trees
  placeHousesAndTrees(mapContainer, resources, -2, -9, 0);
  placeHousesAndTrees(mapContainer, resources, 6, -9, 0);
  placeHousesAndTrees(mapContainer, resources, 9, 0, 6);
  placeHousesAndTrees(mapContainer, resources, -9, -3, 2);
  placeHousesAndTrees(mapContainer, resources, -1, 9, 4);
  placeHousesAndTrees(mapContainer, resources, 8, 8, 5);

  // Cars
  placeCars(mapContainer, resources);

  //Obstacles
  placeObstacles(mapContainer, resources);
  return mapContainer;
}

function placeHousesAndTrees(container, resources, centerX, centerZ, rotationType) {
  const offsets = [
    { x: 0, z: 0 }, // house
    { x: 3, z: 3 }, // tree
  ];

  for (let i = 0; i < 2; i++) {
    let isHouse = i === 0;
    let model = Model.from(isHouse ? resources["house.gltf"].gltf : resources["tree.gltf"].gltf);
    model.scale.set(3);

    let offset = offsets[i];
    model.position.set(centerX + offset.x, 0, centerZ + offset.z);

    let baseRotation = rotationType * 45;
    model.rotationQuaternion.setEulerAngles(0, baseRotation, 0);

    container.addChild(model);
  }
}

// car moves interact
function addInteractionHandlers(model, defaultScale, hoverScale) {
  model.interactive = true;
  model.buttonMode = true;
  model.hitArea = new PickingHitArea(model);

  model.on("pointerdown", (event) => {
    if (!model.isFollowingRoad) {
      model.scale.set(hoverScale);
      model.dragging = true;
      model.dragStart = event.data.getLocalPosition(model.parent);
      model.startPosition = model.position.clone();
      model.lastDragPos = model.dragStart.clone();
      model.hasCollided = false;
      model.fixedSpeedSet = false;
    }
  });

  model.on("pointermove", (event) => {
    if (model.dragging && !model.isFollowingRoad) {
      const newPos = event.data.getLocalPosition(model.parent);
      const threshold = 0.5; // Drag distance required for speed to be active

      if (!model.fixedSpeedSet) {
        if (model.dragAxis === "x") {
          const deltaX = newPos.x - model.dragStart.x;
          if (Math.abs(deltaX) > threshold) {
            // going back and front
            model.velocity = deltaX > 0 ? 0.15 : -0.15;
            model.fixedSpeedSet = true;
          }
        } else if (model.dragAxis === "z") {
          const deltaY = newPos.y - model.dragStart.y;
          if (Math.abs(deltaY) > threshold) {
            model.velocity = deltaY > 0 ? 0.15 : -0.15;
            model.fixedSpeedSet = true;
          }
        }
      }
    }
  });

  model.on("pointerup", () => {
    if (!model.isFollowingRoad) {
      model.scale.set(defaultScale);
      model.dragging = false;
    }
  });
  model.on("pointerupoutside", () => {
    model.dragging = false;
  });
  model.on("pointerout", () => {
    if (!model.isFollowingRoad) {
      model.scale.set(defaultScale);
      model.dragging = false;
    }
  });
}

function placeCars(container, resources) {
  const defaultScale = 1.5;
  const hoverScale = 1.55;
  const cars = [];

  // Car 1
  const car1 = Model.from(resources["suv.gltf"].gltf);
  car1.position.set(-0.25, 0.1, 0);
  car1.scale.set(defaultScale);
  car1.rotationQuaternion.setEulerAngles(0, 180, 0);
  car1.dragAxis = "z";
  addInteractionHandlers(car1, defaultScale, hoverScale);
  container.addChild(car1);
  cars.push(car1);

  // Car 2
  const car2 = Model.from(resources["racer.gltf"].gltf);
  car2.position.set(1.25, 0.1, 0);
  car2.scale.set(defaultScale);
  car2.dragAxis = "z";
  addInteractionHandlers(car2, defaultScale, hoverScale);
  container.addChild(car2);
  cars.push(car2);

  // Car 3
  const car3 = Model.from(resources["truck.gltf"].gltf);
  car3.position.set(-2.75, 0.1, 0);
  car3.scale.set(defaultScale);
  car3.rotationQuaternion.setEulerAngles(0, 90, 0);
  car3.dragAxis = "x";
  addInteractionHandlers(car3, defaultScale, hoverScale);
  container.addChild(car3);
  cars.push(car3);

  // Car 4
  const car4 = Model.from(resources["truck.gltf"].gltf);
  car4.position.set(3.5, 0.1, -2);
  car4.scale.set(defaultScale);
  car4.rotationQuaternion.setEulerAngles(0, 270, 0);
  car4.dragAxis = "x";
  addInteractionHandlers(car4, defaultScale, hoverScale);
  container.addChild(car4);
  cars.push(car4);

  // Car 5
  const car5 = Model.from(resources["suv.gltf"].gltf);
  car5.position.set(3.5, 0.1, 1);
  car5.scale.set(defaultScale);
  car5.rotationQuaternion.setEulerAngles(0, 0, 0);
  car5.dragAxis = "z";
  addInteractionHandlers(car5, defaultScale, hoverScale);
  container.addChild(car5);
  cars.push(car5);

  const roadPath = [
    { x: 5.5, z: -2 },    // front truck
    { x: 5.5, z: 4.75 },  // first corner
    { x: -0.5, z: 4.75 }, // front purple car road
    { x: -4.5, z: 4.75 }, // second corner
    { x: -4.5, z: -0.5 }, // front truck
    { x: -4.5, z: -4.5 }, // last exit corner
    { x: 1.5, z: -4.5 },  // front green car road
    { x: 14, z: -4.5 }    // exit
  ];

  const roadBoundingBoxes = [
    { xMin: -5, xMax: 5, zMin: -7, zMax: -3 },  // topRoad
    { xMin: 4.5, xMax: 5.5, zMin: -2.5, zMax: 7 }, // rightRoad
    { xMin: -1, xMax: 3, zMin: 4.5, zMax: 7 },     // bottomRoad
    { xMin: -5, xMax: -3, zMin: -1, zMax: 7 }       // leftRoad
  ];

  cars.forEach((car) => {
    car.isFollowingRoad = false;
    car.currentWaypointIndex = 0;
    car.speed = 0.15;
    car.velocity = 0;
  });

  window.cars = cars;

  let allExitedLogged = false;

  PIXI.Ticker.shared.add(() => {
    cars.forEach((car) => {
      if (car.dragging) return;
      const currentPos = { x: car.position.x, z: car.position.z };

      if (!car.isFollowingRoad) {
        if (car.velocity) {
          const axis = car.dragAxis;
          const proposedPosition = axis === "x"
            ? { x: car.position.x + car.velocity, z: car.position.z }
            : { x: car.position.x, z: car.position.z + car.velocity };

          if (!checkCarCollisionAlongPath(car, currentPos, proposedPosition)) {
            if (axis === "x") {
              car.position.x += car.velocity;
            } else if (axis === "z") {
              car.position.z += car.velocity;
            }
          } else {
            car.velocity = 0;
            console.log("Collision");
          }
        }

        if (isCarOnRoad(car, roadBoundingBoxes)) {
          car.isFollowingRoad = true;
          car.currentWaypointIndex = findClosestWaypointIndex(
            { x: car.position.x, z: car.position.z },
            roadPath
          );
        }
      }

      if (car.isFollowingRoad) {
        moveCarAlongPath(car, roadPath);
      }
      const exit = { x: 14, z: -4.5 };
      const dx = car.position.x - exit.x;
      const dz = car.position.z - exit.z;
      const distance = Math.sqrt(dx * dx + dz * dz);
      const exitThreshold = 0.5;
      if (!car.hasExited && distance < exitThreshold) {
        car.hasExited = true;
      }
    });

    if (!allExitedLogged && cars.every(car => car.hasExited)) {
      console.log("başardınız");
      displaySuccessView();
      allExitedLogged = true;
    }
  });
}

function isCarOnRoad(car, roadBoundingBoxes) {
  const x = car.position.x;
  const z = car.position.z;
  for (let box of roadBoundingBoxes) {
    if (x >= box.xMin && x <= box.xMax && z >= box.zMin && z <= box.zMax) {
      return true;
    }
  }
  return false;
}

function findClosestWaypointIndex(pos, path) {
  let closestIndex = 0;
  let closestDist = Infinity;
  path.forEach((wp, i) => {
    const dx = wp.x - pos.x;
    const dz = wp.z - pos.z;
    const dist = dx * dx + dz * dz;
    if (dist < closestDist) {
      closestDist = dist;
      closestIndex = i;
    }
  });
  return closestIndex;
}

function moveCarAlongPath(car, path) {
  const currentPos = { x: car.position.x, z: car.position.z };

  if (car.currentWaypointIndex >= path.length) {
    const lastWp = path[path.length - 1];
    const prevWp = path[path.length - 2];
    const dirX = lastWp.x - prevWp.x;
    const dirZ = lastWp.z - prevWp.z;
    const length = Math.sqrt(dirX * dirX + dirZ * dirZ);
    const nx = dirX / length;
    const nz = dirZ / length;

    const proposedPosition = {
      x: car.position.x + nx * car.speed,
      z: car.position.z + nz * car.speed
    };

    if (!checkCarCollisionAlongPath(car, currentPos, proposedPosition)) {
      car.position.x = proposedPosition.x;
      car.position.z = proposedPosition.z;
      car.hasCollided = false;
    } else {
      car.speed = 0;
      car.velocity = 0;
      car.hasCollided = true;
      return;
    }
    return;
  }

  const wp = path[car.currentWaypointIndex];
  const dx = wp.x - car.position.x;
  const dz = wp.z - car.position.z;
  const distSq = dx * dx + dz * dz;

  if (distSq < 0.01) {
    car.currentWaypointIndex++;
    return;
  }

  const dist = Math.sqrt(distSq);
  const nx = dx / dist;
  const nz = dz / dist;

  const angleDeg = (Math.atan2(nx, nz) * 180) / Math.PI;
  car.rotationQuaternion.setEulerAngles(0, angleDeg + 180, 0);

  const proposedPosition = {
    x: car.position.x + nx * car.speed,
    z: car.position.z + nz * car.speed
  };

  if (!checkCarCollisionAlongPath(car, currentPos, proposedPosition)) {
    car.position.x = proposedPosition.x;
    car.position.z = proposedPosition.z;
    car.hasCollided = false;
  } else {
    car.speed = 0;
    car.velocity = 0;
    car.hasCollided = true;
  }
}

// place Obstacles
function placeObstacles(container, resources) {
  const obstaclePositions = [
    { x: -0.25, z: -1.25, rot: 0 },
    { x: 1, z: 3, rot: 0 },
    { x: -1.5, z: 0, rot: 0 },
    { x: 2.25, z: -2, rot: 0 },
    { x: 3.5, z: 3, rot: 5 }
  ];

  obstaclePositions.forEach(pos => {
    const obstacle = Model.from(resources["tree.gltf"].gltf);
    obstacle.scale.set(1);
    obstacle.position.set(pos.x, 0.1, pos.z);
    obstacle.rotationQuaternion.setEulerAngles(0, pos.rot, 0);
    obstacle.boundingBox = {
      xMin: pos.x - 0.5,
      xMax: pos.x + 0.5,
      zMin: pos.z - 0.5,
      zMax: pos.z + 0.5
    };
    console.log(obstacle.position.x, obstacle.position.y, obstacle.position.z);
    container.addChild(obstacle);
    window.obstacles = window.obstacles || [];
    window.obstacles.push(obstacle);
  });
}

// Collision controller
function checkCarCollisionAlongPath(car, startPos, proposedPos) {
  const dx = proposedPos.x - startPos.x;
  const dz = proposedPos.z - startPos.z;
  const distance = Math.sqrt(dx * dx + dz * dz);
  const stepSize = 0.01;
  const steps = Math.ceil(distance / stepSize);

  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const intermediatePos = {
      x: startPos.x + dx * t,
      z: startPos.z + dz * t
    };
    const carBB = {
      xMin: intermediatePos.x - 0.5,
      xMax: intermediatePos.x + 0.5,
      zMin: intermediatePos.z - 0.5,
      zMax: intermediatePos.z + 0.5
    };

    // Engel (obstacle) kontrolü
    if (window.obstacles) {
      for (const obstacle of window.obstacles) {
        if (
          carBB.xMin < obstacle.boundingBox.xMax &&
          carBB.xMax > obstacle.boundingBox.xMin &&
          carBB.zMin < obstacle.boundingBox.zMax &&
          carBB.zMax > obstacle.boundingBox.zMin
        ) {
          console.log("Obstacle collision detected");
          return true;
        }
      }
    }

    // Diğer arabalarla çarpışma kontrolü
    if (window.cars) {
      for (const otherCar of window.cars) {
        if (otherCar === car) continue;
        const otherCarBB = {
          xMin: otherCar.position.x - 0.5,
          xMax: otherCar.position.x + 0.5,
          zMin: otherCar.position.z - 0.5,
          zMax: otherCar.position.z + 0.5
        };

        if (
          carBB.xMin < otherCarBB.xMax &&
          carBB.xMax > otherCarBB.xMin &&
          carBB.zMin < otherCarBB.zMax &&
          carBB.zMax > otherCarBB.zMin
        ) {
          if (!car.isFollowingRoad && otherCar.isFollowingRoad) {
            console.log("waiting");
            return true;
          } else if (car.isFollowingRoad && !otherCar.isFollowingRoad) {
            continue;
          } else {
            console.log("Car collision detected");
            return true;
          }
        }
      }
    }
  }
  return false;
}
