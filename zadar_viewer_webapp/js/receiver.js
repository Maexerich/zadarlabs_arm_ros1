// ----------------
// RECEIVER FUNCTIONS
// ----------------

let Controls = {
  color_mode: 1,
  color_minimum: -5,
  color_maximum: 5,
  point_size: 0,
}

let LOCK = false;

let TRACK_CALLBACK = null;
function isLocalFile(url) {
  // Check if the URL starts with "file://" or "http://localhost" or "http://127.0.0.1"
  return url.startsWith("file://") || url.startsWith("http://localhost") || url.startsWith("http://127.0.0.1");
}
const onDeviceViewer = !isLocalFile(window.location.href);
console.log(onDeviceViewer? "On Device" : "On Browser");
let HOST = onDeviceViewer? window.location.protocol+"//"+window.location.hostname+":8080" : "http://localhost:8080";


// Gets value of param from server then calls call_back
function asyncGetParamFromServer(name_str, type_str, callback){
  const data = {
    name: name_str,
    value: "0",
    type: type_str
};
console.log(data);
fetch(HOST+'/get_params', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
}).then(response => {
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
}).then(data => {
    console.log('Server response:', data);
    callback(data.value)
    return data.value
}).catch(error => {
    console.error('There has been a problem with your fetch operation:', error);
});
}

function setParamToServer(name_str, value_str, type_str) {
    const data = {
        name: name_str,
        value: value_str,
        type: type_str
    };
    fetch(HOST+'/set_params', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    }).then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    }).catch(error => {
        console.error('There was a problem with your fetch operation:', error);
    });
}

function launch_receiver() {
    setInterval(function() {
      if(LOCK){return;}
      LOCK = true;
      requestDataAndRender =  fetch(HOST+'/get_data')
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Network response was not ok.');
        })
        .then(data => {
            updateData(data);
            LOCK = 0;
            return null;
        })
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
            LOCK = false;
        });

    }, 30); 
}

// ----------------
// DATA STRUCTURE
// ----------------
function createCubes(trackVertices, colorList) {
    const geometry = new THREE.BoxGeometry(4, 4, 2);
    for (let i = 0; i < trackVertices.length; i += 3) {
        const x = trackVertices[i];
        const y = trackVertices[i + 1]; // Invert y-axis as needed
        const z = trackVertices[i + 2];
        const material = new THREE.MeshBasicMaterial({ color: new THREE.Color(colorList[i][0], colorList[i][1], colorList[i][2]), transparent: true, opacity: 0.7 });
        // Create a new cube for each center position
        const cube = new THREE.Mesh(geometry, material);
        cube.position.set(x, y, z); // Set position
        scene.add(cube); // Add cube to the scene
    }
}
function createWireframeCube(trackVertices, colorList) {
    const geometry = new THREE.BoxGeometry(4, 4, 2);
    for (let i = 0; i < trackVertices.length; i += 3) {
        const x = trackVertices[i];
        const y = trackVertices[i + 1]; // Invert y-axis as needed
        const z = trackVertices[i + 2];
        const wireframeGeometry = new THREE.WireframeGeometry(geometry);
        const material = new THREE.LineBasicMaterial({ color: new THREE.Color(colorList[i][0], colorList[i][1], colorList[i][2]), transparent: false});
        const wireframe = new THREE.LineSegments(wireframeGeometry, material);
        wireframe.position.set(x, y, z);
        scene.add(wireframe);
    }
}
function createPoints(pointList, colorList, sizeList) {
    // New frame
    const pointGeometry = new THREE.BufferGeometry();
    const pointVertices = new Float32Array(pointList.flat());
    const pointColors = new Float32Array(colorList.flat());
    const pointSizes = new Float32Array(sizeList.flat());
    pointGeometry.setAttribute('position', new THREE.Float32BufferAttribute(pointVertices, 3));
    pointGeometry.setAttribute('color', new THREE.Float32BufferAttribute(pointColors, 3));
    pointGeometry.setAttribute('size', new THREE.Float32BufferAttribute(pointSizes, 1));
    const vertexShader = `
        attribute float size;
        varying vec3 vColor;
        void main() {
            vColor = color;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = size * (300.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
        }
    `;
    const fragmentShader = `
        varying vec3 vColor;
        void main() {
            gl_FragColor = vec4(vColor, 1.0);
        }
    `;
    const pointMaterial = new THREE.ShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        vertexColors: true
    });
    points_geom = new THREE.Points(pointGeometry, pointMaterial);
    // Add to scene
    scene.add(points_geom);
}

