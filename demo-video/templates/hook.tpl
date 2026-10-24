<template>
  <style>
@@COMMON@@
    #hk-title { top: 540px; }
  </style>
  <div data-hf-id="hf-ktv8" id="root" data-composition-id="hook" data-width="1920" data-height="1080">
    <div data-hf-id="hf-4qby" class="cam" id="hk-cam"><video data-hf-id="hf-637l" id="hk-shot" class="clip" src="assets/clips/cross.mp4" data-start="0" data-duration="17.5" data-media-start="@@hook_ms@@" muted playsinline></video></div>
    <div data-hf-id="hf-i0rt" id="hk-ui" class="clip" data-start="0" data-duration="17.5" data-layout-allow-overlap>
      @@CURSOR:hk-cur@@
      <div data-hf-id="hf-4c6e" class="title" id="hk-title"><span data-hf-id="hf-smev" class="ln"><span data-hf-id="hf-nqaj" class="w">See</span><span data-hf-id="hf-9o0j" class="w">the</span><span data-hf-id="hf-dua1" class="w">accident</span></span><span data-hf-id="hf-oupj" class="ln"><span data-hf-id="hf-n0cs" class="w acc">before</span><span data-hf-id="hf-cqxh" class="w">it</span><span data-hf-id="hf-758p" class="w">happens.</span></span></div>
      <div data-hf-id="hf-c1nu" class="cap" id="hk-cap"><div data-hf-id="hf-sdpy">A wrong call plays the <b data-hf-id="hf-iqa2">consequence</b>, then the rule.</div></div>
    </div>
  </div>
  <script>
    const tl = gsap.timeline({ paused: true });
    // Push onto the open card while the cursor decides; pull back as the replay begins.
    tl.fromTo("#hk-cam", { scale: 1, x: 0 }, { scale: 1.12, duration: 3.3, ease: "power1.inOut" }, 0.1);
    tl.to("#hk-cam", { scale: 1, duration: 0.6, ease: "power2.inOut" }, 3.5);
    // Cursor: in from off-frame, lands on option A, presses, leaves with the card.
    tl.set("#hk-cur", { opacity: 0, x: @@a_in_x@@, y: @@a_in_y@@, scale: 1 }, 0);
    tl.to("#hk-cur", { opacity: 1, duration: 0.1 }, 2.2);
    tl.to("#hk-cur", { x: @@a_at_x@@, y: @@a_at_y@@, duration: 0.7, ease: "expo.out" }, 2.2);
    tl.to("#hk-cur", { scale: 0.86, duration: 0.07, ease: "power2.in" }, 3.43);
    tl.to("#hk-cur", { scale: 1, duration: 0.1, ease: "power2.out" }, 3.5);
    tl.to("#hk-cur", { opacity: 0, duration: 0.25, ease: "power2.in" }, 3.7);
    // Title after the impact, per word, then dead still; blur out before the card returns.
    tl.set("#hk-title .w", { opacity: 0, filter: "blur(6px)" }, 0);
    tl.to("#hk-title .w", { opacity: 1, filter: "blur(0px)", duration: 0.13, stagger: 0.067, ease: "power2.out" }, 8.6);
    tl.to("#hk-title", { opacity: 0, filter: "blur(8px)", duration: 0.15, ease: "power2.in" }, 13.15);
    // Caption over the near-miss card.
    tl.set("#hk-cap", { opacity: 0 }, 0);
    tl.to("#hk-cap", { opacity: 1, duration: 0.2, ease: "power2.out" }, @@hk_cap_in@@);
    tl.to("#hk-cap", { opacity: 0, duration: 0.12, ease: "power2.in" }, 17.15);
    // Whip out.
    tl.to("#hk-cam", { x: -200, duration: 0.2, ease: "power3.in" }, 17.3);
    window.__timelines["hook"] = tl;
  </script>
</template>
