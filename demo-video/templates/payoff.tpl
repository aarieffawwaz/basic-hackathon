<template>
  <style>
@@COMMON@@
  </style>
  <div data-hf-id="hf-s4vk" id="root" data-composition-id="payoff" data-width="1920" data-height="1080">
    <div data-hf-id="hf-19fg" class="cam" id="py-cam"><video data-hf-id="hf-zhk9" id="py-shot" class="clip" src="assets/clips/end.mp4" data-start="0" data-duration="9" data-media-start="@@pay_ms@@" muted playsinline></video></div>
    <div data-hf-id="hf-lu7p" id="py-ui" class="clip" data-start="0" data-duration="9" data-layout-allow-overlap>
      <div data-hf-id="hf-24mt" class="cap top" id="py-cap"><div data-hf-id="hf-z7c3">The shift report keeps the call you <b data-hf-id="hf-7apv">replayed</b>.</div></div>
    </div>
  </div>
  <script>
    const tl = gsap.timeline({ paused: true });
    tl.fromTo("#py-cam", { x: 180, scale: 1 }, { x: 0, duration: 0.25, ease: "power3.out" }, 0);
    tl.set("#py-cam", { transformOrigin: "@@row_ox@@% @@row_oy@@%" }, 1.99);
    tl.to("#py-cam", { scale: 1.5, duration: 0.55, ease: "power2.inOut" }, 2.0);
    tl.to("#py-cam", { scale: 1, duration: 0.55, ease: "power2.inOut" }, 6.6);
    tl.set("#py-cap", { opacity: 0 }, 0);
    tl.to("#py-cap", { opacity: 1, duration: 0.2, ease: "power2.out" }, 0.6);
    tl.to("#py-cap", { opacity: 0, duration: 0.12, ease: "power2.in" }, 8.6);
    tl.to("#py-cam", { x: -200, duration: 0.2, ease: "power3.in" }, 8.8);
    window.__timelines["payoff"] = tl;
  </script>
</template>
