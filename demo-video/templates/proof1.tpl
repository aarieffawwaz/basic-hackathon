<template>
  <style>
@@COMMON@@
  </style>
  <div data-hf-id="hf-odyq" id="root" data-composition-id="proof1" data-width="1920" data-height="1080">
    <div data-hf-id="hf-gbmu" class="cam" id="p1-cam" style="z-index:1"><video data-hf-id="hf-x19l" id="p1-shot" class="clip" src="assets/clips/roles-walk.mp4" data-start="0" data-duration="@@p1_cut@@" data-media-start="@@p1_ms@@" muted playsinline></video></div>
    <div data-hf-id="hf-bfsj" class="cam" id="p1-cam2" style="z-index:2"><video data-hf-id="hf-80bf" id="p1-shot2" class="clip" data-hf-media-start-basis="local" src="assets/clips/walk.mp4" data-start="@@p1_cut@@" data-duration="@@p1_rest@@" data-media-start="@@walk_ms@@" muted playsinline></video></div>
    <div data-hf-id="hf-0nup" class="dip" id="p1-dip" style="z-index:2"></div>
    <div data-hf-id="hf-9m13" id="p1-ui" class="clip" data-start="0" data-duration="@@T1@@" style="z-index:3" data-layout-allow-overlap>
      @@CURSOR:p1-cur@@
      <div data-hf-id="hf-sb49" class="cap" id="p1-cap1"><div data-hf-id="hf-urzg">Pick a <b data-hf-id="hf-eb98">job</b>.</div></div>
      <div data-hf-id="hf-w98a" class="cap" id="p1-cap2"><div data-hf-id="hf-gxgw">Walk the yard. Follow the <b data-hf-id="hf-992x">beacon</b>.</div></div>
    </div>
  </div>
  <script>
    const tl = gsap.timeline({ paused: true });
    tl.fromTo("#p1-cam", { x: 180, scale: 1 }, { x: 0, duration: 0.25, ease: "power3.out" }, 0);
    // Cursor to "Yard checker".
    tl.set("#p1-cur", { opacity: 0, x: @@r_in_x@@, y: @@r_in_y@@, scale: 1 }, 0);
    tl.to("#p1-cur", { opacity: 1, duration: 0.1 }, 1.4);
    tl.to("#p1-cur", { x: @@r_at_x@@, y: @@r_at_y@@, duration: 0.7, ease: "expo.out" }, 1.4);
    tl.to("#p1-cur", { scale: 0.86, duration: 0.07, ease: "power2.in" }, 2.93);
    tl.to("#p1-cur", { scale: 1, duration: 0.1, ease: "power2.out" }, 3.0);
    tl.to("#p1-cur", { opacity: 0, duration: 0.25, ease: "power2.in" }, 3.3);
    tl.set("#p1-cap1", { opacity: 0 }, 0);
    tl.to("#p1-cap1", { opacity: 1, duration: 0.2, ease: "power2.out" }, 0.6);
    tl.to("#p1-cap1", { opacity: 0, duration: 0.12, ease: "power2.in" }, 2.9);
    // Hard cut into the walk (same yard, a few metres on), a punch onto the mission panel, then back out.
    tl.fromTo("#p1-cam2", { scale: 1.06, x: 0 }, { scale: 1, duration: 0.5, ease: "power2.out" }, @@p1_cut@@);
    tl.set("#p1-cap2", { opacity: 0 }, 0);
    tl.to("#p1-cap2", { opacity: 1, duration: 0.2, ease: "power2.out" }, @@p1_cut@@ + 0.5);
    tl.to("#p1-cap2", { opacity: 0, duration: 0.12, ease: "power2.in" }, @@p1_card@@ - 0.2);
    tl.set("#p1-cam2", { transformOrigin: "0% 0%" }, @@p1_punch@@ - 0.01);
    tl.to("#p1-cam2", { scale: 1.35, duration: 0.5, ease: "power2.inOut" }, @@p1_punch@@);
    tl.to("#p1-cam2", { scale: 1, duration: 0.5, ease: "power2.inOut" }, @@p1_punch@@ + 1.4);
    tl.to("#p1-cam2", { x: -200, duration: 0.2, ease: "power3.in" }, @@T1@@ - 0.2);
    tl.to("#p1-dip", { opacity: 0.4, duration: 0.1, ease: "none" }, @@T1@@ - 0.1);
    window.__timelines["proof1"] = tl;
  </script>
</template>
