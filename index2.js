// import { Scene, WebGLRenderer, PerspectiveCamera, Color, DirectionalLight, sRGBEncoding, Clock, AnimationMixer, AmbientLight } from 'three';
import * as three from '../node_modules/three/build/three.module.js';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as lil from 'lil-gui';
import './style.scss';

let clock, mixer, controls;

// debug
const gui = new lil.GUI;

//  canvas
const canvas = document.querySelector('#canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// camera
const camera = new three.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000);
// camera.position.y = ;
camera.position.z = 0;

// scene
const scene = new three.Scene();
const renderer = new three.WebGLRenderer({
    canvas: document.querySelector('#canvas'),
    antialias: true,
});
scene.background = new three.Color('#000');

// light
// const light = new DirectionalLight(0xffff00, 1);
const light = new three.AmbientLight( 0xffffff );
const pointLight = new three.PointLight(0xffffff, 1)
// pointLight.position.set(0, 2, 12)
scene.add(pointLight)

scene.add(light);

// texture
const textureLoader = new three.TextureLoader();
const textureMew = textureLoader.load('./model/mew/textures/material_0_baseColor.png');

// controls
renderer.outputEncoding = three.sRGBEncoding;
controls = new OrbitControls(camera, renderer.domElement)

console.log(controls);

clock = new three.Clock();

// background();
model();

// gltf
function model(){
    const loader = new GLTFLoader();
    // const gltfUrl = './model/cat/scene.gltf';
    // const gltfUrl = './model/cute_cat/scene.gltf';
    const gltfUrl = './model/mew/scene.gltf';

    loader.load( gltfUrl , ( gltf ) => {
        
        const model = gltf.scene;
        mixer = new three.AnimationMixer(model);
        mixer.clipAction(gltf.animations[0]).play(); 
        
        // model.position.y = -10;
        model.rotation.y = 0;
        model.scale.set(1.1, 1.1, 1.1);
        // textureMew
        //텍스쳐 적용
        model.traverse((child) => {
            if (child.isMesh) {
            // child.material = child.material.clone();
            child.material.map = textureMew;
            }
        });

        // debug
        gui.add(model.position, 'y', -1000, 1000, 1).name('model position y');
        gui.add(model.position, 'z', 0, 1000, 1).name('model position z');
        gui.add(model.rotation, 'y', 0, 1000, 1).name('model rotation y');
        gui.add(camera.position, 'y', 0, 1000, 1).name('camera position y');
        gui.add(camera.position, 'z', 0, 1000, 1).name('camera position z');

        scene.add( model );
        ZoomFit(model, camera);
        
        function animate(){
            requestAnimationFrame(animate);
            // gltf.scene.rotation.y -= 0.01;
            // gltf.scene.rotation.x += 0.01;
            if( mixer ) {
                mixer.update(clock.getDelta());
            }
            renderer.render( scene, camera );
        }
        animate();
        console.log(model.rotation);
    });
}

function ZoomFit(object3D, camera){
    const box = new three.Box3().setFromObject(object3D);
    const sizeBox = box.getSize(new three.Vector3()).length();
    const centerBox = box.getCenter(new three.Vector3());
    const halfSizeModel =  sizeBox * 0.8;
    const halfFov = three.MathUtils.degToRad(camera.fov * 0.3);
    const distance = halfSizeModel / Math.tan(halfFov);
    const direction = new three.Vector3().subVectors(camera.position, centerBox).normalize();
    const position = direction.multiplyScalar(distance).add(centerBox);
    
    camera.position.copy(position);
    camera.near = sizeBox / 100;
    camera.far = sizeBox * 100;

    camera.updateProjectionMatrix();   
}

function background() {
    
    const url = './model/background/bg1.jpeg';
    const texture = textureLoader.load( url, () => {
        const renderTarget = new three.WebGLCubeRenderTarget(texture.image.height);
        renderTarget.fromEquirectangularTexture(renderer, texture);
        scene.background = renderTarget.texture;
    })
}