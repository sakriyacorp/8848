/* GLSL for the ascent. Faceted terrain with brass contour lines, an altitude-driven sky dome
   with stars, a sea of clouds, and shader-driven snow + spindrift. */

export const terrainVert = /* glsl */ `
  varying vec3 vWorld;
  varying vec3 vNormal;
  void main() {
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorld = wp.xyz;
    vNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

export const terrainFrag = /* glsl */ `
  uniform vec3 uSunDir;
  uniform vec3 uSunColor;
  uniform vec3 uAmbient;
  uniform vec3 uFogColor;
  uniform float uFogDensity;
  uniform vec3 uCam;
  uniform float uSnowLine;
  uniform float uContour;
  uniform float uAlpen;
  uniform float uMode;
  uniform float uSmooth;
  varying vec3 vWorld;
  varying vec3 vNormal;

  void main() {
    vec3 n = normalize(cross(dFdx(vWorld), dFdy(vWorld)));
    if (dot(n, uCam - vWorld) < 0.0) n = -n;
    n = normalize(mix(n, normalize(vNormal), uSmooth));
    float slope = clamp(n.y, 0.0, 1.0);
    float h = vWorld.y;

    vec3 rockLow = vec3(0.17, 0.12, 0.09);
    vec3 rockHigh = vec3(0.27, 0.21, 0.16);
    vec3 rock = mix(rockLow, rockHigh, clamp((h - 1.0) / 6.5, 0.0, 1.0));
    vec3 grass = vec3(0.24, 0.18, 0.11);
    vec3 base = mix(grass, rock, smoothstep(2.2, 3.6, h));

    float snowAmt = smoothstep(uSnowLine - 0.45, uSnowLine + 0.45, h + (slope - 0.72) * 3.6);
    snowAmt = max(snowAmt, smoothstep(7.6, 8.2, h) * 0.85);
    vec3 snow = vec3(0.9, 0.87, 0.81);
    base = mix(base, snow, snowAmt);

    float diff = max(dot(n, normalize(uSunDir)), 0.0);
    float wrap = max(dot(n, normalize(uSunDir)) * 0.5 + 0.5, 0.0);
    vec3 col = base * (uAmbient * 0.8 + uSunColor * (pow(diff, 1.3) * 0.8 + wrap * 0.08));
    col += snow * snowAmt * uAlpen * vec3(0.42, 0.2, 0.08) * diff;

    // brass contour lines: minor every 250 m, major every 1000 m
    float hm = h / 0.25;
    float line = 1.0 - clamp(abs(fract(hm + 0.5) - 0.5) / (fwidth(hm) * 1.2), 0.0, 1.0);
    float hM = h;
    float major = 1.0 - clamp(abs(fract(hM + 0.5) - 0.5) / (fwidth(hM) * 1.4), 0.0, 1.0);
    vec3 brass = vec3(0.86, 0.75, 0.48);
    col = mix(col, brass, (line * 0.28 + major * 0.55) * uContour);

    // "brass contour" render mode (used by the interactive Everest): walnut + lines only
    if (uMode > 0.5) {
      vec3 wal = vec3(0.10, 0.07, 0.05) + vec3(0.06, 0.045, 0.03) * diff;
      col = mix(wal, brass, clamp(line * 0.55 + major * 0.9, 0.0, 1.0));
      col += brass * 0.10 * smoothstep(0.9, 1.0, diff);
    }

    float dist = length(vWorld - uCam);
    float fog = 1.0 - exp(-pow(dist * uFogDensity, 1.5));
    col = mix(col, uFogColor, clamp(fog, 0.0, 1.0));
    gl_FragColor = vec4(col, 1.0);  }
`;

export const skyVert = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_Position = p.xyww;
  }
`;

export const skyFrag = /* glsl */ `
  uniform vec3 uTop;
  uniform vec3 uMid;
  uniform vec3 uHorizon;
  uniform vec3 uSunDir;
  uniform vec3 uSunColor;
  uniform float uStars;
  uniform float uTime;
  uniform vec3 uMoonDir;
  uniform float uMoon;
  varying vec3 vDir;

  float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  void main() {
    vec3 d = normalize(vDir);
    float y = d.y;
    vec3 col = mix(uHorizon, uMid, smoothstep(-0.05, 0.22, y));
    col = mix(col, uTop, smoothstep(0.22, 0.85, y));
    float s = max(dot(d, normalize(uSunDir)), 0.0);
    col += uSunColor * (pow(s, 900.0) * 3.0 + pow(s, 14.0) * 0.28 + pow(s, 3.0) * 0.06);
    // moon
    float m = max(dot(d, normalize(uMoonDir)), 0.0);
    col += vec3(1.0, 0.96, 0.86) * (smoothstep(0.99955, 0.99975, m) * 1.2 + pow(m, 60.0) * 0.08) * uMoon;
    // stars + a faint milky band
    if (uStars > 0.0) {
      vec3 p = d * 320.0;
      float h = hash(floor(p));
      float star = step(0.9972, h) * smoothstep(0.02, 0.2, y);
      float tw = 0.55 + 0.45 * sin(uTime * 1.7 + h * 91.0);
      col += vec3(1.0, 0.95, 0.85) * star * tw * uStars;
      float band = exp(-pow(dot(d, normalize(vec3(0.5, 0.35, -0.8))) * 3.2, 2.0));
      col += vec3(0.95, 0.85, 0.7) * band * 0.035 * uStars * smoothstep(0.0, 0.3, y);
    }
    gl_FragColor = vec4(col, 1.0);  }
`;

