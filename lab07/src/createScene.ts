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

		// we will use a directional light
		const lightDirection = new BABYLON.Vector3(-0.5, -1, 0.7);
		const light = new BABYLON.DirectionalLight("DirectionalLight", lightDirection, scene);
		light.diffuse = new BABYLON.Color3(1, 1, 1);
		light.specular = new BABYLON.Color3(1, 1, 1);

		// 'ground' mesh for reference.
		var ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 6, height: 6 }, scene);

		// sphere mesh for use with our shader
		var sphere = BABYLON.MeshBuilder.CreateSphere("sphere", { diameter: 2 });
		sphere.position.y = 1;
		sphere.position.x = 1.5;

		// sphere mesh to see how BabylonJS renders ligh
		var controlSphere = BABYLON.MeshBuilder.CreateSphere("sphere", { diameter: 2 });
		controlSphere.position.y = 1;
		controlSphere.position.x = -1.5;
		controlSphere.material = new BABYLON.StandardMaterial("control material", scene);
		// @ts-ignore (doesn't understand type change)
		controlSphere.material.diffuseColor = BABYLON.Color3.Red();

		// ` ` these quatioan marks allow a multi-line string in Javascript (" " or ' ' is single line)
		var vertex_shader = `
				attribute vec3 position;
				attribute vec3 normal;
				uniform mat4 world;
				uniform mat4 view;
				uniform mat4 projection;
				uniform mat3 inverseTranspose;

				varying vec3 worldPos;
				varying vec3 worldNormal;
								
				void main() {
						vec4 localPosition = vec4(position, 1.);
						vec4 worldPosition = world * localPosition;		 
						vec4 viewPosition	= view * worldPosition;
						vec4 clipPosition	= projection * viewPosition;

						// transform normal to world space, so light direction 
						// and normal are in the same space.
						worldNormal = inverseTranspose * normal;
						worldPos = worldPosition.xyz;
						gl_Position = clipPosition;
				}
		`;

		var fragment_shader = `
				uniform vec3 surfaceColor;
				uniform vec3 lightDirection;
				uniform float lightIntensity;
				uniform vec3 lightColor;
				uniform vec3 viewPosition;
				uniform float shininess;
				uniform float ambientTerm;
				uniform vec3 specularColor;

				varying vec3 worldNormal;
				varying vec3 worldPos;

				void main() {
						vec3 normalizedLightDirection = normalize(lightDirection);
						vec3 normalizedNormal = normalize(worldNormal);
						vec3 normalizedViewDirection = normalize(viewPosition-worldPos);

						// ambient color
						vec3 ambientColor = ambientTerm * lightColor;

						vec3 totalColor = ambientColor;
						float cosineTheta = dot(normalizedNormal, -1.0 * normalizedLightDirection);
						// only consider diffuse and specular when cos(theta) > 0.0
						if (cosineTheta > 0.0) {
							// diffuse
							float intensity = cosineTheta * lightIntensity;
							vec3 diffuseColor = intensity * (surfaceColor * lightColor);
							// specular
							vec3 halfVector = normalize(-1.0 * normalizedLightDirection + normalizedViewDirection);
							float cosinePhi = dot(halfVector, normalizedNormal);
							float shinyPower = pow(cosinePhi, shininess);
							vec3 specularColorShown = shinyPower * specularColor;

							totalColor = totalColor + diffuseColor + specularColorShown;
						}
						gl_FragColor = vec4(totalColor,1);
				}
		`;

		var shaderMaterial = new BABYLON.ShaderMaterial('myMaterial', scene, {
			// assign source code for vertex and fragment shader (string)
			vertexSource: vertex_shader,
			fragmentSource: fragment_shader
		},
			{
				// assign shader inputs
				attributes: ["position", "normal"], // position and normal are BabylonJS build-in
				uniforms: ["world", "view", "projection", // world, view, projection are BabylonJS build-in
					"inverseTranspose", "surfaceColor",
					"lightDirection", "lightIntensity", 
					"viewPosition", "shininess", "ambientTerm",
					"specularColor"]
			});
		var surfaceColor = BABYLON.Vector3.FromArray([1, 0, 0]) // red

		sphere.material = shaderMaterial;

		function update() {
			let world4x4 = sphere.getWorldMatrix();
			let normalMatrix4x4 = new BABYLON.Matrix();
			world4x4.toNormalMatrix(normalMatrix4x4);
			let inverseTranspose3x3 = BABYLON.Matrix.GetAsMatrix3x3(normalMatrix4x4);

			shaderMaterial.setMatrix3x3("inverseTranspose", inverseTranspose3x3);
			shaderMaterial.setVector3("surfaceColor", surfaceColor);
			shaderMaterial.setVector3("lightDirection", light.direction);
			shaderMaterial.setFloat("lightIntensity", light.intensity);
			shaderMaterial.setColor3("lightColor", light.diffuse);
			shaderMaterial.setColor3("specularColor", light.specular)
			shaderMaterial.setVector3("viewPosition", camera.position);
			shaderMaterial.setFloat("shininess", 50.0)
			shaderMaterial.setFloat("ambientTerm", 0.1)

		}
		scene.registerBeforeRender(update);

		return scene;
	}
}

export { Playground };
