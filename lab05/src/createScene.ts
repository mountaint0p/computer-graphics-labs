import * as BABYLON from '@babylonjs/core';

class Playground {
  public static CreateScene(
    engine: BABYLON.Engine,
    canvas: HTMLCanvasElement
  ): BABYLON.Scene {
    const scene = new BABYLON.Scene(engine);

    // make a ArcRotateCamera, often a little easier to navigate the scene with this. It rotates around the cameraTarget.
    const horizontalAngle = -Math.PI/2;   // initial horizontal camera angle
    const verticalAngle = Math.PI/2;      // initial vertical camera angle
    const distance = 20;                  // initial camera distance
    const cameraTarget = BABYLON.Vector3.Zero();
    const camera = new BABYLON.ArcRotateCamera("camera", horizontalAngle, verticalAngle, distance, cameraTarget, scene);
    camera.attachControl(canvas, true);

    // light source only for ground (our shader does not process light)
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    const box = BABYLON.MeshBuilder.CreateBox("box", {size:5}, scene);
    // ground for spacial reference
    const ground = BABYLON.MeshBuilder.CreateGround("ground", {width:10, height:10}, scene);

    const vertex_shader = `
        attribute vec3 position;
        uniform mat4 myWorld;
        uniform mat4 world;
        uniform mat4 view;
        uniform mat4 projection;
                
        void main() {
            vec4 localPosition = vec4(position, 1.);
            vec4 worldPosition = myWorld * localPosition;     
            vec4 viewPosition  = view * worldPosition;
            vec4 clipPosition  = projection * viewPosition;
            gl_Position = clipPosition;
        }
    `;

    const fragment_shader = `
        uniform vec3 color;
        // simply assign solid color
        void main() {
            gl_FragColor = vec4(color,1);
        }
    `;

    // make custom ShaderMaterial for your shader code
    const boxMaterial = new BABYLON.ShaderMaterial('myMaterial', scene, { 
        vertexSource: vertex_shader, 
        fragmentSource: fragment_shader
    },{
        attributes: ["position"], // position is BabylonJS build-in
        uniforms: ["myWorld", "world", "view", "projection", "color"], // view, projection are BabylonJS build-in
    });

    box.material = boxMaterial;
  
    // assign color uniform
    const boxColor = BABYLON.Vector3.FromArray([0,1,0]) // green!
    boxMaterial.setVector3("color", boxColor); 

    // assign custom myWorld uniform 
    const boxScalingMatrix = makeScalingMatrix(1.5, 1, 1.25);
    const boxTranslationMatrix = makeTranslationMatrix(0, 4, 1);
    const boxXRotationMatrix = makeXRotationMatrix(Math.PI / 3);
    const boxYRotationMatrix = makeYRotationMatrix(Math.PI / 4);
    const boxZRotationMatrix = makeZRotationMatrix(Math.PI / 5);
    const boxWorldMatrix = boxScalingMatrix
                          .multiply(boxZRotationMatrix)
                          .multiply(boxXRotationMatrix)
                          .multiply(boxYRotationMatrix)
                          .multiply(boxTranslationMatrix);
    boxMaterial.setMatrix("myWorld", boxWorldMatrix);

    function update() {
        // get current time in seconds
        const time = performance.now()/1000;
    }
    scene.registerBeforeRender(update);

    return scene;
  }
}

function makeTranslationMatrix(x, y, z) {
  return BABYLON.Matrix.FromArray([
    1, 0, 0, 0 ,   // <- i
    0, 1, 0, 0 ,   // <- j
    0, 0, 1, 0 ,   // <- k
    x, y, z, 1 ,   // <- t
  ]);
};

function makeScalingMatrix(x, y, z) {
  return BABYLON.Matrix.FromArray([
    x, 0, 0, 0,
    0, y, 0, 0,
    0, 0, z, 0,
    0, 0, 0, 1
  ])
};

function makeXRotationMatrix(angle) {
  return BABYLON.Matrix.FromArray([
    1, 0, 0, 0,
    0, Math.cos(angle), -Math.sin(angle), 0,
    0, Math.sin(angle), Math.cos(angle), 0,
    0, 0, 0, 1
  ])
};

function makeYRotationMatrix(angle) {
  return BABYLON.Matrix.FromArray([
    Math.cos(angle), 0, Math.sin(angle), 0,
    0, 1, 0, 0,
    -Math.sin(angle), 0, Math.cos(angle), 0,
    0, 0, 0, 1
  ])
};

function makeZRotationMatrix(angle) {
  return BABYLON.Matrix.FromArray([
    Math.cos(angle), -Math.sin(angle), 0, 0,
    Math.sin(angle), Math.cos(angle), 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ])
};

export { Playground };
