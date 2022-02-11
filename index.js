import shaderHelpers from './shaderHelpers.js'

let aspectRatio, mousePos;
const canvas = document.getElementById('canvas');
const resizeObserver = new ResizeObserver(() => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    aspectRatio = canvas.width / canvas.height;
    main();
});
resizeObserver.observe(document.body);

window.addEventListener('mousemove', e => {

    const pos = getNoPaddingNoBorderCanvasRelativeMousePosition(e, canvas);
  
    // pos is in pixel coordinates for the canvas.
    // so convert to WebGL clip space coordinates
    // const x = pos.x / canvas.width  *  2 - 1;
    // const y = pos.y / canvas.height * -2 + 1;

    const x = pos.x / canvas.width;
    const y = 1 - ( pos.y / canvas.height );

    mousePos = [x, y];
});

function main() {
    const gl = canvas.getContext('webgl');
    if (gl === null) {
        console.error('Unable to init WebGL. Your browser or machine may not support it.');
    }

    const vert = /* glsl */ `
        attribute vec2 position;
        varying vec2 texCoords;

        void main() {
            texCoords = (position + 1.0) / 2.0;
            gl_Position = vec4(position, 0.0, 1.0);
        }
    `;

    const frag = /* glsl */ `
        precision highp float;

        varying vec2 texCoords;
        uniform vec2 mousePos;
        uniform float aspect;
        uniform float time;

        ${shaderHelpers}

        void main() {
            float repeat = 20.0;
            float falloff = 15.0;
            float lineLength = .5;
            float lineThickness = .05;
            
            vec2 newTexCoords = (texCoords - .5) * vec2(aspect, 1.0);
            vec2 newMouseCoords = (mousePos - .5) * vec2(aspect, 1.0);

            vec2 snappedTexCoords = floor(newTexCoords * repeat);

            float distanceFromMouse = 1.0 - (distance(snappedTexCoords + .5, newMouseCoords * repeat) / falloff);
            distanceFromMouse = clamp(distanceFromMouse, 0.0, 1.0);

            vec2 vectorField = newMouseCoords - ( (snappedTexCoords + .5 ) / repeat );
            float rotationField = atan(vectorField.y, vectorField.x);
            // rotationField *= distanceFromMouse;


            // float noiseValue = snoise(vec3(snappedTexCoords, time * 4.0));
            newTexCoords = mod(newTexCoords * repeat, vec2(1, 1));
            newTexCoords = rotateUV(newTexCoords, .785);
            // newTexCoords = rotateUV(newTexCoords, distanceFromMouse * 3.14159265 * 2.0);
            newTexCoords = rotateUV(newTexCoords, rotationField + ((sin(time * 10.0) * 2.0 - 1.0) * .785 * distanceFromMouse));

            vec3 design =   vec3(newTexCoords.x > (.5 - lineThickness/2.0) && newTexCoords.x < (.5 + lineThickness/2.0) && newTexCoords.y > (.5 - lineLength/2.0) && newTexCoords.y < (.5 + lineLength/2.0))
                            * mix(vec3(1.0), vec3(0.0, 1.0, .5), distanceFromMouse);

            gl_FragColor = vec4(design, 1.0);
        }
    `;
    

    const shaderProgram = initShaderProgram(gl, vert, frag);
    

    const programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, 'position'),
        },
        uniformLocations: {
            aspectRatio: gl.getUniformLocation(shaderProgram, 'aspect'),
            time: gl.getUniformLocation(shaderProgram, 'time'),
            mousePos: gl.getUniformLocation(shaderProgram, 'mousePos'),
        }
        
    }

    const buffers = initBuffers(gl);

    drawScene(gl, programInfo, buffers)
}

function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);


    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Unable to initialize the shader program:  ' + gl.getProgramInfoLog(program));
        return null;
    }

    return program;
}

function loadShader(gl, type, source) {
    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);

    gl.compileShader(shader)

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('An error occurred comiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

function initBuffers(gl) {
    const positionBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    const positions = [
         1.0,  1.0,
        -1.0,  1.0,
         1.0, -1.0,
        -1.0, -1.0,
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    
    return {
        position: positionBuffer,
    };
}

function drawScene(gl, programInfo, buffers, time) {
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    
    const positionLocation = programInfo.attribLocations.vertexPosition;
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLocation);

    gl.useProgram(programInfo.program);

    gl.uniform1f(programInfo.uniformLocations.aspectRatio, aspectRatio);
    gl.uniform1f(programInfo.uniformLocations.time, time * .0001);
    gl.uniform2fv(programInfo.uniformLocations.mousePos, new Float32Array(mousePos));
    
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    requestAnimationFrame((time) => drawScene(gl, programInfo, buffers, time));
}

function getRelativeMousePosition(event, target) {
    target = target || event.target;
    var rect = target.getBoundingClientRect();

    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
    }
}
  
// assumes target or event.target is canvas
function getNoPaddingNoBorderCanvasRelativeMousePosition(event, target) {
    target = target || event.target;
    var pos = getRelativeMousePosition(event, target);

    pos.x = pos.x * target.width  / target.clientWidth;
    pos.y = pos.y * target.height / target.clientHeight;

    return pos;  
}

// window.onload = main;
