import * as BABYLON from '@babylonjs/core';

class Playground {
  public static CreateScene(
    engine: BABYLON.Engine,
    canvas: HTMLCanvasElement
  ): BABYLON.Scene {
    function makeTranslationMatrix(x, y, z){
      var translationMatrix = [
        1, 0, 0, 0 ,   // <- i
        0, 1, 0, 0 ,   // <- j
        0, 0, 1, 0 ,   // <- k
        x, y, z, 1 ,   // <- t
      ];
      return translationMatrix;
    };

    var scene = new BABYLON.Scene(engine);

    // make a ArcRotateCamera, often a little easier to navigate the scene with this. It rotates around the cameraTarget.
    const horizontalAngle = -Math.PI/2;   // initial horizontal camera angle
    const verticalAngle = Math.PI/2;      // initial vertical camera angle
    const distance = 20;                  // initial camera distance
    const cameraTarget = new BABYLON.Vector3.Zero;
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
    const boxColor = BABYLON.Vector3.FromArray([0,1,0]) // green
    boxMaterial.setVector3("color", boxColor); 

    // assign custom myWorld uniform 
    const boxTranslationMatrixArray = (makeTranslationMatrix(0,3,0));
    const boxTranslationMatrix = BABYLON.Matrix.FromArray(boxTranslationMatrixArray);
    const boxWorldMatrix = boxTranslationMatrix;
    boxMaterial.setMatrix("myWorld", boxWorldMatrix);

    function update() {
        // get current time in seconds
        const time = performance.now()/1000;
    }
    scene.registerBeforeRender(update);

    return scene;
  }
}

export { Playground };
