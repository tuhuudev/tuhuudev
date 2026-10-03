import * as THREE from 'three';
import { simplexNoise } from './noise.js';
import { createLabel } from './label.js';

// Every builder returns { group, update(time, ctx) } — `ctx` carries pointer + hover state.

export function createStarfield(count = 2200) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const palette = [new THREE.Color('#8b7bff'), new THREE.Color('#4fd1ff'), new THREE.Color('#ffffff')];
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 50;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
    positions[i * 3 + 2] = -Math.random() * 30 + 2;
    const c = palette[i % palette.length];
    colors.set([c.r, c.g, c.b], i * 3);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const material = new THREE.PointsMaterial({
    size: 0.05,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const points = new THREE.Points(geometry, material);
  return {
    group: points,
    update(t) {
      points.rotation.z = t * 0.01;
    },
  };
}

// Hero: a noise-displaced energy core wrapped in a wireframe shell.
export function createCore() {
  const group = new THREE.Group();

  const uniforms = {
    uTime: { value: 0 },
    uIntensity: { value: 0.35 },
    uColorA: { value: new THREE.Color('#5b3cff') },
    uColorB: { value: new THREE.Color('#4fd1ff') },
  };
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform float uIntensity;
      varying float vNoise;
      varying vec3 vNormal;
      varying vec3 vView;
      ${simplexNoise}
      void main() {
        float n = snoise(position * 0.9 + vec3(uTime * 0.25));
        n += 0.5 * snoise(position * 2.2 - vec3(uTime * 0.4));
        vNoise = n;
        vec3 displaced = position + normal * n * uIntensity;
        vec4 mv = modelViewMatrix * vec4(displaced, 1.0);
        vNormal = normalize(normalMatrix * normal);
        vView = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColorA;
      uniform vec3 uColorB;
      varying float vNoise;
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        float fresnel = pow(1.0 - max(dot(vNormal, vView), 0.0), 2.5);
        vec3 col = mix(uColorA, uColorB, smoothstep(-0.6, 0.9, vNoise));
        col = col * 0.6 + fresnel * vec3(0.55, 0.6, 0.8);
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(1.6, 64), material);
  group.add(core);

  const shell = new THREE.Mesh(
    new THREE.IcosahedronGeometry(2.5, 1),
    new THREE.MeshBasicMaterial({ color: '#8b7bff', wireframe: true, transparent: true, opacity: 0.22 })
  );
  group.add(shell);

  // Orbiting dust ring
  const ringCount = 600;
  const ringPos = new Float32Array(ringCount * 3);
  for (let i = 0; i < ringCount; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = 3 + Math.random() * 0.9;
    ringPos.set([Math.cos(a) * r, (Math.random() - 0.5) * 0.15, Math.sin(a) * r], i * 3);
  }
  const ringGeo = new THREE.BufferGeometry();
  ringGeo.setAttribute('position', new THREE.BufferAttribute(ringPos, 3));
  const ring = new THREE.Points(
    ringGeo,
    new THREE.PointsMaterial({
      color: '#4fd1ff',
      size: 0.04,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  ring.rotation.x = 0.45;
  ring.rotation.z = -0.2;
  group.add(ring);

  return {
    group,
    update(t, ctx) {
      uniforms.uTime.value = t;
      const target = 0.35 + ctx.pointerSpeed * 0.6;
      uniforms.uIntensity.value += (target - uniforms.uIntensity.value) * 0.05;
      core.rotation.y = t * 0.15;
      shell.rotation.y = -t * 0.1;
      shell.rotation.x = t * 0.07;
      ring.rotation.y = t * 0.12;
      group.rotation.x += (ctx.pointer.y * 0.25 - group.rotation.x) * 0.05;
      group.rotation.y += (ctx.pointer.x * 0.35 - group.rotation.y) * 0.05;
    },
  };
}

// Skills: labels on a Fibonacci sphere, colored by group. Hoverable.
export function createSkillCloud(skills) {
  const group = new THREE.Group();
  const cloud = new THREE.Group();
  group.add(cloud);

  const items = skills.flatMap((s) => s.items.map((name) => ({ name, group: s.group, color: s.color })));
  const radius = 2.5;
  const golden = Math.PI * (3 - Math.sqrt(5));
  const labels = items.map((item, i) => {
    const y = 1 - (i / (items.length - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = golden * i;
    const label = createLabel(item.name, { color: item.color, height: 0.36 });
    label.position.set(Math.cos(theta) * r * radius, y * radius, Math.sin(theta) * r * radius);
    label.userData.info = item;
    cloud.add(label);
    return label;
  });

  const inner = new THREE.Mesh(
    new THREE.SphereGeometry(radius * 0.92, 24, 16),
    new THREE.MeshBasicMaterial({ color: '#4fd1ff', wireframe: true, transparent: true, opacity: 0.06 })
  );
  cloud.add(inner);

  const tmpScale = new THREE.Vector3();
  const tmpPos = new THREE.Vector3();
  return {
    group,
    hoverables: labels,
    update(t, ctx) {
      cloud.rotation.y = t * 0.12 + ctx.pointer.x * 0.6;
      cloud.rotation.x = ctx.pointer.y * 0.3;
      cloud.updateMatrix();
      for (const label of labels) {
        const hovered = ctx.hovered === label;
        const k = hovered ? 1.45 : 1;
        label.scale.lerp(tmpScale.copy(label.userData.baseScale).multiplyScalar(k), 0.15);
        // Fade labels on the far side of the sphere so the front reads clearly.
        const z = tmpPos.copy(label.position).applyMatrix4(cloud.matrix).z / radius;
        const depth = 0.25 + 0.75 * (z + 1) * 0.5;
        label.material.opacity = hovered ? 1 : ctx.hovered ? depth * 0.5 : depth;
      }
    },
  };
}

// Experience: each domain is a moon orbiting a central star on its own tilted ring.
export function createOrbits(experience) {
  const group = new THREE.Group();

  const star = new THREE.Mesh(
    new THREE.SphereGeometry(0.45, 32, 32),
    new THREE.MeshBasicMaterial({ color: '#ffffff' })
  );
  group.add(star);
  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(0.7, 32, 32),
    new THREE.MeshBasicMaterial({ color: '#8b7bff', transparent: true, opacity: 0.25 })
  );
  group.add(halo);

  const moons = experience.map((exp, i) => {
    const radius = 1.2 + i * 0.65;
    const pivot = new THREE.Group();
    pivot.rotation.x = 1.1 + i * 0.12;
    pivot.rotation.y = i * 0.5;
    group.add(pivot);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(radius, 0.008, 8, 160),
      new THREE.MeshBasicMaterial({ color: exp.color, transparent: true, opacity: 0.5 })
    );
    pivot.add(ring);

    const moon = new THREE.Mesh(
      new THREE.SphereGeometry(exp.current ? 0.16 : 0.11, 24, 24),
      new THREE.MeshBasicMaterial({ color: exp.color })
    );
    pivot.add(moon);

    const label = createLabel(exp.domain, { color: exp.color, height: 0.28 });
    group.add(label);

    return { moon, label, pivot, radius, speed: 0.35 / (1 + i * 0.5), offset: i * 1.7 };
  });

  const tmp = new THREE.Vector3();
  return {
    group,
    update(t, ctx) {
      halo.scale.setScalar(1 + Math.sin(t * 2) * 0.08);
      for (const m of moons) {
        const a = t * m.speed + m.offset;
        m.moon.position.set(Math.cos(a) * m.radius, Math.sin(a) * m.radius, 0);
        m.moon.getWorldPosition(tmp);
        group.worldToLocal(tmp);
        m.label.position.copy(tmp);
        m.label.position.y += 0.3;
      }
      group.rotation.y += (ctx.pointer.x * 0.4 - group.rotation.y) * 0.04;
      group.rotation.x += (-ctx.pointer.y * 0.2 + 0.15 - group.rotation.x) * 0.04;
    },
  };
}

// Projects: one floating polyhedron per project.
export function createProjectShapes(projects) {
  const group = new THREE.Group();
  const geometries = [
    new THREE.OctahedronGeometry(0.6),
    new THREE.BoxGeometry(0.85, 0.85, 0.85),
    new THREE.DodecahedronGeometry(0.6),
    new THREE.TetrahedronGeometry(0.75),
  ];
  const colors = ['#8b7bff', '#5cffb1', '#4fd1ff', '#ffcf5c'];

  const shapes = projects.map((p, i) => {
    const holder = new THREE.Group();
    const col = i % 2;
    const row = Math.floor(i / 2);
    holder.position.set(col === 0 ? -1.2 : 1.2, row === 0 ? 1.1 : -1.1, 0);
    group.add(holder);

    const geo = geometries[i % geometries.length];
    const color = colors[i % colors.length];
    const solid = new THREE.Mesh(
      geo,
      new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.25,
        roughness: 0.3,
        metalness: 0.4,
        flatShading: true,
      })
    );
    const wire = new THREE.Mesh(
      geo,
      new THREE.MeshBasicMaterial({ color: '#ffffff', wireframe: true, transparent: true, opacity: 0.25 })
    );
    wire.scale.setScalar(1.25);
    holder.add(solid, wire);

    const label = createLabel(p.name, { color, height: 0.26 });
    label.position.y = -0.9;
    holder.add(label);

    return { holder, solid, wire, phase: i * 1.3 };
  });

  return {
    group,
    update(t, ctx) {
      for (const s of shapes) {
        s.solid.rotation.x = t * 0.4 + s.phase;
        s.solid.rotation.y = t * 0.6 + s.phase;
        s.wire.rotation.copy(s.solid.rotation);
        s.holder.position.z = Math.sin(t + s.phase) * 0.3;
      }
      group.rotation.y += (ctx.pointer.x * 0.3 - group.rotation.y) * 0.05;
      group.rotation.x += (-ctx.pointer.y * 0.2 - group.rotation.x) * 0.05;
    },
  };
}

// Contact: a torus knot of glowing points.
export function createKnot() {
  const geometry = new THREE.TorusKnotGeometry(1.6, 0.45, 260, 24, 2, 3);
  const points = new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      color: '#8b7bff',
      size: 0.03,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  const group = new THREE.Group();
  group.add(points);
  return {
    group,
    update(t, ctx) {
      points.rotation.x = t * 0.2;
      points.rotation.y = t * 0.3 + ctx.pointer.x * 0.5;
      points.material.color.setHSL(0.7 + Math.sin(t * 0.3) * 0.07, 0.85, 0.5);
    },
  };
}
