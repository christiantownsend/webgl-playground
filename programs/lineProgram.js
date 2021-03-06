import { constants, functions } from './shaderHelpers.js'

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

    ${constants}

    varying vec2 texCoords;
    uniform vec2 mousePos;
    uniform float aspect;
    uniform float time;

    uniform vec3 c_color;
    uniform float c_repeat;
    uniform float c_falloff;
    uniform float c_colorSpread;
    uniform float c_lineLength;
    uniform float c_lineThickness;

    ${functions}

    void main() {
        vec4 color = vec4(c_color, 1.0);
        float repeat = c_repeat;
        float falloff = c_falloff;
        float colorSpread = c_colorSpread;
        float lineLength = c_lineLength;
        float lineThickness = c_lineThickness;
        
        vec2 newTexCoords = (texCoords - .5) * vec2(aspect, 1.0);
        vec2 newMouseCoords = (mousePos - .5) * vec2(aspect, 1.0);

        vec2 snappedTexCoords = floor(newTexCoords * repeat);

        float distanceFromMouse = 1.0 - (distance(snappedTexCoords + .5, newMouseCoords * repeat) / falloff);
        distanceFromMouse = clamp(distanceFromMouse, 0.0, 1.0);

        vec2 vectorField = newMouseCoords - ( (snappedTexCoords + .5 ) / repeat );
        float rotationField = atan(vectorField.y, vectorField.x);


        // float noiseValue = snoise(vec3(snappedTexCoords, time * 4.0));
        newTexCoords = mod(newTexCoords * repeat, vec2(1, 1));
        // newTexCoords = rotateUV(newTexCoords, .785);
        // newTexCoords = rotateUV(newTexCoords, distanceFromMouse * 3.14159265 * 2.0);
        // newTexCoords = rotateUV(newTexCoords, rotationField);
        newTexCoords = rotateUV(newTexCoords, rotationField + ((sin(time * 10.0) * 2.0 - 1.0) * (PI/4.0) * distanceFromMouse));

        // vec3 design =   vec3(newTexCoords.x > (.5 - lineThickness/2.0) && newTexCoords.x < (.5 + lineThickness/2.0) && newTexCoords.y > (.5 - lineLength/2.0) && newTexCoords.y < (.5 + lineLength/2.0))
        //                 * mix(vec3(1.0), vec3(0.0, 1.0, .5), min(distanceFromMouse, colorSpread) / colorSpread);
        vec3 design =   vec3(newTexCoords.x > (.5 - lineThickness/2.0) && newTexCoords.x < (.5 + lineThickness/2.0) && newTexCoords.y > (.5 - lineLength/2.0) && newTexCoords.y < (.5 + lineLength/2.0))
                        * mix(vec3(1.0), color.xyz, min(distanceFromMouse, colorSpread) / colorSpread);

        gl_FragColor = vec4(design, 1.0);
    }
`;

export default {
    displayName: 'Lines',
    vert: vert,
    frag: frag,
    uniforms: {
        color: {
            key: 'c_color',
            value: [0.0, 1.0, 0.5],
            type: '3fv',
            max: 1,
            min: 0,
            increment: .1,
        },
        repeat: {
            key: 'c_repeat',
            value: 20.0,
            type: '1f',
            min: 2,
        },
        falloff: {
            key: 'c_falloff',
            value: 12.0,
            type: '1f',
            min: 0,
        },
        colorSpread: {
            key: 'c_colorSpread',
            value: .75,
            type: '1f',
            increment: .05,
            min: .01,
            max: .99,
        },
        lineLength: {
            key: 'c_lineLength',
            value: .25,
            type: '1f',
            increment: .05,
        },
        lineThickness: {
            key: 'c_lineThickness',
            value: .05,
            type: '1f',
            increment: .05,
        },
    },
}