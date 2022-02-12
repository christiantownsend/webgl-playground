export default class Playground {
    constructor(context) {
        this.gl = context;
        this.programInfo = {
            program: null,
            attribLocations: {
                vertexPosition: null,
            },
            uniforms: {
                time: {
                    key: 'time',
                },
                aspectRatio: {
                    key: 'aspect',
                    type: '1f'
                },
                mousePos: {
                    key: 'mousePos',
                    value: [.5, .5],
                    type: '2fv'
                },
            }
        };
        this.buffers = this.initBuffers();

        this.animationFrame = null;

        const resizeObserver = new ResizeObserver(() => {
            this.gl.canvas.width = window.innerWidth;
            this.gl.canvas.height = window.innerHeight;
            this.programInfo.uniforms.aspectRatio.value = this.gl.canvas.width / this.gl.canvas.height;
        });
        resizeObserver.observe(document.body);

        window.addEventListener('mousemove', e => {
            const pos = getNoPaddingNoBorderCanvasRelativeMousePosition(e, canvas);
        
            const x = pos.x / canvas.width;
            const y = 1 - ( pos.y / canvas.height );
        
            this.programInfo.uniforms.mousePos.value = [x, y];
        });
    }

    loadProgram(program) {

        const gl = this.gl;

        const vertexShader = this.loadShader(gl.VERTEX_SHADER, program.vert);
        const fragmentShader = this.loadShader(gl.FRAGMENT_SHADER, program.frag);


        const webGLProgram = gl.createProgram();
        gl.attachShader(webGLProgram, vertexShader);
        gl.attachShader(webGLProgram, fragmentShader);
        gl.linkProgram(webGLProgram);

        if (!gl.getProgramParameter(webGLProgram, gl.LINK_STATUS)) {
            console.error('Unable to initialize the shader program:  ' + gl.getProgramInfoLog(webGLProgram));
            return null;
        }

        this.programInfo.program = webGLProgram;
        this.programInfo.attribLocations.vertexPosition = gl.getAttribLocation(webGLProgram, 'position');
        this.programInfo.uniforms = {...this.programInfo.uniforms, ...program.uniforms};

        for (let key in this.programInfo.uniforms) {
            const uniform = this.programInfo.uniforms[key];
            uniform.location = gl.getUniformLocation(this.programInfo.program, uniform.key);
        }

        return this.programInfo;
    }

    loadShader(type, source) {

        const gl = this.gl;

        const shader = gl.createShader(type);

        gl.shaderSource(shader, source);

        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }

        return shader;
    }

    initBuffers() {

        const gl = this.gl;

        const positionBuffer = gl.createBuffer();
    
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    
        const positions = [
             1.0,  1.0,
            -1.0,  1.0,
             1.0, -1.0,
            -1.0, -1.0,
        ];
    
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
        
        const buffers = {
            position: positionBuffer,
        };

        // this.buffers = buffers;

        return buffers;
    }

    startScene(time) {

        const gl = this.gl;
        const programInfo = this.programInfo;
        const buffers = this.buffers;

        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        // gl.clearDepth(1.0);
        // gl.enable(gl.DEPTH_TEST);
        // gl.depthFunc(gl.LEQUAL);
    
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
        
        const positionLocation = programInfo.attribLocations.vertexPosition;
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(positionLocation);
    
        gl.useProgram(programInfo.program);
    
        for (let key in programInfo.uniforms) {
            const uniform = programInfo.uniforms[key];
            this.setUniform(uniform.location, uniform.type, uniform.value);
        }
    
        gl.uniform1f(programInfo.uniforms.time.location, (time || 0) * .0001);
        
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    
        this.animationFrame = requestAnimationFrame((time) => this.startScene(time));
    }

    stopScene() {
        cancelAnimationFrame(this.animationFrame);
    }

    setUniform(location, type, value) {

        const gl = this.gl;

        switch (type) {
            case '1f':
                gl.uniform1f(location, value);
                break;
            case '2f':
                gl.uniform2f(location, value);
                break;
            case '3f':
                gl.uniform3f(location, value);
                break;
            case '4f':
                gl.uniform4f(location, value);
                break;
            case '1fv':
                gl.uniform1fv(location, new Float32Array(value));
                break;
            case '2fv':
                gl.uniform2fv(location, new Float32Array(value));
                break;
            case '3fv':
                gl.uniform3fv(location, new Float32Array(value));
                break;
            case '4fv':
                gl.uniform4fv(location, new Float32Array(value));
                break;
            case '1i':
                gl.uniform1i(location, value);
                break;
            case '2i':
                gl.uniform2i(location, value);
                break;
            case '3i':
                gl.uniform3i(location, value);
                break;
            case '4i':
                gl.uniform4i(location, value);
                break;
            case '1iv':
                gl.uniform1iv(location, new Int32Array(value));
                break;
            case '2iv':
                gl.uniform2iv(location, new Int32Array(value));
                break;
            case '3iv':
                gl.uniform3iv(location, new Int32Array(value));
                break;
            case '4iv':
                gl.uniform4iv(location, new Int32Array(value));
                break;
            default:
                gl.uniform1f(location, value);
        }
    }
}

function getRelativeMousePosition(event, target) {
    target = target || event.target;
    var rect = target.getBoundingClientRect();

    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
    }
}

function getNoPaddingNoBorderCanvasRelativeMousePosition(event, target) {
    target = target || event.target;
    var pos = getRelativeMousePosition(event, target);

    pos.x = pos.x * target.width  / target.clientWidth;
    pos.y = pos.y * target.height / target.clientHeight;

    return pos;  
}