export const cloudVert = /* glsl */ `
  varying vec3 vWorld;
  void main() {
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorld = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

export const cloudFrag = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColor;
  uniform vec3 uShade;
  uniform float uOpacity;
  uniform vec3 uCam;
  varying vec3 vWorld;

  float h2(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float vnoise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(h2(i), h2(i + vec2(1, 0)), u.x), mix(h2(i + vec2(0, 1)), h2(i + vec2(1, 1)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float s = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) { s += vnoise(p) * a; p *= 2.07; a *= 0.5; }
    return s;
  }

  void main() {
    vec2 p = vWorld.xz * 0.11 + vec2(uTime * 0.012, uTime * 0.005);
    float n = fbm(p + fbm(p * 0.5) * 0.8);
    float a = smoothstep(0.3, 0.62, n) * uOpacity;
    float dist = length(vWorld.xz - uCam.xz);
    a *= smoothstep(70.0, 25.0, dist);
    vec3 col = mix(uShade, uColor, smoothstep(0.45, 0.85, n));
    gl_FragColor = vec4(col, a);  }
`;

export const snowVert = /* glsl */ `
  attribute vec4 aSeed;
  uniform float uTime;
  uniform vec3 uCam;
  uniform float uWind;
  uniform float uCount;
  uniform float uPixel;
  varying float vAlpha;
  const vec3 BOX = vec3(9.0, 7.0, 9.0);
  void main() {
    vec3 p = aSeed.xyz * BOX;
    p.y -= uTime * (0.35 + aSeed.w * 0.5);
    p.x += uTime * uWind * (0.6 + aSeed.w);
    p.z += sin(uTime * 0.7 + aSeed.w * 20.0) * 0.2;
    vec3 rel = mod(p - uCam + BOX * 0.5, BOX) - BOX * 0.5;
    vec3 world = uCam + rel;
    vec4 mv = modelViewMatrix * vec4(world, 1.0);
    gl_Position = projectionMatrix * mv;
    float visible = step(aSeed.w, uCount);
    gl_PointSize = visible * uPixel * (0.6 + aSeed.w * 1.3) * (6.0 / max(0.4, -mv.z));
    vAlpha = visible * smoothstep(4.5, 0.6, length(rel));
  }
`;

export const snowFrag = /* glsl */ `
  varying float vAlpha;
  uniform vec3 uTint;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    float a = smoothstep(0.5, 0.1, d) * vAlpha;
    gl_FragColor = vec4(uTint, a);
  }
`;

export const streakVert = /* glsl */ `
  attribute vec4 aSeed;
  attribute float aEnd;
  uniform float uTime;
  uniform vec3 uCam;
  varying float vA;
  const vec3 BOX = vec3(10.0, 5.0, 10.0);
  void main() {
    vec3 p = aSeed.xyz * BOX;
    p.x += uTime * (3.5 + aSeed.w * 3.0) + aEnd * (0.35 + aSeed.w * 0.5);
    p.y += sin(uTime + aSeed.w * 30.0) * 0.1;
    vec3 rel = mod(p - uCam + BOX * 0.5, BOX) - BOX * 0.5;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(uCam + rel, 1.0);
    vA = (1.0 - aEnd) * smoothstep(5.0, 1.0, length(rel));
  }
`;

export const streakFrag = /* glsl */ `
  uniform float uOpacity;
  varying float vA;
  void main() { gl_FragColor = vec4(0.97, 0.94, 0.88, vA * uOpacity); }
`;

export const routeVert = /* glsl */ `
  varying float vU;
  void main() {
    vU = uv.x;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const routeFrag = /* glsl */ `
  uniform float uProgress;
  uniform float uTime;
  varying float vU;
  void main() {
    float done = step(vU, uProgress);
    float dash = step(0.5, fract(vU * 180.0 - uTime * 0.6));
    vec3 brass = vec3(0.93, 0.8, 0.52);
    float a = mix(0.18 * dash, 0.95, done);
    float head = smoothstep(0.012, 0.0, abs(vU - uProgress));
    gl_FragColor = vec4(brass + head * 0.6, a + head);  }
`;
