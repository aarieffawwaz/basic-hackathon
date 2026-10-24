<template>
  <style>
@@COMMON@@
    #cl-t1 { top: 400px; }
    #cl-t2 { position: absolute; left: 120px; top: 760px; font-weight: 700; font-size: 60px; letter-spacing: -0.015em; line-height: 1.1; color: #f5f7fa; }
    #cl-t2 .w { display: inline-block; margin-right: 0.26em; }
  </style>
  <div data-hf-id="hf-dc55" id="root" data-composition-id="claim" data-width="1920" data-height="1080">
    <div data-hf-id="hf-qrd8" class="cam" id="cl-cam"><video data-hf-id="hf-5btv" id="cl-shot" class="clip" src="assets/clips/landing.mp4" data-start="0" data-duration="7" data-media-start="@@claim_ms@@" muted playsinline></video></div>
      <div data-hf-id="hf-f59o" class="dip" id="cl-dip"></div>
    <div data-hf-id="hf-nzjv" id="cl-ui" class="clip" data-start="0" data-duration="7" data-layout-allow-overlap>
      <div data-hf-id="hf-gfcn" class="title boxed" id="cl-t1"><span data-hf-id="hf-smev" class="ln"><span data-hf-id="hf-ys6r" class="w">The</span><span data-hf-id="hf-2l7w" class="w acc">replay</span></span><span data-hf-id="hf-oupj" class="ln"><span data-hf-id="hf-fj2o" class="w">is</span><span data-hf-id="hf-9o0j" class="w">the</span><span data-hf-id="hf-l1bq" class="w">lesson.</span></span></div>
      <div data-hf-id="hf-gpdv" class="boxed" id="cl-t2"><span data-hf-id="hf-0tsn" class="w">No</span><span data-hf-id="hf-k3zg" class="w">headset.</span><span data-hf-id="hf-gpnb" class="w">No</span><span data-hf-id="hf-3yaz" class="w">account.</span><span data-hf-id="hf-gbca" class="w">No</span><span data-hf-id="hf-161j" class="w">server.</span></div>
    </div>
  </div>
  <script>
    const tl = gsap.timeline({ paused: true });
    tl.fromTo("#cl-cam", { x: 180 }, { x: 0, duration: 0.25, ease: "power3.out" }, 0);
    tl.set("#cl-t1, #cl-t2", { opacity: 0 }, 0);
    tl.to("#cl-t1", { opacity: 1, duration: 0.15, ease: "power2.out" }, 0.25);
    tl.to("#cl-t2", { opacity: 1, duration: 0.15, ease: "power2.out" }, 3.05);
    tl.set("#cl-t1 .w", { opacity: 0, filter: "blur(6px)" }, 0);
    tl.to("#cl-t1 .w", { opacity: 1, filter: "blur(0px)", duration: 0.13, stagger: 0.067, ease: "power2.out" }, 0.5);
    tl.set("#cl-t2 .w", { opacity: 0, filter: "blur(6px)" }, 0);
    tl.to("#cl-t2 .w", { opacity: 1, filter: "blur(0px)", duration: 0.13, stagger: 0.067, ease: "power2.out" }, 3.3);
    // Dip to the end card: darken 40% over three frames, then the cut.
    tl.to("#cl-dip", { opacity: 0.4, duration: 0.1, ease: "none" }, 6.9);
    window.__timelines["claim"] = tl;
  </script>
</template>
