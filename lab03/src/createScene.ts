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
		// NOTE: seems like this is pointing up?
		var light = new BABYLON.HemisphericLight(
			"light1",
			new BABYLON.Vector3(0, 1, 0),
			scene
		);

		// Default intensity is 1. Let's dim the light a small amount
		light.intensity = 0.8;

		// Our built-in 'sphere' shape. Params: name, options, scene
		var sphere = BABYLON.MeshBuilder.CreateSphere(
			"sphere",
			{ diameter: 2, segments: 32 },
			scene
		);
		sphere.position.x = -2;
		sphere.position.y = 5;
		const roofMat = new BABYLON.StandardMaterial("roofMat");
		roofMat.diffuseTexture = new BABYLON.Texture(
			"https://assets.babylonjs.com/environments/roof.jpg",
			scene
		);
		sphere.material = roofMat;

		// // Our built-in 'ground' shape. Params: name, options, scene
		var ground = BABYLON.MeshBuilder.CreateGround(
			"ground",
			{ width: 12, height: 12 },
			scene
		);
		const groundMat = new BABYLON.StandardMaterial("groundMat");
		groundMat.diffuseColor = new BABYLON.Color3(0, 1, 0);
		ground.material = groundMat;

		var box1 = BABYLON.MeshBuilder.CreateBox(
			"box1",
			{ width: 2, height: 8 },
			scene
		);
		box1.position.x = 2;
		box1.position.y = 4;
		const box1Mat = new BABYLON.StandardMaterial("box1Mat");
		box1Mat.diffuseColor = new BABYLON.Color3(0, 1, 1);
		box1.material = box1Mat;

		let cyl1 = BABYLON.MeshBuilder.CreateCylinder(
			"cyl1",
			{ height: 4, diameter: 2 },
			scene
		);
		cyl1.position.x = -5;
		cyl1.position.z = -3;
		cyl1.position.y += 2;
		const fireMat = new BABYLON.StandardMaterial("fireMat");
		fireMat.diffuseTexture = new BABYLON.Texture(
			"https://www.babylonjs-playground.com/textures/fire.png"
		);
		cyl1.material = fireMat;

		let cone1 = BABYLON.MeshBuilder.CreateCylinder(
			"cone1",
			{ height: 4, diameterTop: 0, diameterBottom: 3 },
			scene
		);
		cone1.position.x -= 2;
		cone1.position.y += 2;
		const floorMat = new BABYLON.StandardMaterial("floorMat");
		floorMat.diffuseTexture = new BABYLON.Texture(
			"https://www.babylonjs-playground.com/textures/floor.png"
		);
		cone1.material = floorMat;

		let cap1 = BABYLON.MeshBuilder.CreateCapsule(
			"cap1",
			{ height: 2, radius: 0.5 },
			scene
		);
		cap1.position.z = -2;
		cap1.position.y = 3;
		const blocMat = new BABYLON.StandardMaterial("blocMat");
		blocMat.diffuseTexture = new BABYLON.Texture(
			"https://www.babylonjs-playground.com/textures/bloc.jpg",
			scene
		);
		cap1.material = blocMat;

		function createCircle(
			n: BABYLON.int,
			radius: BABYLON.int = 3,
			xOffset: BABYLON.int = 0,
			yOffset: BABYLON.int = 0,
			zOffset: BABYLON.int = 0
		) {
			let angle_incr = (2 * Math.PI) / n;
			let positions = [xOffset, yOffset, zOffset];
			// generate n points
			for (let i = 1; i <= n; i++) {
				let x = Math.cos(angle_incr * i) * radius;
				let y = Math.sin(angle_incr * i) * radius;
				positions = positions.concat([x + xOffset, y + yOffset, zOffset]);
			}
			let indices: Array<BABYLON.int> = [];
			for (let i = 1; i < n; i++) {
				// for every triangle we want
				// point 0, points[i], points[i+1]
				indices = indices.concat([0, i, i + 1]);
			}
			// last slice will use origin, point[n], and point[1]
			indices = indices.concat([0, n, 1]);
			console.log(positions);
			let newCircle = new BABYLON.Mesh(`circleWith${n}Points`, scene);
			let vertexData = new BABYLON.VertexData();
			vertexData.positions = positions;
			vertexData.indices = indices;
			vertexData.applyToMesh(newCircle);
			return newCircle;
		}

		let c1 = createCircle(20, 3, -5, 10, 0);
		const c1Mat = new BABYLON.StandardMaterial("c1Mat");
		c1Mat.diffuseColor = new BABYLON.Color3(1, 0, 0);
		c1.material = c1Mat;

		let c2 = createCircle(10, 1, 3, 10, 0);
		const c2Mat = new BABYLON.StandardMaterial("c2Mat");
		c2Mat.diffuseColor = new BABYLON.Color3(1, 1, 0);
		c2.material = c2Mat;

		return scene;
	}
}

export { Playground };
