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
			attribute vec3 normal;

			uniform mat4 world;
			uniform mat4 view;
			uniform mat4 projection;

			varying vec3 worldNormal;
			varying vec3 vWorldPos;

			void main() {
				vec4 localPosition = vec4(position, 1.);
				vec4 worldPosition = world * localPosition;
				vec4 viewPosition	= view * worldPosition;
				vec4 clipPosition	= projection * viewPosition;

				worldNormal = mat3(world) * normal;
				vWorldPos = worldPosition.xyz;

				gl_Position = clipPosition;
			}
		`;

		var fragment_shader = `
			uniform samplerCube reflectionTexture;
			uniform vec3 viewPos;

			varying vec3 worldNormal;
			varying vec3 vWorldPos;

			void main() {
				vec3 viewDirection = normalize(vWorldPos - viewPos);
				vec3 reflectionDir = reflect(viewDirection, worldNormal);
				vec3 reflectionColor = textureCube(reflectionTexture, reflectionDir).rgb;
				gl_FragColor = vec4(reflectionColor,1);
			}
		`;

		var shaderMaterial = new BABYLON.ShaderMaterial('myMaterial', scene, {
			vertexSource: vertex_shader,
			fragmentSource: fragment_shader
		},
			{
				attributes: ["position", "normal"],
				uniforms: ["world", "view", "projection", "viewPos"],
				samplers: ["reflectionTexture"]
			});

		sphere.material = shaderMaterial;
		shaderMaterial.setVector3("viewPos", camera.position);
		shaderMaterial.setTexture("reflectionTexture", reflectionTexture)

		return scene;
	}
}

export { Playground };
