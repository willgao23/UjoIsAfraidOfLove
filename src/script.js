import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'

THREE.ColorManagement.enabled = false

//Canvas
const canvas = document.querySelector('canvas.webgl')

//Scene
const scene = new THREE.Scene()

//Models
const gltfLoader = new GLTFLoader() 
let mixer = null
gltfLoader.load(
    'ujo.glb',
    (gltf) => {
        mixer = new THREE.AnimationMixer(gltf.scene)
        const run = mixer.clipAction(gltf.animations[1])
        run.play()
        gltf.scene.scale.set(0.25, 0.25, 0.25)
        scene.add(gltf.scene)
        
        const jump = mixer.clipAction(gltf.animations[0])
        jump.loop = THREE.LoopOnce
        window.addEventListener('click', () => {
            if (!jump.isRunning()) {
                run.stop()
                jump.play()
                jump.reset()
            }
          })
        window.addEventListener('keydown', (event) => {
            if (event.key == " ") {
                if (!jump.isRunning()) {
                    run.stop()
                    jump.play()
                    jump.reset()
                }
            }
        })

        mixer.addEventListener('finished', (event) => {
            if (event.action._clip.name === "jump") {
                run.play() 
            }
        })

    }
)

//Sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})


//Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set (-3, 1, 2)
camera.rotateY((13 * Math.PI)/ 8)
scene.add(camera)

//AxesHelper
const axesHelper = new THREE.AxesHelper(5)
scene.add(axesHelper)

//Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.outputColorSpace = THREE.LinearSRGBColorSpace
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

//Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6)
directionalLight.position.set(5, 5, 5)
scene.add(directionalLight)

//Animate
const clock = new THREE.Clock()
let previousTime = 0

const tick = () => {
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    if(mixer) {
        mixer.update(deltaTime)
    }

    renderer.render(scene, camera)

    window.requestAnimationFrame(tick)
}

tick()