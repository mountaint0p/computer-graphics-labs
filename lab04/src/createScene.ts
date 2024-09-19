import * as BABYLON from "@babylonjs/core";

class Playground {
	public static CreateScene(
		engine: BABYLON.Engine,
		canvas: HTMLCanvasElement
	): BABYLON.Scene {
		// This creates a basic Babylon Scene object (non-mesh)
		var scene = new BABYLON.Scene(engine);

		// This creates and positions a free camera (non-mesh)
		var camera = new BABYLON.FreeCamera(
			"camera1",
			new BABYLON.Vector3(0, 5, -10),
			scene
		);

		// This targets the camera to scene origin
		camera.setTarget(BABYLON.Vector3.Zero());

		// This attaches the camera to the canvas
		camera.attachControl(canvas, true);

		// This creates a light, aiming 0,1,0 - to the sky (non-mesh)
		var light = new BABYLON.HemisphericLight(
			"light1",
			new BABYLON.Vector3(0, 1, 0),
			scene
		);

		// Default intensity is 1. Let's dim the light a small amount
		light.intensity = 0.7;

		// Our built-in 'ground' shape. Params: name, options, scene
		var ground1 = BABYLON.MeshBuilder.CreateGround(
			"ground",
			{ width: 3, height: 3 },
			scene
		);

		var ground2 = BABYLON.MeshBuilder.CreateGround(
			"ground",
			{ width: 3, height: 3 },
			scene
		);

		ground2.position.x += 4;

		var vertex_shader = `
        attribute vec3 position;
        uniform mat4 worldViewProjection;
        
        void main() {
            vec4 p = vec4(position, 1.);
            gl_Position = worldViewProjection * p;
        }
    `;

		var fragment_shader = `
        uniform vec3 color;

        void main() {
            gl_FragColor = vec4(color, 1);
        }
    `;

		var shaderMaterial1 = new BABYLON.ShaderMaterial(
			"shaderMaterial1",
			scene,
			{
				// assign source code for vertex and fragment shader (string)
				vertexSource: vertex_shader,
				fragmentSource: fragment_shader,
			},
			{
				// assign shader inputs
				attributes: ["position"], // position is BabylonJS build-in
				uniforms: ["worldViewProjection", "color"], // worldViewProjection is BabylonJS build-in
			}
		);

		var shaderMaterial2 = shaderMaterial1.clone("shaderMaterial1");
		var ground1Color = BABYLON.Vector3.FromArray([1, 0, 0]);
		var ground2Color = BABYLON.Vector3.FromArray([0, 0, 1]);
		shaderMaterial1.setVector3("color", ground1Color);
		shaderMaterial2.setVector3("color", ground2Color);

		ground1.material = shaderMaterial1;
		ground2.material = shaderMaterial2;

		return scene;
	}
}

export { Playground };
