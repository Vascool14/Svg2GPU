import React, { useEffect, useRef } from "react";
import { ContainerScroll } from "./Scroll";
import Button from "../../components/Button";
import ChevronRight from "../../components/icons/ChevronRight";
import { Link } from "react-router-dom";
import heroImg from "./heroimg.png"

interface LightningProps {
    hue?: number;
    xOffset?: number;
    speed?: number;
    intensity?: number;
    size?: number;
}

const Lightning: React.FC<LightningProps> = ({
    hue = 220,
    xOffset = 0,
    speed = 0.4,
    intensity = 0.4,
    size = 2,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const resizeCanvas = () => {
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
        };
        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);

        const gl = canvas.getContext("webgl");
        if (!gl) {
            console.error("WebGL not supported");
            return;
        }

        const vertexShaderSource = `
attribute vec2 aPosition;
void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

        const fragmentShaderSource = `
precision mediump float;
uniform vec2 iResolution;
uniform float iTime;
uniform float uHue;
uniform float uXOffset;
uniform float uSpeed;
uniform float uIntensity;
uniform float uSize;

#define OCTAVE_COUNT 10

vec3 hsv2rgb(vec3 c) {
    vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0,4.0,2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
    return c.z * mix(vec3(1.0), rgb, c.y);
}

float hash11(float p) {
    p = fract(p * .1031);
    p *= p + 33.33;
    p *= p + p;
    return fract(p);
}

float hash12(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * .1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

mat2 rotate2d(float theta) {
    float c = cos(theta);
    float s = sin(theta);
    return mat2(c, -s, s, c);
}

float noise(vec2 p) {
    vec2 ip = floor(p);
    vec2 fp = fract(p);
    float a = hash12(ip);
    float b = hash12(ip + vec2(1.0, 0.0));
    float c = hash12(ip + vec2(0.0, 1.0));
    float d = hash12(ip + vec2(1.0, 1.0));

    vec2 t = smoothstep(0.0, 1.0, fp);
    return mix(mix(a, b, t.x), mix(c, d, t.x), t.y);
}

float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < OCTAVE_COUNT; ++i) {
        value += amplitude * noise(p);
        p *= rotate2d(0.45);
        p *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy;
    uv = 2.0 * uv - 1.0;
    uv.x *= iResolution.x / iResolution.y;
    uv.x += uXOffset;

    uv += 2.0 * fbm(uv * uSize + 0.8 * iTime * uSpeed) - 1.0;

    float dist = abs(uv.x);
    vec3 baseColor = hsv2rgb(vec3(uHue / 360.0, 0.7, 0.8));
    vec3 col = baseColor * pow(mix(0.0, 0.07, hash11(iTime * uSpeed)) / dist, 1.0) * uIntensity;
    fragColor = vec4(col, 1.0);
}

void main() {
    mainImage(gl_FragColor, gl_FragCoord.xy);
}`;

        const compileShader = (source: string, type: number): WebGLShader | null => {
            const shader = gl.createShader(type);
            if (!shader) return null;
            gl.shaderSource(shader, source);
            gl.compileShader(shader);

            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error("Shader compile error:", gl.getShaderInfoLog(shader));
                gl.deleteShader(shader);
                return null;
            }

            return shader;
        };

        const vertexShader = compileShader(vertexShaderSource, gl.VERTEX_SHADER);
        const fragmentShader = compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER);
        if (!vertexShader || !fragmentShader) return;

        const program = gl.createProgram();
        if (!program) return;

        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error("Program linking error:", gl.getProgramInfoLog(program));
            return;
        }

        gl.useProgram(program);

        const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
        const vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        const aPosition = gl.getAttribLocation(program, "aPosition");
        gl.enableVertexAttribArray(aPosition);
        gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

        const iResolutionLocation = gl.getUniformLocation(program, "iResolution");
        const iTimeLocation = gl.getUniformLocation(program, "iTime");
        const uHueLocation = gl.getUniformLocation(program, "uHue");
        const uXOffsetLocation = gl.getUniformLocation(program, "uXOffset");
        const uSpeedLocation = gl.getUniformLocation(program, "uSpeed");
        const uIntensityLocation = gl.getUniformLocation(program, "uIntensity");
        const uSizeLocation = gl.getUniformLocation(program, "uSize");

        const startTime = performance.now();
        let animationFrameId = 0;

        const render = () => {
            resizeCanvas();
            gl.viewport(0, 0, canvas.width, canvas.height);

            if (iResolutionLocation) gl.uniform2f(iResolutionLocation, canvas.width, canvas.height);
            if (iTimeLocation)
                gl.uniform1f(iTimeLocation, (performance.now() - startTime) / 1000.0);
            if (uHueLocation) gl.uniform1f(uHueLocation, hue);
            if (uXOffsetLocation) gl.uniform1f(uXOffsetLocation, xOffset);
            if (uSpeedLocation) gl.uniform1f(uSpeedLocation, speed);
            if (uIntensityLocation) gl.uniform1f(uIntensityLocation, intensity);
            if (uSizeLocation) gl.uniform1f(uSizeLocation, size);

            gl.drawArrays(gl.TRIANGLES, 0, 6);
            animationFrameId = requestAnimationFrame(render);
        };

        animationFrameId = requestAnimationFrame(render);

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener("resize", resizeCanvas);
        };
    }, [hue, intensity, size, speed, xOffset]);

    return <canvas ref={canvasRef} className="h-full w-full" />;
};

export default function HeroSection() {
    return (
        <div className="relative h-full w-full overflow-hidden">
            <div className="absolute inset-0 z-0">
                <Lightning />
            </div>

            <div className="absolute z-1 flex h-screen w-full flex-col px-6 text-center items-center justify-center">
                <h1 className="sr-only">svg2GPU</h1>
                <h1 className="hugeTitle" style={{ marginTop: "-10rem" }}>
                    {/* <span className="font-thin text-(--text)!">svg2</span>GPU */}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="-16 4 96 16" height={'calc(4rem + 3vw)'}>
                        <g transform="translate(2, 3) scale(0.016, 0.016)">
                            <path fill="var(--text)"
                                d="M41 657h31q0 4 1.5 11.5t11.5 26t26.5 32.5t50.5 25.5t79 11.5q81 0 122.5 -27.5t41.5 -75.5v-5q-2 -41 -38.5 -63.5t-87.5 -30.5t-101.5 -16.5t-86 -33t-35.5 -68.5q0 -54 48 -88.5t129 -34.5q36 0 65.5 6.5t48 17t33 23t21.5 25.5t11.5 23.5t5.5 16.5l1 7h-30l-2 -10q-2 -6 -12.5 -22t-26 -28t-46 -22t-69.5 -10q-59 0 -102 25.5t-43 68.5v2q1 36 36.5 54.5t86 25.5t101 16t86.5 37t38 79v2q0 57 -46.5 95t-148.5 38q-54 0 -94.5 -14t-59.5 -33.5t-30.5 -39t-13.5 -33.5z" />
                            <path fill="var(--text)" transform="translate(400, 0)"
                                d="M63 331l178 419l179 -419h31l-191 450h-38l-190 -450h31z" />
                            <path fill="var(--text)" transform="translate(800, 0)"
                                d="M41 557q0 -104 65 -170t174 -66q68 0 120 31t79 89v-110h30v571q0 36 -14.5 49t-50.5 13h-371v-27h371q20 0 26.5 -7t6.5 -28v-227q-28 55 -79.5 85t-118.5 31h-3q-107 0 -171 -63.5t-64 -170.5zM130 710q55 54 149 54t147 -57.5t53 -149.5q0 -91 -53.5 -150t-146.5 -59q-89 0 -147 53.5t-58 155.5q0 100 56 153z" />
                            <path fill="var(--text)" transform="translate(1290, 0)"
                                d="M95 682q23 -44 60 -73.5t82.5 -54.5t91 -48t84.5 -46.5t65 -56t30 -72.5q1 -11 1 -22q0 -66 -46.5 -110t-143.5 -44q-57 0 -99 16t-60.5 39t-29 45.5t-10.5 38.5l-1 16h-31q0 -9 1.5 -22t13.5 -44t34 -54.5t69.5 -42.5t112.5 -19q111 0 165.5 53.5t54.5 126.5q0 11 -1 23q-4 49 -36.5 89t-77.5 65.5t-98.5 54t-99.5 54t-80.5 67.5t-41.5 93h445v27h-477q0 -54 23 -99z" />
                            <path fill="var(--text)" transform="translate(1870, 0)"
                                d="M20 460q0 -152 88.5 -242t250.5 -90q58 0 106.5 12t79.5 31.5t55 42.5t36.5 46.5t20 43t9.5 31.5l2 12h-139q-1 -4 -3 -11.5t-13.5 -26t-28.5 -33t-49.5 -26t-74.5 -11.5q-99 0 -150 59.5t-51 161.5q0 99 53 159.5t147 60.5q47 0 83 -13.5t55.5 -35t29.5 -41t15 -39.5h-184v-108h316q1 21 1 41q0 142 -80 224.5t-236 82.5q-163 0 -251 -89t-88 -242z" />
                            <path fill="var(--text)" transform="translate(2570, 0)"
                                d="M302 138q265 0 265 205q0 95 -64.5 153.5t-200.5 58.5h-136v226h-130v-643h266zM166 246v200h136q63 0 99 -26.5t36 -76.5q0 -97 -135 -97h-136z" />
                            <path fill="var(--text)" transform="translate(3150, 0)"
                                d="M166 138v378q0 77 34.5 120.5t123.5 43.5q90 0 124.5 -43.5t34.5 -120.5v-378h130v378q0 47 -7 84.5t-26 74.5t-50.5 61.5t-83.5 39.5t-122 15q-89 0 -148.5 -21.5t-88.5 -62.5t-40 -85.5t-11 -105.5v-378h130z" />
                        </g>
                    </svg>
                </h1>
                <h2 className="font-thin!">
                    draw svg primitives on the GPU at{" "}
                    <span className="underline text-(--primary)!">lightning speeds</span>
                </h2>
                <div className="flex gap-8 mt-10 items-center justify-center">
                    <Link to="/playground" style={{ textDecoration: "none" }}>
                        <Button>Try it out</Button>
                    </Link>
                    <Link to="/docs" style={{ textDecoration: "none" }}>
                        <Button
                            style={{
                                background: "none",
                                color: "#FFFFFF",
                                display: "flex",
                                padding: "0.5rem 1.5rem",
                                cursor: "pointer"
                            }}
                        >
                            <span>Read the docs</span>
                            <div className="h-5 mt-1.25 ml-2">
                                <ChevronRight />
                            </div>
                        </Button>
                    </Link>
                </div>
            </div>

            <ContainerScroll titleComponent={<></>}>
                {/* <p className="text-[calc(1rem+1vw)]! font-thin! text-(--text)!">
                    Draw&nbsp;SVGs on the <strong>GPU</strong> at{" "}
                    <span className="underline text-(--primary)!">lightning</span> speeds
                </p> */}
                <img src={heroImg} className="w-full h-full cover-fit" />
            </ContainerScroll>
        </div>
    );
}
