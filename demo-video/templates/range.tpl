<template>
  <style>
@@COMMON@@
  </style>
  <div data-hf-id="hf-jdt8" id="root" data-composition-id="range" data-width="1920" data-height="1080">
    <div data-hf-id="hf-trmo" class="cam" id="rg-cam-a" style="z-index:1"><video data-hf-id="hf-njgh" id="rg-a" class="clip" src="assets/clips/load.mp4" data-start="0" data-duration="2.67" data-media-start="@@load_ms@@" muted playsinline></video></div>
    <div data-hf-id="hf-588w" class="cam" id="rg-cam-b" style="z-index:2"><video data-hf-id="hf-dxx3" id="rg-b" class="clip" data-hf-media-start-basis="local" src="assets/clips/snapback.mp4" data-start="2.67" data-duration="2.66" data-media-start="@@snap_ms@@" muted playsinline></video></div>
    <div data-hf-id="hf-mn2s" class="cam" id="rg-cam-c" style="z-index:3"><video data-hf-id="hf-xy64" id="rg-c" class="clip" data-hf-media-start-basis="local" src="assets/clips/height.mp4" data-start="5.33" data-duration="2.67" data-media-start="@@height_ms@@" muted playsinline></video></div>
    <div data-hf-id="hf-d379" id="rg-ui" class="clip" data-start="0" data-duration="8" style="z-index:4" data-layout-allow-overlap>
      <div data-hf-id="hf-hguo" class="cap" id="rg-cap"><div data-hf-id="hf-5dx0">Three jobs. Eleven calls. <b data-hf-id="hf-yhql">Five replays.</b></div></div>
    </div>
  </div>
  <script>
    const tl = gsap.timeline({ paused: true });
    tl.fromTo("#rg-cam-a", { x: 180 }, { x: 0, duration: 0.25, ease: "power3.out" }, 0);
    tl.set("#rg-cam-b", { x: 0 }, 0); tl.set("#rg-cam-c", { x: 0 }, 0);
    tl.to("#rg-cam-c", { x: -200, duration: 0.2, ease: "power3.in" }, 7.8);
    tl.set("#rg-cap", { opacity: 0 }, 0);
    tl.to("#rg-cap", { opacity: 1, duration: 0.2, ease: "power2.out" }, 0.5);
    tl.to("#rg-cap", { opacity: 0, duration: 0.12, ease: "power2.in" }, 7.65);
    window.__timelines["range"] = tl;
  </script>
</template>
