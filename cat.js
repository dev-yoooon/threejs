import * as three from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as lil from 'lil-gui';
// import './style.scss';

let clock, mixer, controls;

// debug
const gui = new lil.GUI;
gui.hide();
gui.close();

//  canvas
const canvas = document.querySelector('#canvas');
canvas.width = window.screen.width;
canvas.height = window.screen.height;

// camera
const camera = new three.PerspectiveCamera( 45, window.screen.width / window.screen.height, 1, 1000);
camera.position.y = 1.8;
camera.position.z = 2;

    //gui 
const cameraFolder = gui.addFolder('camera')
cameraFolder.add(camera.position, 'x', -5, 5, 0.1).name('X');
cameraFolder.add(camera.position, 'y', -5, 5, 0.1).name('y');
cameraFolder.add(camera.position, 'z', -5, 20, 0.1).name('z');
cameraFolder.close();

// scene
const scene = new three.Scene();
const renderer = new three.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true,
});

// shadow
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = three.PCFSoftShadowMap;

// background color
scene.background = new three.Color('#618d1e');

// light
// const light = new DirectionalLight(0xffff00, 1);
const light = new three.AmbientLight( 0xffffff, 1 );
const directionalLight = new three.DirectionalLight(0xffffff, 0.7)
directionalLight.position.set(-5, 1.5, 3)
scene.add(directionalLight)
scene.add(light);
directionalLight.castShadow = true //⭐빛에 castshadow 설정
// 

// 바닥
const planeGeometry = new three.PlaneGeometry(200, 100);
const planeMeterial = new three.MeshLambertMaterial({ color: '#618d1e' });
const plane = new three.Mesh(planeGeometry, planeMeterial);
plane.rotation.x = -0.5 * Math.PI;
plane.position.y = -0.5;
plane.position.z = 2;
scene.add(plane);
plane.receiveShadow = true;

    // gui
const planFolder = gui.addFolder('plane');
planFolder.add(plane.position, 'x', -5, 5, 0.1).name('position X');
planFolder.add(plane.position, 'y', -5, 5, 0.1).name('position Y');
planFolder.add(plane.position, 'z', -5, 5, 0.1).name('position Z');
planFolder.add(plane.rotation, 'x', -50, 50, 0.1).name('rotation X');
planFolder.add(plane.rotation, 'y', -50, 50, 0.1).name('rotation Y');
planFolder.add(plane.rotation, 'z', -50, 50, 0.1).name('rotation Z');
planFolder.close();




// texture
const textureLoader = new three.TextureLoader();
const textureMew = textureLoader.load('./model/mew/textures/material_0_baseColor.png');

// controls
renderer.outputEncoding = three.sRGBEncoding;
controls = new OrbitControls(camera, renderer.domElement);
controls.autoRotate = true;
// controls.autoRotateSpeed = 200;
// controls.enableDamping = true;
// controls.dampingFactor = 0.01
controls.maxDistance = 50;
controls.minDistance = 10;
controls.maxPolarAngle = Math.PI / 2;
controls.minPolarAngle = Math.PI / 3;
// controls.maxAzimuthAngle = Math.PI / 2;
// controls.minAzimuthAngle = Math.PI / 3;
   
    // constrols event
// controls.addEventListener( "change", event => {  
//     console.log( controls.object.position ); 
// });

clock = new three.Clock();

// background();
const snoopy = model('./model/ugly_cat/scene.gltf', function(model){
    model.rotation.y = -1;
    model.scale.set(1.1, 1.1, 1.1);
    model.position.set(0,-0.5,0);
});


// gltf
function model(url){
    const loader = new GLTFLoader();
    const gltfUrl = url;


    loader.load( gltfUrl , ( gltf ) => {
        const model = gltf.scene;
        mixer = new three.AnimationMixer(model);
        mixer.clipAction(gltf.animations[0]).play(); 
        
        window.self = gltf;
        window.mixer = mixer;

        model.rotation.y = -0.7;
        model.scale.set(0.5, 0.5, 0.5);
        model.position.set(0,-0.5,-0);
        camera.position.z = 12;


        const obj = new three.Box3().setFromObject(model);

        // textureMew
        //텍스쳐 적용
        model.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
            }
        });

        // debug
        const modelFolder = gui.addFolder('model');
        modelFolder.add(model.position, 'x', -5, 5, 0.1).name('position X');
        modelFolder.add(model.position, 'y', -5, 5, 0.1).name('position y');
        modelFolder.add(model.position, 'z', -5, 5, 0.1).name('position z');
        modelFolder.add(model.rotation, 'x', -5, 5, 0.1).name('rotation X');
        modelFolder.add(model.rotation, 'y', -5, 5, 0.1).name('rotation y');
        modelFolder.close();

        scene.add( model );
        camera.lookAt(camera.position);

        animate();
        model.castShadow = true;
        
        function animate(){
            requestAnimationFrame(animate);

            if( mixer ) {
                mixer.update(clock.getDelta());
            }
            renderer.render( scene, camera );
        }

        function motionStop(){
            gltf.animations.map((clip) => {
                mixer.clipAction(clip).stop(); 
            })
        }
        $('#act1').on('click', function(e){
            e.preventDefault();
            motionStop()
            mixer.clipAction(gltf.animations[0]).play();
        });
        $('#act2').on('click', function(e){
            e.preventDefault();
            motionStop();
            mixer.clipAction(gltf.animations[1]).play();
        });
        $('#act3').on('click', function(e){
            e.preventDefault();
            motionStop();
            mixer.clipAction(gltf.animations[2]).play();
        });
        
    });
}




