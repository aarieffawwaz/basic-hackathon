<template>
  <style>
@@COMMON@@
  </style>
  <div data-hf-id="hf-j98z" id="root" data-composition-id="proof2" data-width="1920" data-height="1080">
    <div data-hf-id="hf-t2hj" class="cam" id="p2-cam"><video data-hf-id="hf-sb5y" id="p2-shot" class="clip" src="assets/clips/cross.mp4" data-start="0" data-duration="@@T2@@" data-media-start="@@p2_ms@@" muted playsinline></video></div>
    <div data-hf-id="hf-q5py" id="p2-ui" class="clip" data-start="0" data-duration="@@T2@@" data-layout-allow-overlap>
      @@CURSOR:p2-cur@@
      <div data-hf-id="hf-gk20" class="cap" id="p2-cap1"><div data-hf-id="hf-xgdg">Choose again. The wrong option stays <b data-hf-id="hf-ca5l">struck out</b>.</div></div>
      <div data-hf-id="hf-p7xv" class="cap" id="p2-cap2"><div data-hf-id="hf-ih3r">Then <b data-hf-id="hf-rj1w">do</b> the safe thing.</div></div>
    </div>
  </div>
  <script>
    const tl = gsap.timeline({ paused: true });
    const CLICK = (t, x, y, from) => {
      if (from) { tl.set("#p2-cur", { x: from[0], y: from[1] }, t - 0.9); tl.to("#p2-cur", { opacity: 1, duration: 0.1 }, t - 0.9); tl.to("#p2-cur", { x, y, duration: 0.7, ease: "expo.out", overwrite: "auto" }, t - 0.9); }
      else tl.to("#p2-cur", { x, y, duration: 0.5, ease: "power3.inOut", overwrite: "auto" }, t - 0.6);
      tl.to("#p2-cur", { scale: 0.86, duration: 0.07, ease: "power2.in" }, t - 0.07);
      tl.to("#p2-cur", { scale: 1, duration: 0.1, ease: "power2.out" }, t);
    };
    tl.fromTo("#p2-cam", { x: 180, scale: 1 }, { x: 0, duration: 0.25, ease: "power3.out" }, 0);
    tl.set("#p2-cur", { opacity: 0, scale: 1 }, 0);
    // "Choose again" on the near-miss card, then C, then "Continue".
    CLICK(1.2, @@btn_x@@, @@btn_y@@, [@@c_in_x@@, @@c_in_y@@]);
    CLICK(@@clickC@@, @@c_at_x@@, @@c_at_y@@);
    CLICK(@@cont@@, @@btn2_x@@, @@btn2_y@@);
    tl.to("#p2-cur", { opacity: 0, duration: 0.25, ease: "power2.in" }, @@cont@@ + 0.25);
    tl.set("#p2-cap1", { opacity: 0 }, 0);
    tl.to("#p2-cap1", { opacity: 1, duration: 0.2, ease: "power2.out" }, 1.5);
    tl.to("#p2-cap1", { opacity: 0, duration: 0.12, ease: "power2.in" }, @@clickC@@ - 0.1);
    // The action bar at the bottom: punch onto it while the marker sweeps.
    tl.set("#p2-cap2", { opacity: 0 }, 0);
    tl.to("#p2-cap2", { opacity: 1, duration: 0.2, ease: "power2.out" }, @@cont@@ + 0.5);
    tl.to("#p2-cap2", { opacity: 0, duration: 0.12, ease: "power2.in" }, @@T2@@ - 0.35);
    tl.set("#p2-cam", { transformOrigin: "50% 100%" }, @@cont@@ + 0.79);
    tl.to("#p2-cam", { scale: 1.5, duration: 0.5, ease: "power2.inOut" }, @@cont@@ + 0.8);
    tl.to("#p2-cam", { x: -200, duration: 0.2, ease: "power3.in" }, @@T2@@ - 0.2);
    window.__timelines["proof2"] = tl;
  </script>
</template>
