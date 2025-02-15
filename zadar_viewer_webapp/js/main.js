// Global variables
let scene, camera, renderer, controls, points_geom, gridHelper;
let pointSize = 0.5;

let perspective_camera = true;

CameraModes = {
    Perspective: "PERSPECTIVE",
    Orthographic: "ORTHOGRAPHIC"
}

class CameraController {
    perspective_camera = null;
    orthographic_camera = null;
    current_camera_mode = CameraModes.Orthographic;
    constructor(){
        console.log("Callign camera controller creator")
        this.perspective_camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.orthographic_camera = new THREE.OrthographicCamera(100, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.current_camera_mode = CameraModes.Perspective;
        camera = this.perspective_camera;
    }
    switch_to_perspective(){
        if(this.current_camera_mode === CameraModes.Perspective){return;}
        const oldY = this.perspective_camera.position.y;
        this.perspective_camera.position.copy(this.orthographic_camera.position);
        this.perspective_camera.position.y = oldY / this.orthographic_camera.zoom;
        this.perspective_camera.updateProjectionMatrix();
        camera = this.perspective_camera;
        controls.object = this.perspective_camera;
        this.current_camera_mode = CameraModes.Perspective;
        renderer.clear();
        renderer.render(scene, camera);
    }
    frustumHeightAtDistance(distance) {
        const vFov = (this.perspective_camera.fov * Math.PI) / 180;
        return Math.tan(vFov / 2) * distance * 2;
    }
      
    frustumWidthAtDistance(distance) {
    return this.frustumHeightAtDistance(distance) * this.perspective_camera.aspect;
    }
    switch_to_orthographic(){
        if(this.current_camera_mode === CameraModes.Orthographic){return;}
        this.orthographic_camera.position.copy(this.perspective_camera.position);
        const distance = this.perspective_camera.position.distanceTo(controls.target);
        const halfWidth = this.frustumWidthAtDistance(distance) / 2;
        const halfHeight = this.frustumHeightAtDistance(distance) / 2;
        this.orthographic_camera.top = halfHeight;
        this.orthographic_camera.bottom = -halfHeight;
        this.orthographic_camera.left = -halfWidth;
        this.orthographic_camera.right = halfWidth;
        this.orthographic_camera.zoom = 1;
        this.orthographic_camera.lookAt(controls.target);
        this.orthographic_camera.updateProjectionMatrix();
        camera = this.orthographic_camera;
        renderer.clear();
        renderer.render(scene, camera);
        controls.object = this.orthographic_camera;
        this.current_camera_mode = CameraModes.Orthographic;
        
    }
    toggle_perspectives(){
        if(this.current_camera_mode === CameraModes.Orthographic){
            this.switch_to_perspective();
        } else if(this.current_camera_mode === CameraModes.Perspective){
            this.switch_to_orthographic();
        }
        else {
            throw new Error("Camera is current a invalid mode");
        }
    }
}

let camera_controller = null;

// ----------------
// MAIN VISUALIZER
// ----------------
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    render_3d();
}
function render_3d() {
    renderer.render(scene, camera);
}
function init() {
    scene = new THREE.Scene();
    camera_controller = new CameraController();
    renderer = new THREE.WebGLRenderer();
    // init
    renderer.setSize(window.innerWidth, window.innerHeight);
    var container = document.getElementById('viewer');
    container.appendChild(renderer.domElement); // document.body.appendChild(renderer.domElement);
    renderer.setSize(container.clientWidth, container.clientHeight);
    // Add axis to the scene
    var axisSize = 10;
    var xAxisGeometry = new THREE.BufferGeometry().setFromPoints( [ new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( axisSize, 0, 0 ) ] );
    var xAxisMaterial = new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 5 }); // You can adjust the color and width
    var xAxis = new THREE.Line(xAxisGeometry, xAxisMaterial);
    scene.add(xAxis);
    var yAxisGeometry = new THREE.BufferGeometry().setFromPoints( [ new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, axisSize, 0 ) ] );
    var yAxisMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00, linewidth: 5 });
    var yAxis = new THREE.Line(yAxisGeometry, yAxisMaterial);
    scene.add(yAxis);
    var zAxisGeometry = new THREE.BufferGeometry().setFromPoints( [ new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, axisSize ) ] );
    var zAxisMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff, linewidth: 5 });
    var zAxis = new THREE.Line(zAxisGeometry, zAxisMaterial);
    scene.add(zAxis);
    // Grid
    var gridSize = 1000; // Total grid size
    var gridStep = 2.5; // Desired step in meters
    var divisions = gridSize / gridStep; // Calculate how many divisions you need
    gridHelper = new THREE.GridHelper(gridSize, divisions);
    gridHelper.rotation.x = Math.PI / 2; // Rotate the grid to align it with the XY plane
    // Adjust transparency
    gridHelper.material.opacity = 0.5;
    gridHelper.material.transparent = true;
    gridHelper.geometry.attributes.color.array.fill(0.5);
    scene.add(gridHelper);
    // Set up orbit controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.addEventListener('change', render_3d); 
    controls.minDistance = 2;
    controls.maxDistance = 500;
    controls.enablePan = true;
    camera.position.set(0, 0.1, 50); 
    // Add custom UI Handlers
    container.addEventListener("dblclick", (e) => {
        var mouse = new THREE.Vector2();
        mouse.x = (e.offsetX / container.offsetWidth) * 2 - 1;
        mouse.y = - (e.offsetY / container.offsetHeight) * 2 + 1;
        var raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);
        let intersection = new THREE.Vector3();
        raycaster.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), intersection);
        console.log(intersection)
        if(intersection === null){
            console.error("Cant resolve where on the ground the user wants to click")
        }
        centerViewAt(intersection.x, intersection.y, camera.position.z);
    });

    document.addEventListener('keydown', function(event) {
        if (event.key === 'S' ||event.key === 's') {
            console.log("The 'S' key was pressed.");
            orientations = [new THREE.Vector3(1,0,0),new THREE.Vector3(0,1,0),new THREE.Vector3(0,0,1),new THREE.Vector3(-1,0,0),new THREE.Vector3(0,-1,0),new THREE.Vector3(0,0,-1)];
            controlpoint_camera = camera.position.clone();
            controlpoint_camera.sub(controls.target);
            console.log(orientations);
            orientations.sort((oa,ob) => (Math.abs(controlpoint_camera.angleTo(oa))) - (Math.abs(controlpoint_camera.angleTo(ob))) );
            console.log(orientations);
            selected_orientation = orientations[0];
            selected_orientation.multiplyScalar(controlpoint_camera.length());
            selected_orientation.add(controls.target);
            console.log(selected_orientation);
            camera.position.set(selected_orientation.x,selected_orientation.y,selected_orientation.z);
            camera.updateProjectionMatrix();
            renderer.clear();
            renderer.render(scene, camera);
            animate()
        }
    });


    document.addEventListener('keydown', function(event) {
        if (event.key === 'O' ||event.key === 'o') {
            console.log("The 'O' key was pressed.");
            // Call any function you want to execute when 'O' is pressed
            // For example, you could call your switch_to_orthographic function here
            if(camera_controller) {
                camera_controller.toggle_perspectives();
            }
        }
    });

    // Run
    animate();
    addAxisLabel('x', 'X');
    addAxisLabel('y', 'Y');
}

