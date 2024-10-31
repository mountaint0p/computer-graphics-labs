import * as BABYLON from '@babylonjs/core';

class Playground {
	public static CreateScene(
		engine: BABYLON.Engine,
		canvas: HTMLCanvasElement
	): BABYLON.Scene {
		// Scene, Camera and Light setup
		const scene = new BABYLON.Scene(engine);
		const camera = new BABYLON.ArcRotateCamera("Camera", -Math.PI / 2, 1, 10, new BABYLON.Vector3(0, 0, 0), scene);
		camera.attachControl(canvas, true);

		var reflectionTexture = new BABYLON.CubeTexture("../textures/skybox2", scene);

		// sphere mesh for use with our shader
		var sphere = BABYLON.MeshBuilder.CreateSphere("sphere", { diameter: 1 }, scene);
		sphere.position.y = 1;

		var vertex_shader = `
				attribute vec3 position;

				uniform mat4 world;
				uniform mat4 view;
				uniform mat4 projection;

				void main() {
						vec4 localPosition = vec4(position, 1.);
						vec4 worldPosition = world * localPosition;
						vec4 viewPosition	= view * worldPosition;
						vec4 clipPosition	= projection * viewPosition;

						gl_Position = clipPosition;
				}
		`;

		var fragment_shader = `

				void main() {
						vec3 color = vec3(1,1,1);
						gl_FragColor = vec4(color,1);
				}
		`;

		var shaderMaterial = new BABYLON.ShaderMaterial('myMaterial', scene, {
			vertexSource: vertex_shader,
			fragmentSource: fragment_shader
		},
			{
				attributes: ["position"],
				uniforms: ["world", "view", "projection"]
			});

		sphere.material = shaderMaterial;

		return scene;
	}
}

export { Playground };
