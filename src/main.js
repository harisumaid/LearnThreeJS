// Import Three.js and GLTFLoader
import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  AmbientLight,
  DirectionalLight,
  Color,
  PMREMGenerator,
  Raycaster,
  Vector2,
} from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

let scene, camera, renderer, model, controls, raycaster, mouse;
let INTERSECTED = null;

function init() {
  // Create the scene
  scene = new Scene();

  // Set up a basic perspective camera
  camera = new PerspectiveCamera(
    40,
    window.innerWidth / window.innerHeight,
    1,
    100
  );
  camera.position.set(15, 5, 5); // Adjusted for better initial view of the model

  // Set up a WebGL renderer with antialiasing enabled
  renderer = new WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Add ambient light to the scene
  const ambientLight = new AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  // Add a directional light to simulate sunlight
  const directionalLight = new DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 10, 7.5);
  scene.add(directionalLight);

  raycaster = new Raycaster();
  mouse = new Vector2();


  controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0.5, 0);
  controls.update();
  controls.enablePan = false;
  controls.enableDamping = true;

  scene.background = new Color(0x25244b);
  scene.environment = new PMREMGenerator(renderer).fromScene(
    new RoomEnvironment(renderer),
    0.04
  ).texture;

  // Load the GLTF model from the public folder
  const loader = new GLTFLoader();
  loader.load(
    "/3d_model/scene.gltf", // Adjust this path if necessary
    function (gltf) {
      console.log(gltf);

      model = gltf.scene;

      model.position.set(1, 1, 1);
      model.scale.set(0.5,0.5,0.5)
      scene.add(model);

     
    },
    undefined,
    function (error) {
      console.error("An error occurred while loading the model:", error);
    }
  );

  // Handle window resize
  window.addEventListener("resize", onWindowResize, false);

  // Listen for mouse moves
  window.addEventListener('mousemove', onMouseMove, false);


  // Start the animation loop
  animate();
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseMove(event){
  // Calculate mouse position in normalized device coordinates
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

}

function animate() {
  requestAnimationFrame(animate);
  controls.update();

   // Update the raycaster to point from the camera through the mouse position
   raycaster.setFromCamera(mouse, camera);

   // Find intersections with the model's children
   const intersects = raycaster.intersectObjects(scene.children, true);

   if (intersects.length > 0) {
       // If the mouse is hovering over a mesh
       if (INTERSECTED != intersects[0].object) {
           // If a different object was previously intersected, reset its color
           if (INTERSECTED) INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);

           // Store the current color and set the new one
           INTERSECTED = intersects[0].object;
           INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
           INTERSECTED.material.emissive.setHex(0xff0000);  // Highlight color (red)
       }
   } else {
       // Reset the color if no mesh is intersected
       if (INTERSECTED) INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);
       INTERSECTED = null;
   }

  // Render the scene
  renderer.render(scene, camera);
}

// Initialize the scene
init();