function setBirdsEyeView(height) {
    camera.position.set(0, 0, height); // X and Y axes are on the ground plane, Z is up. Adjust Z for height.
    camera.lookAt(scene.position); // Make the camera look at the center of the scene
}

function centerViewAt(x,y,height=10){
    camera.position.set(x,y,height)
    camera.lookAt(x,y,0);
    controls.target = new THREE.Vector3(x,y,0);
    controls.update();
}


function createTextTexture(text, color = 'white') {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = 'Bold 80px Arial';
    context.fillStyle = color;
    context.fillText(text, 10, 50);
    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    return texture;
}
function addAxisLabel(axis, text) {
    const textTexture = createTextTexture(text);
    const material = new THREE.SpriteMaterial({ 
        map: textTexture 
    });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(6, 6, 1); // Adjusted scale for better visibility from bird's-eye view
    switch(axis) {
        case 'x':
            sprite.position.set(10, 0, 0); // Adjust based on your grid/scene size
            sprite.material.color.set(0xff0000); // Red color
            break;
        case 'y':
            sprite.position.set(0, 10, 0); // Adjust based on your grid/scene size
            sprite.material.color.set(0x00ff00);
            break;
    }
    sprite.renderOrder = 1;
    material.depthTest = false;
    scene.add(sprite);
}


init()

