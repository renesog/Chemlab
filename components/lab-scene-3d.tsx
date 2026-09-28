"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Maximize2, Minus, Plus, RotateCcw } from "lucide-react";
import { labToolKind, type LabToolKind } from "@/lib/lab-equipment";

type Equipment = { id: string; label: string };
type Props = { equipment: Equipment[]; selected: string[]; focusedId: string|null; onInspect: (id: string) => void; busy?: boolean };
type Runtime = { selection: (ids: string[]) => void; focus: (id:string|null) => void; reset: () => void; zoom: (factor: number) => void; top: () => void };

function release(root: THREE.Object3D) {
  root.traverse(object => {
    const mesh = object as THREE.Mesh;
    mesh.geometry?.dispose();
    const materials = mesh.material ? (Array.isArray(mesh.material) ? mesh.material : [mesh.material]) : [];
    for (const material of materials) { (material as THREE.MeshBasicMaterial).map?.dispose(); material.dispose(); }
  });
}

function solid(color: number, opacity = 1) {
  return new THREE.MeshStandardMaterial({ color, roughness: .55, metalness: .12, transparent: opacity < 1, opacity, depthWrite: opacity === 1, side: opacity < 1 ? THREE.DoubleSide : THREE.FrontSide });
}

function box(parent: THREE.Object3D, size: number[], position: number[], color: number) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(size[0], size[1], size[2]), solid(color));
  mesh.position.set(position[0], position[1], position[2]); mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
}

function cylinder(parent: THREE.Object3D, top: number, bottom: number, height: number, y: number, color: number, opacity = 1) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(top, bottom, height, 20, 1, opacity < 1), solid(color, opacity));
  mesh.position.y = y; mesh.castShadow = opacity === 1; parent.add(mesh); return mesh;
}

function ring(parent: THREE.Object3D, radius: number, tube: number, y: number, color: number) {
  const mesh = new THREE.Mesh(new THREE.TorusGeometry(radius, tube, 6, 24), solid(color));
  mesh.rotation.x = Math.PI / 2; mesh.position.y = y; parent.add(mesh); return mesh;
}

function beaker(parent: THREE.Object3D, color = 0x12b9c1) {
  cylinder(parent, .3, .3, .62, .33, 0xb2e5f3, .28);
  cylinder(parent, .275, .275, .24, .15, color, .88);
  ring(parent, .3, .018, .64, 0x75aebf);
  for (let i = 0; i < 4; i++) box(parent, [.12, .012, .014], [.12, .23 + i * .09, .3], 0x46717f);
}

function instrument(kind: LabToolKind) {
  const group = new THREE.Group();
  switch (kind) {
    case "magnet":
      box(group, [.16, .6, .2], [-.23, .4, 0], 0xd85055); box(group, [.16, .6, .2], [.23, .4, 0], 0x2878b9);
      box(group, [.62, .16, .2], [0, .1, 0], 0x536d85);
      box(group, [.16, .12, .2], [-.23, .76, 0], 0xdfe7ed); box(group, [.16, .12, .2], [.23, .76, 0], 0xdfe7ed); break;
    case "sieve":
      ring(group, .4, .045, .27, 0xa3b7c4);
      for (let i = -3; i <= 3; i++) {
        const length = Math.sqrt(.15 - (i * .1) ** 2) * 2;
        box(group, [length, .008, .008], [0, .27, i * .1], 0x69838c);
        box(group, [.008, .008, length], [i * .1, .27, 0], 0x69838c);
      }
      box(group, [.45, .045, .09], [.59, .27, 0], 0x597884); break;
    case "funnel":
      beaker(group, 0xf0c569);
      cylinder(group, .37, .055, .42, 1.05, 0xc7eced, .5);
      cylinder(group, .045, .045, .3, .73, 0x88b7c3, .6);
      box(group, [.06, 1.3, .06], [.46, .65, 0], 0x617b8c);
      box(group, [.8, .05, .5], [.15, .025, 0], 0x536a7b); break;
    case "burner":
      cylinder(group, .23, .3, .13, .08, 0x243e55);
      cylinder(group, .08, .1, .5, .39, 0x9eafbc);
      cylinder(group, .12, .12, .07, .67, 0x314a61);
      // No flame until the submitted experiment is being processed.
      box(group, [.23, .06, .09], [.2, .16, 0], 0x19a4b0); break;
    case "water":
      cylinder(group, .25, .28, .62, .33, 0x51c4d2, .8);
      cylinder(group, .13, .13, .17, .72, 0xf3f8fa);
      box(group, [.08, .34, .08], [.1, .95, 0], 0xebf6f9);
      box(group, [.32, .065, .065], [.23, 1.1, 0], 0xebf6f9); break;
    case "dish":
      cylinder(group, .4, .32, .12, .09, 0xf0eae1); ring(group, .4, .035, .16, 0xc8d7df); break;
    case "stir": {
      beaker(group);
      const rod = box(group, [.035, .95, .035], [.07, .62, 0], 0xa8c5d2); rod.rotation.z = -.22; break;
    }
    default: beaker(group);
  }
  return group;
}

