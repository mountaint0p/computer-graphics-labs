import * as BABYLON from '@babylonjs/core';

class Playground {
	public static CreateScene(
		engine: BABYLON.Engine,
		canvas: HTMLCanvasElement
	): BABYLON.Scene {
		// This creates a basic Babylon Scene object (non-mesh)
		var scene = new BABYLON.Scene(engine);

		// This creates and positions a free camera (non-mesh)
		var camera = new BABYLON.FreeCamera(
			'camera1',
			new BABYLON.Vector3(0, 5, -10),
			scene
		);

		// This targets the camera to scene origin
		camera.setTarget(BABYLON.Vector3.Zero());

		// This attaches the camera to the canvas
		camera.attachControl(canvas, true);

		// This creates a light, aiming 0,1,0 - to the sky (non-mesh)
		// NOTE: seems like this is pointing up?
		var light = new BABYLON.HemisphericLight(
			'light1',
			new BABYLON.Vector3(0, 1, 0),
			scene
		);

		// Default intensity is 1. Let's dim the light a small amount
		light.intensity = 0.8;

		// Our built-in 'sphere' shape. Params: name, options, scene
		// var sphere = BABYLON.MeshBuilder.CreateSphere(
		// 	'sphere',
		// 	{ diameter: 2, segments: 32 },
		// 	scene
		// );
		// sphere.position.x = -2;
		// sphere.position.y = 5;

		// // Our built-in 'ground' shape. Params: name, options, scene
		// var ground = BABYLON.MeshBuilder.CreateGround(
		// 	'ground',
		// 	{ width: 12, height: 12 },
		// 	scene
		// );

		// var box1 = BABYLON.MeshBuilder.CreateBox(
		// 	'box1',
		// 	{ width: 2, height: 8 },
		// 	scene
		// );
		// box1.position.x = 2;
		// box1.position.y = 4;

		// let cyl1 = BABYLON.MeshBuilder.CreateCylinder(
		// 	"cyl1",
		// 	{ height: 4, diameter: 2 },
		// 	scene
		// );
		// cyl1.position.x = -5;
		// cyl1.position.z = -3;
		// cyl1.position.y += 2;

		// let cone1 = BABYLON.MeshBuilder.CreateCylinder(
		// 	"cone1",
		// 	{ height: 4, diameterTop: 0, diameterBottom: 3 },
		// 	scene
		// );
		// cone1.position.x -= 2;
		// cone1.position.y += 2;

		// let cap1 = BABYLON.MeshBuilder.CreateCapsule(
		// 	"cap1",
		// 	{ height: 2, radius: 0.5 },
		// 	scene
		// );
		// cap1.position.z = -2;
		// cap1.position.y = 3;

		//
		// var customMesh = new BABYLON.Mesh("custom", scene);

		// var positions = [-5, 2, -3, -7, -2, -3, -3, -2, -3, 5, 2, 3, 7, -2, 3, 3, -2, 3];
		// var indices = [0, 1, 2, 3, 4, 5];

		// var vertexData = new BABYLON.VertexData();

		// vertexData.positions = positions;
		// vertexData.indices = indices;

		// vertexData.applyToMesh(customMesh);
		// customMesh.position.y += 1;
		//

		function createCircle(n: BABYLON.int) {
			let radius = 3;
			let angle_incr = 2 * Math.PI / n;
			let points = [[0,0,0]];
			// generate n points
			for (let i = 1; i <= n; i++) {
				let x = Math.cos(angle_incr * i) * radius;
				let y = Math.sin(angle_incr * i) * radius;
				points.push([x, y, 0]);
			}
			console.log(points);
			// using n points, create triangles
			let positions: Array<BABYLON.int> = []
			let indices = []
			for (let i = 1; i <= n; i++) {
				// for every triangle we want
				// the origin (0, 0, 0)
				// points[i]
				// points[i+1]
				let currPosition = [0,0,0]
				currPosition = currPosition.concat(points[i])
				currPosition = currPosition.concat(points[(i+1) % n])
				positions = positions.concat(currPosition)
				indices.push(i)
			}
			console.log(positions);
			let newCircle = new BABYLON.Mesh(`circleWith${n}Points`, scene);
			let vertexData = new BABYLON.VertexData();
			vertexData.positions = positions;
			vertexData.indices = indices;
			vertexData.applyToMesh(newCircle);
			return newCircle;
		}

		let c10 = createCircle(100);

		return scene;
	}
}

export { Playground };
