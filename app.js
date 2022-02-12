import Playground from "./playground.js";
import lineProgram from "./programs/lineProgram.js";

const canvas = document.getElementById('canvas');

const gl = canvas.getContext('webgl2', {alpha: false});
if (gl === null) {
    console.error('Unable to init WebGL. Your browser or machine may not support it.');
}

const pg = new Playground(gl);

// const squares = pg.loadProgram(squareProgram);
const lines = pg.loadProgram(lineProgram);

pg.startScene();

let playing = true;

canvas.addEventListener('click', () => {
    // pg.programInfo.uniforms.repeat.value = Math.floor(Math.random() * 25) * 2;
    // pg.programInfo.uniforms.color.value = [Math.random(), Math.random(), Math.random(), 1.0];

    if (playing) {
        pg.stopScene();
        playing = false;
    }
    else {
        pg.startScene();
        playing = true;
    }
})