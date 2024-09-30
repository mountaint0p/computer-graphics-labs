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
    // create ground
    BABYLON.MeshBuilder.CreateGround("ground", {width:10, height:10}, scene);

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
    // TODO: make cleaner multiply function,
    // modify other values with time
    boxMaterial.setMatrix("myWorld", matMult([
      boxScalingMatrix,
      boxZRotationMatrix,
      boxXRotationMatrix,
      boxYRotationMatrix,
      boxTranslationMatrix,
    ]));

    function update() {
        const time = performance.now() / 1000;
        const zAdded = BABYLON.Matrix.FromArray([
          // goofy fun stuff
          Math.tan(time / 5), Math.tan(time / 5), 0, 0,
          Math.tan(time / 5), Math.tan(time / 5), 0, 0,
          0, 0, 0, 0,
          0, 0, 0, 0
        ]);
        const trans = BABYLON.Matrix.FromArray([
          0, 0, 0, 0,
          0, 0, 0, 0,
          0, 0, 0, 0,
          Math.sin(time)*4, Math.cos(time)*5, Math.sin(time/2), 0,
        ]);
        boxMaterial.setMatrix("myWorld", matMult([
          boxScalingMatrix,
          boxZRotationMatrix.add(zAdded),
          boxXRotationMatrix,
          boxYRotationMatrix,
          boxTranslationMatrix.add(trans),
        ]));
    }
    scene.registerBeforeRender(update);

    return scene;
  }
}

// multiplies matrices in array from left to right
// IMPORTANT: order is reversed from normal math notation
function matMult(arrs: Array<BABYLON.Matrix>) {
  // .reduce multiplies the accumulated value (start w/ id matrix)
  // with the next thing in the array, over and over until the end
  return arrs.reduce((acc, curr) => acc.multiply(curr), BABYLON.Matrix.Identity());
}

function makeTranslationMatrix(x: number, y: number, z: number) {
  return BABYLON.Matrix.FromArray([
    1, 0, 0, 0 ,   // <- i
    0, 1, 0, 0 ,   // <- j
    0, 0, 1, 0 ,   // <- k
    x, y, z, 1 ,   // <- t
  ]);
};

function makeScalingMatrix(x: number, y: number, z: number) {
  return BABYLON.Matrix.FromArray([
    x, 0, 0, 0,
    0, y, 0, 0,
    0, 0, z, 0,
    0, 0, 0, 1
  ])
};

function makeXRotationMatrix(angle: number) {
  return BABYLON.Matrix.FromArray([
    1, 0, 0, 0,
    0, Math.cos(angle), -Math.sin(angle), 0,
    0, Math.sin(angle), Math.cos(angle), 0,
    0, 0, 0, 1
  ])
};

function makeYRotationMatrix(angle: number) {
  return BABYLON.Matrix.FromArray([
    Math.cos(angle), 0, Math.sin(angle), 0,
    0, 1, 0, 0,
    -Math.sin(angle), 0, Math.cos(angle), 0,
    0, 0, 0, 1
  ])
};

function makeZRotationMatrix(angle: number) {
  return BABYLON.Matrix.FromArray([
    Math.cos(angle), -Math.sin(angle), 0, 0,
    Math.sin(angle), Math.cos(angle), 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ])
};

export { Playground };
