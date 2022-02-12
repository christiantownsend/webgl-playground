import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';
import Playground from "./playground.js";

import { UniformInput } from './components.js'

import lineProgram from "./programs/lineProgram.js";
import squareProgram from "./programs/squareProgram.js";
import uvTestProgram from "./programs/uvTestProgram.js";

createApp({
    components: { UniformInput },
    data() {
        return {
            selected: null,
            programs: [
                lineProgram,
                squareProgram,
                uvTestProgram
            ],
            playground: {
                programInfo: {},
            },
            playing: false,
            message: 'Hello World',
        }
    },
    mounted() {
        const canvas = document.getElementById('canvas');
        const gl = canvas.getContext('webgl2', {alpha: false});
        this.playground = new Playground(gl);

        const playgroundConfig = {
            upscale: 1.5,
        }
        this.playground.loadConfig(playgroundConfig);
        
        this.selected = this.programs[0];
        this.playground.loadProgram(this.selected);

        this.playground.startScene();
        this.playing = true;
    },
    watch: {
        selected(newSelection) {
            this.playground.loadProgram(newSelection);
        }
    },
    methods: {
        togglePlaying: function() {
            if (this.playing) {
                this.playground.stopScene();
            }
            else {
                this.playground.startScene();
            }

            this.playing = !this.playing;
        }
    }
}).mount('#app');

// let playing = true;

// canvas.addEventListener('click', () => {
//     // pg.programInfo.uniforms.repeat.value = Math.floor(Math.random() * 25) * 2;
//     // pg.programInfo.uniforms.color.value = [Math.random(), Math.random(), Math.random(), 1.0];

//     if (playing) {
//         pg.stopScene();
//         playing = false;
//     }
//     else {
//         pg.startScene();
//         playing = true;
//     }
// })