function label(parent: THREE.Object3D, text: string, x: number, y: number, z: number, width = 1) {
  const canvas = document.createElement("canvas"); canvas.width = 384; canvas.height = 96;
  const context = canvas.getContext("2d"); if (!context) return;
  context.fillStyle = "#102d43"; context.fillRect(0, 0, 384, 96);
  context.fillStyle = "#fff"; context.font = "bold 30px sans-serif"; context.textAlign = "center"; context.textBaseline = "middle";
  context.fillText(text, 192, 48, 360);
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, depthTest: false }));
  sprite.position.set(x, y, z); sprite.scale.set(width, width / 4, 1); parent.add(sprite);
}

export default function LabScene3D({ equipment, selected, focusedId, onInspect, busy = false }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const runtime = useRef<Runtime | null>(null);
  const onInspectRef = useRef(onInspect);
  const focusedRef = useRef(focusedId);
  const selectedRef = useRef(selected);
  const busyRef = useRef(busy);
  const [unavailable, setUnavailable] = useState(false);
  const [message, setMessage] = useState("แตะอุปกรณ์เพื่อดูรายละเอียด แล้วเพิ่มลงถาดทดลอง");
  const equipmentKey = JSON.stringify(equipment);
  useEffect(() => { onInspectRef.current = onInspect; busyRef.current = busy; }, [onInspect, busy]);
  useEffect(() => { selectedRef.current = selected; runtime.current?.selection(selected); }, [selected]);
  useEffect(() => { focusedRef.current = focusedId; runtime.current?.focus(focusedId); }, [focusedId]);

  useEffect(() => {
    const container = host.current; if (!container) return;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: window.devicePixelRatio < 2, powerPreference: "low-power" }); }
    catch {
      // WebGL support is known only after initializing this external browser resource.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUnavailable(true);
      return;
    }
    const items = JSON.parse(equipmentKey) as Equipment[];
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.shadowMap.enabled = window.innerWidth > 650; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.setAttribute("aria-label", "ห้องแล็บสามมิติ ลากเพื่อหมุนมุมมอง เลือกอุปกรณ์ได้จากรายการด้านล่างด้วย");
    container.appendChild(renderer.domElement);
    const scene = new THREE.Scene(); scene.background = new THREE.Color(0xdcebf0);
    const camera = new THREE.PerspectiveCamera(43, 1, .1, 70);
    camera.position.set(5, 7, 10);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1.1, -.3); controls.enablePan = false; controls.enableZoom = false;
    controls.minDistance = 6; controls.maxDistance = 20; controls.minPolarAngle = .18; controls.maxPolarAngle = Math.PI / 2.15;
    controls.minAzimuthAngle = -Math.PI / 2.3; controls.maxAzimuthAngle = Math.PI / 2.3;
    controls.update(); controls.saveState();
    scene.add(new THREE.HemisphereLight(0xf1fbff, 0x6b8892, 2.5));
    const light = new THREE.DirectionalLight(0xfff3df, 3); light.position.set(3, 9, 5); light.castShadow = true;
    light.shadow.mapSize.set(512, 512); light.shadow.camera.left = -7; light.shadow.camera.right = 7; light.shadow.camera.top = 6; light.shadow.camera.bottom = -6; light.shadow.normalBias = .04; scene.add(light);
    box(scene, [11, .16, 8.5], [0, -.12, 0], 0xc4d7de);
    const grid = new THREE.GridHelper(10, 20, 0xa6bec8, 0xb6cdd5); grid.position.y = -.03; scene.add(grid);
    box(scene, [11, 4.5, .16], [0, 2.15, -4], 0xeaf2f3);
    box(scene, [.16, 4.5, 8.5], [-5.4, 2.15, 0], 0xdce8eb);
    box(scene, [11, .18, .12], [0, .25, -3.88], 0x1c8d9e);
    // Windows, storage cabinets and a rear equipment counter.
    box(scene, [3.2, 1.7, .08], [-2.7, 2.75, -3.86], 0x7497a8);
    for (const x of [-3.45, -1.95]) box(scene, [1.38, 1.5, .08], [x, 2.75, -3.79], 0xc4edf5);
    box(scene, [2.5, 1.7, .12], [2.8, 2.75, -3.8], 0x173a50);
    label(scene, "CHEMCLASS / LAB", 2.8, 2.9, -3.65, 2.1);
    box(scene, [9, 1.05, 1.1], [0, .54, -2.8], 0x91b6c3);
    box(scene, [9.25, .12, 1.3], [0, 1.12, -2.8], 0x24465a);
    for (let x = -4; x <= 4; x++) { box(scene, [.85, .77, .03], [x, .6, -2.23], 0xd8e6e9); box(scene, [.24, .035, .055], [x, .85, -2.19], 0x466a80); }
    // Main bench with open leg room and stools.
    box(scene, [8.3, .2, 3.3], [0, 1.45, .6], 0x28485b);
    box(scene, [8.3, .06, 3.3], [0, 1.58, .6], 0xe5eceb);
    for (const x of [-3.5, 3.5]) for (const z of [-.65, 1.8]) box(scene, [.16, 1.4, .16], [x, .7, z], 0x426577);
    for (const x of [-2.7, 2.7]) { const stool = new THREE.Group(); cylinder(stool, .4, .4, .15, .8, 0x1398a7); cylinder(stool, .06, .08, .7, .38, 0x7593a2); cylinder(stool, .35, .35, .08, .05, 0x506e80); stool.position.set(x, 0, 3); scene.add(stool); }
    const sample = new THREE.Group(); beaker(sample, 0xd9a34d); sample.scale.setScalar(1.35); sample.position.set(-3, 1.62, .5); scene.add(sample);
    label(scene, "สารผสม", -3, 2.85, .5, 1.15);
    const shelf = new THREE.Group(); scene.add(shelf);
    items.forEach((item, index) => {
      const model = instrument(labToolKind(item.id, item.label)); model.scale.setScalar(.88);
      model.position.set(-3.85 + index * (7.7 / Math.max(1, items.length - 1)), 1.19, -2.7);
      model.userData.equipmentId = item.id; shelf.add(model);
      // Invisible hit area makes thin tools and touch targets easier to select.
      const hotspot=new THREE.Mesh(new THREE.BoxGeometry(.95,1.5,.85),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));
      hotspot.position.y=.7; model.add(hotspot);
      label(model, `${index + 1}`, 0, 1.65, 0, .55);
    });
    const placed = new THREE.Group(); scene.add(placed);
    let stopped = false;
    let visible = true;
    let frame = 0;
    let lastFrame = 0;
    const render = () => { if (!stopped && visible && !document.hidden) renderer.render(scene, camera); };
    let hoveredId:string|null=null;
    const highlight=()=>{
      for(const model of [...shelf.children,...placed.children]){
        const id=model.userData.equipmentId as string;
        const active=id===focusedRef.current||id===hoveredId;
        model.traverse(object=>{
          if(!(object instanceof THREE.Mesh)||!(object.material instanceof THREE.MeshStandardMaterial))return;
          object.material.emissive.setHex(active?0x087e89:selectedRef.current.includes(id)?0x154637:0x000000);
          object.material.emissiveIntensity=active?.65:.3;
        });
      }
      render();
    };
    const selection = (ids: string[]) => {
      release(placed); placed.clear();
      ids.forEach((id, index) => {
        const item = items.find(item => item.id === id); if (!item) return;
        const model = instrument(labToolKind(item.id, item.label)); model.scale.setScalar(.73);
        model.position.set(-1.65 + (index % 5) * 1.04, 1.62, index < 5 ? -.25 : 1.25); model.userData.equipmentId=id; placed.add(model);
        label(model, `${index + 1}`, 0, 1.65, 0, .48);
      }); highlight();
    };
    runtime.current = { selection, focus:()=>highlight(), reset: () => { controls.reset(); render(); }, zoom: factor => { const offset = camera.position.clone().sub(controls.target); offset.setLength(THREE.MathUtils.clamp(offset.length() * factor, 6, 20)); camera.position.copy(controls.target).add(offset); controls.update(); render(); }, top: () => { camera.position.set(0, 13, 3); controls.update(); render(); } };
    selection(selectedRef.current);
    controls.addEventListener("change", render);
    const resize = () => { const { width, height } = container.getBoundingClientRect(); renderer.setSize(Math.max(1, width), Math.max(1, height)); camera.aspect = Math.max(1, width) / Math.max(1, height); camera.updateProjectionMatrix(); render(); };
    const observer = new ResizeObserver(resize); observer.observe(container); resize();
    const visibility = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; render(); }); visibility.observe(container);
    document.addEventListener("visibilitychange", render);
    const pointer = new THREE.Vector2(); const raycaster = new THREE.Raycaster(); let down = { x: 0, y: 0 };
    const pointerDown = (event: PointerEvent) => { down = { x: event.clientX, y: event.clientY }; };
    const hitId = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect(); pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
      raycaster.setFromCamera(pointer, camera);
      let hit: THREE.Object3D | null = raycaster.intersectObjects([...shelf.children,...placed.children], true)[0]?.object ?? null;
      while (hit && !hit.userData.equipmentId) hit = hit.parent;
      return hit?.userData.equipmentId as string | undefined;
    };
    const pointerUp = (event: PointerEvent) => {
      if (busyRef.current || Math.hypot(event.clientX - down.x, event.clientY - down.y) > 6) return;
      const id=hitId(event);
      if(id){onInspectRef.current(id);setMessage(`เลือก ${items.find(item=>item.id===id)!.label} · ดูรายละเอียดในแผงอุปกรณ์`);}
    };
    const pointerMove=(event:PointerEvent)=>{
      if(event.buttons||busyRef.current)return;
      const id=hitId(event)??null;
      if(id===hoveredId)return;
      hoveredId=id;highlight();renderer.domElement.style.cursor=id?"pointer":"grab";
      renderer.domElement.title=id?items.find(item=>item.id===id)!.label:"ลากเพื่อหมุนมุมมอง";
      setMessage(id?items.find(item=>item.id===id)!.label:"แตะอุปกรณ์เพื่อดูรายละเอียด แล้วเพิ่มลงถาดทดลอง");
    };
    const pointerLeave=()=>{hoveredId=null;highlight();};
    const contextLost = (event: Event) => { event.preventDefault(); setUnavailable(true); };
    renderer.domElement.addEventListener("pointerdown", pointerDown); renderer.domElement.addEventListener("pointerup", pointerUp); renderer.domElement.addEventListener("webglcontextlost", contextLost);
    renderer.domElement.addEventListener("pointermove",pointerMove);renderer.domElement.addEventListener("pointerleave",pointerLeave);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const animate = (time: number) => { if (stopped) return; frame = requestAnimationFrame(animate); if (time - lastFrame < 50 || !visible || document.hidden) return; lastFrame = time; if (busyRef.current && !reducedMotion) { sample.rotation.z = Math.sin(time * .006) * .025; render(); } else if (sample.rotation.z !== 0) { sample.rotation.z = 0; render(); } };
    frame = requestAnimationFrame(animate);
    return () => { stopped = true; cancelAnimationFrame(frame); runtime.current = null; observer.disconnect(); visibility.disconnect(); document.removeEventListener("visibilitychange", render); controls.dispose(); renderer.domElement.removeEventListener("pointerdown", pointerDown); renderer.domElement.removeEventListener("pointerup", pointerUp); renderer.domElement.removeEventListener("pointermove",pointerMove);renderer.domElement.removeEventListener("pointerleave",pointerLeave); renderer.domElement.removeEventListener("webglcontextlost", contextLost); release(scene); renderer.dispose(); renderer.domElement.remove(); };
  }, [equipmentKey]);

  return <section className="virtual-lab" aria-label="ห้องแล็บเสมือนสามมิติ">
    <div className="virtual-lab-heading"><div><span className="lab-3d-badge">3D LAB</span><h2>โต๊ะทดลองของฉัน</h2></div><span>ลากเพื่อหมุน · ใช้ปุ่ม + / − เพื่อซูม</span></div>
    <div className="virtual-lab-viewport" ref={host} />
    {unavailable && <div className="virtual-lab-fallback" role="status">อุปกรณ์นี้เปิดภาพ 3 มิติไม่ได้ ยังเลือกอุปกรณ์และเรียงขั้นตอนจากรายการด้านล่างได้ตามปกติ</div>}
    <div className="virtual-lab-toolbar"><p role="status">{message}</p><div><button type="button" onClick={() => runtime.current?.zoom(.85)} aria-label="ซูมเข้า" disabled={unavailable}><Plus size={18}/></button><button type="button" onClick={() => runtime.current?.zoom(1.18)} aria-label="ซูมออก" disabled={unavailable}><Minus size={18}/></button><button type="button" onClick={() => runtime.current?.top()} aria-label="มองโต๊ะจากด้านบน" disabled={unavailable}><Maximize2 size={18}/></button><button type="button" onClick={() => runtime.current?.reset()} aria-label="คืนมุมมองเริ่มต้น" disabled={unavailable}><RotateCcw size={18}/></button></div></div>
    <p className="virtual-lab-note">ภาพแสดงการจัดอุปกรณ์ตามแผนของคุณ กด “ทดลองแยกสาร” เพื่อตรวจคำตอบ</p>
  </section>;
}
