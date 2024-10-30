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

		// --------------- LOADING OF TEXTURES -----------------------
		// From babylon Texture Library https://doc.babylonjs.com/toolsAndResources/assetLibraries/availableTextures
		const texture = new BABYLON.Texture(
			"https://www.babylonjs-playground.com/textures/Logo.png"
		);

		function createPyramid() {
			// NOTE: ...[thing1, thing2, etc] "unpacks" an array and places all elements
			// as individual arguments. I make extensive use of this for visual clarity
			const visual_vertices = [
				[0, 1.5, 0],	// top
				[1, 0, 1],	// back right
				[-1, 0, 1],	// back left
				[-1, 0, -1],	// front left
				[1, 0, -1],	// front right
			];
			const positions = [
				// top, which is always same uv info
				...visual_vertices[0],
				// base corners with (u,v) = (0, 0)
				...visual_vertices[1],
				...visual_vertices[2],
				...visual_vertices[3],
				...visual_vertices[4],
				// base corners with (u,v) = (1, 0)
				...visual_vertices[1],
				...visual_vertices[2],
				...visual_vertices[3],
				...visual_vertices[4],
				// bottom triangles, maybe repeat info but this is understandable
				...visual_vertices[2],
				...visual_vertices[1],
				...visual_vertices[4],
				...visual_vertices[3],
			];
			const uvs = [
				// top, which is always same
				...[0.5, 1],
				// base corners with (u,v) = (0, 0)
				...[0, 0],
				...[0, 0],
				...[0, 0],
				...[0, 0],
				// base corners with (u,v) = (1, 0)
				...[1, 0],
				...[1, 0],
				...[1, 0],
				...[1, 0],
				// bottom triangles, maybe repeat info but this is understandable
				...[0, 0],
				...[1, 0],
				...[1, 1],
				...[0, 1],
			];
			const indices = [
				// side triangles
				...[1, 6, 0],
				...[2, 7, 0],
				...[3, 8, 0],
				...[4, 5, 0],
				// base traingles (make a square)
				...[9, 10, 12],
				...[10, 11, 12],
			];
			const retMesh = new BABYLON.Mesh("pyramid", scene);
			const vertexData = new BABYLON.VertexData();
			vertexData.positions = positions;
			vertexData.indices = indices;
			vertexData.uvs = uvs;
			vertexData.applyToMesh(retMesh);
			return retMesh;
		}

		// 'ground' mesh for reference.
		const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 6, height: 6 }, scene);
		ground.material = new BABYLON.StandardMaterial("ground material", scene);
		// use emissive color property to exclude lighting (usually would be diffuseColor)
		// @ts-ignore
		ground.material.emissiveColor = BABYLON.Color3.Gray();

		const pyramid = createPyramid();
		pyramid.position.y = 1;
		pyramid.position.x = 1.5;

		// box mesh for use with our shader
		const box = BABYLON.MeshBuilder.CreateBox("box", { size: 2 });
		box.position.y = 1;
		box.position.x = -1.5;

		// ` ` these quatioan marks allow a multi-line string in Javascript (" " or ' ' is single line)
		var vertex_shader = `
				attribute vec3 position;
				attribute vec2 uv;
				varying vec2 vUV;

				uniform mat4 world;
				uniform mat4 view;
				uniform mat4 projection;
				uniform mat3 inverseTranspose;

				void main() {
						vec4 localPosition = vec4(position, 1.);
						vec4 worldPosition = world * localPosition;
						vec4 viewPosition = view * worldPosition;
						vec4 clipPosition = projection * viewPosition;

						vUV = uv;

						gl_Position = clipPosition;
				}
		`;

		var fragment_shader = `

				varying vec2 vUV;
				uniform sampler2D mainTexture;

				void main() {
						// implement basic texturing
						vec4 color = texture(mainTexture, vUV);
						gl_FragColor = color;
				}
		`;

		var shaderMaterial = new BABYLON.ShaderMaterial('myMaterial', scene, {
			// assign source code for vertex and fragment shader (string)
			vertexSource: vertex_shader,
			fragmentSource: fragment_shader
		},
			{
				// assign shader inputs
				attributes: ["position", "uv"],	// position and uv are BabylonJS build-in
				uniforms: ["world", "view", "projection"],	// world, view, projection are BabylonJS build-in
				samplers: ["mainTexture"]
			});

		shaderMaterial.setTexture("mainTexture", texture);
		box.material = shaderMaterial;
		pyramid.material = shaderMaterial;

		return scene;
	}
}

export { Playground };