function r_g_b_colorizer(z){
  const colors = [
    '#0000FF', // Blue
    '#0033FF',
    '#0066FF',
    '#0099FF',
    '#00CCFF',
    '#00FFFF', // Cyan
    '#33FFCC',
    '#66FF99',
    '#99FF66',
    '#CCFF33',
    '#FFFF00', // Yellow
    '#FFCC00',
    '#FF9900',
    '#FF6600',
    '#FF3300',
    '#FF0000'  // Red
  ];

  const scaledValue = Math.floor(z * 15);
  return new THREE.Color(colors[scaledValue])
}

function ValToColor(val) {
    min_val = Controls.color_minimum; 
    max_val = Controls.color_maximum;
    var norm_val = (val - min_val) / (max_val - min_val);
    norm_val = Math.max(0, Math.min(1, norm_val)); 
    return r_g_b_colorizer(norm_val)
}

// ----------------
// UPDATE VIEWER WEB APP DATA AND PARAMS
// ----------------
function updateData(data) {
    const start = Date.now();
    var points_vertices = [];
    var points_colors = [];
    var points_sizes = [];
    var track_vertices = [];
    var track_colors = [];
    var blueColor = { r: 0, g: 0, b: 1 };
    var color_mode = Controls.color_mode;
    var color = new THREE.Color(1, 0, 0);
    // Parse data
    var points = [];
    var clusters = [];
    var tracks = [];
    var odometry = [];

    var tracksTable = {};

    
    Object.keys(data).forEach((radarId) => {
      const radarData = data[radarId];
      points = [...points,...radarData["points"]];
      clusters = [...clusters,...radarData["clusters"]];
      tracks = [...tracks,...radarData["tracks"]];
      odometry = [...odometry,...radarData["odometry"]];
      tracksTable[radarId] = [...tracks];
    })

    for (var i = 0; i < points.length; i++) {
        var point = points[i];
        var x = point[0];
        var y = point[1];
        var z = point[2];
        var snr = point[3];
        var range = point[4];
        var doppler = point[5];
        var radar = point[6];
        points_vertices.push(x, -y, z);
        if (color_mode == 0) {
            color = ValToColor(snr);
        } else if (color_mode == 1) {
            color = ValToColor(z);
        } else if (color_mode == 2) {
            color = ValToColor(range);
        } else if (color_mode == 3) {
            color = ValToColor(radar);
        } else {
            color = ValToColor(Math.abs(doppler));
        }
        points_colors.push(color.r, color.g, color.b);
        points_sizes.push(Math.max(Controls.point_size,0.25)); // Default size for regular points
    }
    for (var i = 0; i < tracks.length; i++) {
        var track = tracks[i];
        var x = track[0];
        var y = track[1];
        var z = track[2];
        track_vertices.push(x, -y, z);
        track_colors.push(blueColor.r, blueColor.g, blueColor.b);
    }
    populateTracksTable(tracksTable);
    // Clear viewer
    scene.children.forEach(child => {
        if (child instanceof THREE.Points || child instanceof THREE.Mesh || child instanceof THREE.LineSegments) {
            scene.remove(child);
            // Dispose of the object's geometry and material if necessary
            if (child.geometry) {
                child.geometry.dispose();
            }
            if (child.material) {
                child.material.dispose();
            }
        }
    });
    scene.add(gridHelper);
    // Create viewer points
    //points_vertices = [1,-2,0,-2,1,0,1,-2,0,-2,1,0,1,-2,0,-2,1,0,1,-2,0,-2,1,0]
    createPoints(points_vertices, points_colors, points_sizes);
    createWireframeCube(track_vertices, track_colors);
    const end = Date.now();
    //console.log(`Rendering time: ${end - start} ms`);
}

function populateTracksTable(tracksTable) {
    if(TRACK_CALLBACK){
      TRACK_CALLBACK(tracksTable);
    }
}


// ----------------
// INIT
// ----------------

document.addEventListener('DOMContentLoaded', async function() {
    launch_receiver();
});
