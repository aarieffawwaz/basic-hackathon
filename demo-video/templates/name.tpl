<template>
  <style>
@@COMMON@@
    #nm-panel { position: absolute; left: 120px; top: 140px; padding: 26px 32px 28px; background: rgba(14,17,22,0.92); border: 1px solid rgba(255,255,255,0.12); border-radius: 14px; }
    #nm-lock { display: flex; align-items: center; gap: 22px; }
    #nm-lock img { width: 64px; height: 64px; }
    #nm-lock .word { font-family: "JetBrains Mono", monospace; font-weight: 600; font-size: 60px; letter-spacing: 0; line-height: 1; }
    #nm-line { margin-top: 18px; font-weight: 600; font-size: 40px; color: #c9d1da; letter-spacing: -0.005em; }
    #nm-line .w { display: inline-block; margin-right: 0.24em; }
  </style>
  <div data-hf-id="hf-nbbs" id="root" data-composition-id="name" data-width="1920" data-height="1080">
    <div data-hf-id="hf-faou" class="cam" id="nm-cam"><video data-hf-id="hf-aiir" id="nm-shot" class="clip" src="assets/clips/landing.mp4" data-start="0" data-duration="4" data-media-start="@@name_ms@@" muted playsinline></video></div>
    <div data-hf-id="hf-zuxk" id="nm-ui" class="clip" data-start="0" data-duration="4" data-layout-allow-overlap>
      <div data-hf-id="hf-xw9r" id="nm-panel"><div data-hf-id="hf-ojwe" id="nm-lock"><img data-hf-id="hf-580v" src="assets/brand/logo.svg" alt="" /><div data-hf-id="hf-uvng" class="word">shiftreplay</div></div>
      <div data-hf-id="hf-5xfx" id="nm-line"><span data-hf-id="hf-ufi3" class="w">A</span><span data-hf-id="hf-3w9y" class="w">first</span><span data-hf-id="hf-ty7g" class="w">shift</span><span data-hf-id="hf-gpzr" class="w">in</span><span data-hf-id="hf-9o0j" class="w">the</span><span data-hf-id="hf-mr2i" class="w">browser.</span><span data-hf-id="hf-0tsn" class="w">No</span><span data-hf-id="hf-k3zg" class="w">headset.</span></div></div>
    </div>
  </div>
  <script>
    const tl = gsap.timeline({ paused: true });
    tl.fromTo("#nm-cam", { x: 180 }, { x: 0, duration: 0.25, ease: "power3.out" }, 0);
    tl.fromTo("#nm-panel", { opacity: 0, filter: "blur(8px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.2, ease: "power2.out" }, 0.45);
    tl.fromTo("#nm-line .w", { opacity: 0, filter: "blur(6px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.13, stagger: 0.067, ease: "power2.out" }, 0.75);
    tl.to("#nm-cam", { x: -200, duration: 0.2, ease: "power3.in" }, 3.8);
    tl.to("#nm-ui", { opacity: 0, duration: 0.15, ease: "power2.in" }, 3.8);
    window.__timelines["name"] = tl;
  </script>
</template>
