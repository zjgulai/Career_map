// Selective Bloom Post-Processing (EffectComposer + UnrealBloomPass, clean ES Module for Three.js r169)
// 僅用半分辨率 Gaussian + Additive Combine 共 5 次全屏 Quad Draw Call，支持 bloomEnabled 开关与亮度阈值过滤。
import * as THREE from './three.module.min.js';

const FULLSCREEN_VERT = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

export function createSelectiveBloom(renderer, scene, camera, opts = {}) {
  let threshold = opts.threshold ?? 0.68;
  let strength = opts.strength ?? 0.72;
  let radius = opts.radius ?? 0.55;
  let enabled = opts.enabled ?? true;

  const rtOpts = {
    type: THREE.HalfFloatType,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
  };
  const baseRT = new THREE.WebGLRenderTarget(1, 1, { ...rtOpts, samples: 2 });
  const brightRT = new THREE.WebGLRenderTarget(1, 1, rtOpts);
  const blurRT1 = new THREE.WebGLRenderTarget(1, 1, rtOpts);
  const blurRT2 = new THREE.WebGLRenderTarget(1, 1, rtOpts);

  const fsGeo = new THREE.PlaneGeometry(2, 2);
  const fsCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const brightMat = new THREE.ShaderMaterial({
    uniforms: {
      tDiffuse: { value: null },
      uThreshold: { value: threshold },
      uSmoothWidth: { value: 0.14 },
    },
    vertexShader: FULLSCREEN_VERT,
    fragmentShader: `
      uniform sampler2D tDiffuse;
      uniform float uThreshold;
      uniform float uSmoothWidth;
      varying vec2 vUv;
      void main() {
        vec4 texel = texture2D(tDiffuse, vUv);
        float luma = dot(texel.rgb, vec3(0.299, 0.587, 0.114));
        float knee = smoothstep(uThreshold, uThreshold + uSmoothWidth, luma);
        gl_FragColor = vec4(texel.rgb * knee, 1.0);
      }
    `,
    depthTest: false,
    depthWrite: false,
  });

  const blurMat = new THREE.ShaderMaterial({
    uniforms: {
      tDiffuse: { value: null },
      uDirection: { value: new THREE.Vector2(1, 0) },
      uTexSize: { value: new THREE.Vector2(512, 512) },
      uRadius: { value: radius },
    },
    vertexShader: FULLSCREEN_VERT,
    fragmentShader: `
      uniform sampler2D tDiffuse;
      uniform vec2 uDirection;
      uniform vec2 uTexSize;
      uniform float uRadius;
      varying vec2 vUv;
      void main() {
        vec2 stepUv = (uDirection / uTexSize) * (1.0 + uRadius * 1.6);
        vec3 sum = texture2D(tDiffuse, vUv).rgb * 0.227027;
        sum += texture2D(tDiffuse, vUv + stepUv * 1.384615).rgb * 0.316216;
        sum += texture2D(tDiffuse, vUv - stepUv * 1.384615).rgb * 0.316216;
        sum += texture2D(tDiffuse, vUv + stepUv * 3.230769).rgb * 0.070270;
        sum += texture2D(tDiffuse, vUv - stepUv * 3.230769).rgb * 0.070270;
        gl_FragColor = vec4(sum, 1.0);
      }
    `,
    depthTest: false,
    depthWrite: false,
  });

  const combineMat = new THREE.ShaderMaterial({
    uniforms: {
      tBase: { value: null },
      tBloom: { value: null },
      uStrength: { value: strength },
    },
    vertexShader: FULLSCREEN_VERT,
    fragmentShader: `
      uniform sampler2D tBase;
      uniform sampler2D tBloom;
      uniform float uStrength;
      varying vec2 vUv;
      void main() {
        vec4 base = texture2D(tBase, vUv);
        vec3 bloom = texture2D(tBloom, vUv).rgb;
        gl_FragColor = vec4(base.rgb + bloom * uStrength, base.a);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
    depthTest: false,
    depthWrite: false,
  });

  const quad = new THREE.Mesh(fsGeo, brightMat);
  const quadScene = new THREE.Scene();
  quadScene.add(quad);

  function setSize(w, h, pr = 1) {
    const pw = Math.max(1, Math.floor(w * pr));
    const ph = Math.max(1, Math.floor(h * pr));
    const hw = Math.max(1, Math.floor(pw * 0.5));
    const hh = Math.max(1, Math.floor(ph * 0.5));
    baseRT.setSize(pw, ph);
    brightRT.setSize(hw, hh);
    blurRT1.setSize(hw, hh);
    blurRT2.setSize(hw, hh);
    blurMat.uniforms.uTexSize.value.set(hw, hh);
  }

  function render() {
    if (!enabled) {
      renderer.setRenderTarget(null);
      renderer.render(scene, camera);
      return;
    }
    const prevAutoClear = renderer.autoClear;
    renderer.setRenderTarget(baseRT);
    renderer.clear();
    renderer.render(scene, camera);

    const sceneCalls = renderer.info.render.calls;
    const sceneTris = renderer.info.render.triangles;
    renderer.autoClear = false;

    quad.material = brightMat;
    brightMat.uniforms.tDiffuse.value = baseRT.texture;
    renderer.setRenderTarget(brightRT);
    renderer.clear();
    renderer.render(quadScene, fsCam);

    quad.material = blurMat;
    blurMat.uniforms.tDiffuse.value = brightRT.texture;
    blurMat.uniforms.uDirection.value.set(1, 0);
    renderer.setRenderTarget(blurRT1);
    renderer.clear();
    renderer.render(quadScene, fsCam);

    blurMat.uniforms.tDiffuse.value = blurRT1.texture;
    blurMat.uniforms.uDirection.value.set(0, 1);
    renderer.setRenderTarget(blurRT2);
    renderer.clear();
    renderer.render(quadScene, fsCam);

    quad.material = combineMat;
    combineMat.uniforms.tBase.value = baseRT.texture;
    combineMat.uniforms.tBloom.value = blurRT2.texture;
    renderer.setRenderTarget(null);
    renderer.clear();
    renderer.render(quadScene, fsCam);

    renderer.autoClear = prevAutoClear;
    renderer.info.render.calls = sceneCalls + 4;
    renderer.info.render.triangles = sceneTris + 8;
  }

  function setTheme(mode) {
    if (mode === 'light') {
      brightMat.uniforms.uThreshold.value = 0.88;
      combineMat.uniforms.uStrength.value = 0.26;
    } else {
      brightMat.uniforms.uThreshold.value = threshold;
      combineMat.uniforms.uStrength.value = strength;
    }
  }

  function setEnabled(v) {
    enabled = Boolean(v);
  }

  return {
    render,
    setSize,
    setTheme,
    setEnabled,
    isEnabled: () => enabled,
    getPassCount: () => (enabled ? 4 : 0),
  };
}
