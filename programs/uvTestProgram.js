import {functions} from './shaderHelpers.js'

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

    uniform float c_scale;


    ${functions}

    void main() {
        gl_FragColor = vec4(texCoords * c_scale, 0.0, 1.0);
    }
`;

export default {
    displayName: 'UV',
    vert: vert,
    frag: frag,
    uniforms: {
        scale: {
            key: 'c_scale',
            value: 1.0,
            type: '1f',
            min: 0,
            increment: .25,
        },
    },
}