import * as BABYLON from '@babylonjs/core';

class Playground {
  public static CreateScene(
    engine: BABYLON.Engine,
    canvas: HTMLCanvasElement
  ): BABYLON.Scene {
    // Scene, Camera and Light setup
    const scene = new BABYLON.Scene(engine);
    // Arc rotation camera allows an orbiting camera controller
    const camera = new BABYLON.ArcRotateCamera("Camera", -Math.PI / 2, 1, 10, new BABYLON.Vector3(0, 0, 0), scene);
    camera.attachControl(canvas, true);
    const light = new BABYLON.DirectionalLight("DirectionalLight", new BABYLON.Vector3(-1, -1, -1), scene);

    // // 'ground' mesh for reference.
    // const ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 6, height: 6}, scene);

    // box mesh for use with our shader
    const box = BABYLON.MeshBuilder.CreateBox("box", { size: 2 });

    // ` ` these quatioan marks allow a multi-line string in Javascript (" " or ' ' is single line)
    const vertex_shader = `
        attribute vec3 position;
        uniform mat4 myWorld;
        uniform mat4 myView;
        uniform mat4 myProjection;
                
        void main() {
            vec4 localPosition = vec4(position, 1.);
            vec4 worldPosition = myWorld * localPosition;     
            vec4 viewPosition  = myView * worldPosition;
            vec4 clipPosition  = myProjection * viewPosition;
            gl_Position = clipPosition;
        }
    `;

    const fragment_shader = `
        uniform vec3 color;

        void main() {
            gl_FragColor = vec4(color,1);
        }
    `;

    const shaderMaterial = new BABYLON.ShaderMaterial('myMaterial', scene, {
      // assign source code for vertex and fragment shader (string)
      vertexSource: vertex_shader,
      fragmentSource: fragment_shader
    },
      {
        // assign shader inputs
        attributes: ["position"], // position is BabylonJS build-in
        // define custom world matrix myWorld
        uniforms: ["myWorld", "myView", "myProjection", "color"], // view, projection are BabylonJS build-in
      });
    const boxColor = BABYLON.Vector3.FromArray([1, 0, 0]) // red
    shaderMaterial.setVector3("color", boxColor); // assign color uniform value

    const fov = Math.PI / 6;
    const aspect = 2;
    const znear = 1;
    const zfar = 1000;
    const myProjection = BABYLON.Matrix.PerspectiveFovLH(fov, aspect, znear, zfar);
    shaderMaterial.setMatrix("myProjection", myProjection);

    let cameraX = 0;
    let cameraY = 0;
    let cameraZ = -20;
    let cameraMatrix = BABYLON.Matrix.FromArray(makeTranslationMatrix(cameraX, cameraY, cameraZ));
    let view = cameraMatrix.invert();
    shaderMaterial.setMatrix("myView", view);

    scene.onKeyboardObservable.add((kbInfo) => {
      switch (kbInfo.type) {
        case BABYLON.KeyboardEventTypes.KEYDOWN:
          switch (kbInfo.event.key) {
            case "ArrowUp":
              cameraZ += 1;
              break;
            case "ArrowDown":
              cameraZ -= 1;
              break;
            case "ArrowLeft":
              cameraX -= 1;
              break;
            case "ArrowRight":
              cameraX += 1;
              break;
          }
          cameraMatrix = BABYLON.Matrix.FromArray(makeTranslationMatrix(cameraX, cameraY, cameraZ));
          view = cameraMatrix.invert();
          shaderMaterial.setMatrix("myView", view);
          break;
      }
    });

    box.material = shaderMaterial;

    // Remember BabylonJS uses Column Major matrices
    function makeTranslationMatrix(x: number, y: number, z: number) {
      const translationMatrix = [
        1, 0, 0, 0,  // <- i
        0, 1, 0, 0,  // <- j
        0, 0, 1, 0,  // <- k
        x, y, z, 1,  // <- t
      ];
      return translationMatrix;
    }

    function makeRotationMatrixX(angle: number) {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const rotationMatrixX = [
        1, 0,   0,   0,  // <- i
        0, cos, sin, 0,  // <- j
        0,-sin, cos, 0,  // <- k
        0, 0,   0,   1,  // <- t
      ];
      return rotationMatrixX;
    }

    function makeRotationMatrixY(angle: number) {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const rotationMatrixY = [
        cos, 0, -sin, 0,  // <- i
        0,   1, 0,    0,  // <- j
        sin, 0, cos,  0,  // <- k
        0,   0, 0,    1,  // <- t
      ];
      return rotationMatrixY;
    }

    function makeRotationMatrixZ(angle: number) {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const rotationMatrixZ = [
        cos,  sin, 0, 0,  // <- i
        -sin, cos, 0, 0,  // <- j
        0,    0,   1, 0,  // <- k
        0,    0,   0, 1,  // <- t
      ];
      return rotationMatrixZ;
    }

    function makeScaleMatrix(x: number, y: number, z: number) {
      const scaleMatrix = [
        x, 0, 0, 0,  // <- i
        0, y, 0, 0,  // <- j
        0, 0, z, 0,  // <- k
        0, 0, 0, 1,  // <- t
      ];
      return scaleMatrix;
    }

    function makeWorldMatrix(scaling: BABYLON.Vector3, rotation: BABYLON.Vector3, translation: BABYLON.Vector3) {
      const translationMatrix = BABYLON.Matrix.FromArray(makeTranslationMatrix(translation.x, translation.y, translation.z));
      const rotationMatrixX = BABYLON.Matrix.FromArray(makeRotationMatrixX(rotation.x));
      const rotationMatrixY = BABYLON.Matrix.FromArray(makeRotationMatrixY(rotation.y));
      const rotationMatrixZ = BABYLON.Matrix.FromArray(makeRotationMatrixZ(rotation.z));
      const scaleMatrix = BABYLON.Matrix.FromArray(makeScaleMatrix(scaling.x, scaling.y, scaling.z));

      let world = scaleMatrix.multiply(rotationMatrixZ);
      world = world.multiply(rotationMatrixX);
      world = world.multiply(rotationMatrixY);
      world = world.multiply(translationMatrix);
      return world;
    }


    const scaling = new BABYLON.Vector3(1, 1, 1);
    const rotation = new BABYLON.Vector3(0, 0, 0);
    const translation = new BABYLON.Vector3(0, 1, 0);

    const world = makeWorldMatrix(scaling, rotation, translation);
    shaderMaterial.setMatrix("myWorld", world);
    return scene;
  }
};

export { Playground }
