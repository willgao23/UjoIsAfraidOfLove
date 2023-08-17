import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

THREE.ColorManagement.enabled = false

//Canvas
const canvas = document.querySelector('canvas.webgl')

//Scene
const scene = new THREE.Scene()
const fog = new THREE.FogExp2(0xff9999, 0.15)
scene.fog = fog
scene.background = null

const updateAllMaterials = () =>
{
    scene.traverse((child) =>
    {
        if(child.isMesh && child.material.isMeshStandardMaterial)
        {
            child.castShadow = true
            child.receiveShadow = true
        }
    })
}

//Audio
const loseSound = new Audio('failSoundEffect.mp3')
const jumpSound = new Audio('jump.mp3')
const chimeSound = new Audio('chime.mp3')
jumpSound.volume = 0.5
loseSound.volume = 0.25 

//Models
const gltfLoader = new GLTFLoader()
let jump = null
let jumpCount = 0
let mixer = null
gltfLoader.load(
    'ujo.glb',
    (gltf) => {
        mixer = new THREE.AnimationMixer(gltf.scene)
        const run = mixer.clipAction(gltf.animations[1])
        run.play()
        gltf.scene.scale.set(0.25, 0.25, 0.25)
        scene.add(gltf.scene)
        
        jump = mixer.clipAction(gltf.animations[0])
        jump.loop = THREE.LoopOnce
        window.addEventListener('click', () => {
            if (!jump.isRunning()) {
                run.stop()
                jump.play()
                jump.reset()
                prevJumpCount = jumpCount
                jumpCount += 1
                jumpSound.play()
            }
          })
        window.addEventListener('keydown', (event) => {
            if (event.key == " ") {
                if (!jump.isRunning()) {
                    run.stop()
                    jump.play()
                    jump.reset()
                    prevJumpCount = jumpCount
                    jumpCount += 1
                    jumpSound.play()
                }
            }
        })

        mixer.addEventListener('finished', (event) => {
            if (event.action._clip.name === "jump") {
                run.play() 
            }
        })
        
        updateAllMaterials()
    }
)

let evilHeart = null
let evilHeart2 = null
gltfLoader.load(
    'evilHeart.glb',
    (gltf) => {
        evilHeart = gltf.scene
        gltf.scene.scale.set(0.25, 0.25, 0.25)
        gltf.scene.position.set(0, 0.6, 4)
        scene.add(gltf.scene)
    }
)
gltfLoader.load(
    'evilHeart.glb',
    (gltf) => {
        evilHeart2 = gltf.scene
        gltf.scene.scale.set(0.25, 0.25, 0.25)
        gltf.scene.position.set(0, 0.6, 8)
        scene.add(gltf.scene)
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
camera.position.set (-3 , 1, 2)
camera.rotateY((13 * Math.PI)/ 8)
scene.add(camera)

//Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    toneMapping: THREE.ACESFilmicToneMapping,
    toneMappingExposure: 3,
    useLegacyLights: false,
    alpha: true
})

renderer.outputColorSpace = THREE.LinearSRGBColorSpace
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFShadowMap
renderer.setClearColor(0xff9999, 1)

//Floor
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100),
    new THREE.MeshToonMaterial({
        color: 0xff9999
    })
)
floor.receiveShadow = true
floor.rotation.x = - Math.PI * 0.5
scene.add(floor)

//Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 1)
ambientLight.position.set(0, 2, 0) 
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 3)
directionalLight.position.set(-5, 3, 3)
directionalLight.target.position.set(0, 0, 0)
directionalLight.target.updateWorldMatrix()
directionalLight.castShadow = true
directionalLight.shadow.camera.far = 10
directionalLight.shadow.mapSize.set(512, 512)
directionalLight.shadow.normalBias = 0.029
directionalLight.shadow.bias = -0.02
scene.add(directionalLight)

//Animate
const clock = new THREE.Clock() 
let counter = document.getElementById("score")
let gameOver = document.getElementById("gameover")
let previousTime = 0
let speedFactor = 1.3
let rotateFactor = 4
let rotateFactor2 = 4
let failed = false
let score = 0
let prevJumpCount = 0
if (counter) {
    counter.innerHTML = score
}

const tick = () => {
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    if(mixer) {
        mixer.update(deltaTime)
    }

    if (evilHeart && evilHeart2) {
        if(evilHeart.position.z <= -4) {
            speedFactor = 0.8 + (Math.random())
            rotateFactor = 2 + (Math.random() * 4)
            evilHeart.position.z = 4 
        }
        evilHeart.position.z -= deltaTime * speedFactor
        evilHeart.rotation.y = elapsedTime * rotateFactor
    
    
        if(evilHeart2.position.z <= -4) {
            speedFactor = 0.8 + (Math.random())
            rotateFactor2 = 2 + (Math.random() * 4)
            evilHeart2.position.z = 4  
        }
        evilHeart2.position.z -= deltaTime * speedFactor
        evilHeart2.rotation.y = elapsedTime * rotateFactor2

        if (((evilHeart.position.z <= 0.1 && evilHeart.position.z >= 0) || (evilHeart2.position.z <= 0.1 && evilHeart2.position.z >= 0)) && (!(jump.time >= 0.52 && jump.time <= 1.1) || jump.enabled == false)) {
            if (!failed) {
                failed = true
                gameOver.style.display = 'flex'
                loseSound.play()
            }
        }

        if (failed == false && ((evilHeart.position.z < 0 && evilHeart.position.z > -0.5) || (evilHeart2.position.z < 0 && evilHeart2.position.z > -0.5))) {
            if (prevJumpCount != jumpCount) {
                score += 1
                counter.innerHTML = score
                if (score % 10 == 0) {
                    chimeSound.play()
                }
                prevJumpCount += 1
            }
        }
    }

    renderer.render(scene, camera)

    window.requestAnimationFrame(tick)
}

tick()


