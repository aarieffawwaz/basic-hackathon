<template>
  <style>
@@COMMON@@
    .pro { position: absolute; left: 120px; top: 600px; }
    .pro .eyebrow { display: block; font-family: "JetBrains Mono", monospace; font-weight: 500; font-size: 30px; letter-spacing: 0.08em; color: #9aa5b1; margin-bottom: 22px; }
    .pro .title { position: static; font-size: 76px; letter-spacing: -0.02em; line-height: 1.06; }
    .pro .title .w { margin-right: 0.26em; }
  </style>
  <div data-hf-id="hf-in01" id="root" data-composition-id="intro" data-width="1920" data-height="1080">
    <!-- Shot 1: the sim's own "First Shift" card, then the gate and the PPE check. Shot 2: the landing page's truck lane, a tractor coming. -->
    <div data-hf-id="hf-in02" class="cam" id="in-cam1" style="z-index:1"><video data-hf-id="hf-in03" id="in-shot1" class="clip" src="assets/clips/walk.mp4" data-start="0" data-duration="7.4" data-media-start="@@in_walk_ms@@" muted playsinline></video></div>
    <div data-hf-id="hf-in04" class="cam" id="in-cam2" style="z-index:2"><video data-hf-id="hf-in05" id="in-shot2" class="clip" src="assets/clips/landing.mp4" data-start="7.4" data-duration="6.2" data-media-start="@@in_land_ms@@" data-hf-media-start-basis="local" muted playsinline></video></div>
    <div data-hf-id="hf-in06" id="in-ui" class="clip" data-start="0" data-duration="13.6" style="z-index:3" data-layout-allow-overlap>
      <div data-hf-id="hf-in10" class="pro boxed" id="in-a"><span data-hf-id="hf-in11" class="eyebrow">SURABAYA · DAY ONE</span><div data-hf-id="hf-in12" class="title"><span data-hf-id="hf-in13" class="ln"><span data-hf-id="hf-in14" class="w">Dimas,</span><span data-hf-id="hf-in15" class="w">22.</span></span><span data-hf-id="hf-in16" class="ln"><span data-hf-id="hf-in17" class="w acc">New</span><span data-hf-id="hf-in18" class="w">yard</span><span data-hf-id="hf-in19" class="w">checker.</span></span></div></div>
      <div data-hf-id="hf-in20" class="pro boxed" id="in-b"><div data-hf-id="hf-in21" class="title"><span data-hf-id="hf-in22" class="ln"><span data-hf-id="hf-in23" class="w">His</span><span data-hf-id="hf-in24" class="w">K3</span><span data-hf-id="hf-in25" class="w">induction:</span></span><span data-hf-id="hf-in26" class="ln"><span data-hf-id="hf-in27" class="w">a</span><span data-hf-id="hf-in28" class="w">slideshow</span><span data-hf-id="hf-in29" class="w">and</span><span data-hf-id="hf-in2a" class="w">a</span><span data-hf-id="hf-in2b" class="w acc">signature.</span></span></div></div>
      <div data-hf-id="hf-in30" class="pro boxed" id="in-c"><div data-hf-id="hf-in31" class="title"><span data-hf-id="hf-in32" class="ln"><span data-hf-id="hf-in33" class="w">He</span><span data-hf-id="hf-in34" class="w">has</span><span data-hf-id="hf-in35" class="w">never</span><span data-hf-id="hf-in36" class="w">stood</span></span><span data-hf-id="hf-in37" class="ln"><span data-hf-id="hf-in38" class="w">next</span><span data-hf-id="hf-in39" class="w">to</span><span data-hf-id="hf-in3a" class="w">a</span><span data-hf-id="hf-in3b" class="w">moving</span><span data-hf-id="hf-in3c" class="w acc">tractor.</span></span></div></div>
      <div data-hf-id="hf-in40" class="pro boxed" id="in-d"><div data-hf-id="hf-in41" class="title"><span data-hf-id="hf-in42" class="ln"><span data-hf-id="hf-in43" class="w acc">Today</span><span data-hf-id="hf-in44" class="w">he</span><span data-hf-id="hf-in45" class="w">does.</span></span></div></div>
    </div>
  </div>
  <script>
    const tl = gsap.timeline({ paused: true });
    // Per-word blur-in, whole-line blur-out, dead still between (same grammar as the hook title).
    const line = (sel, tIn, tOut) => {
      tl.set(sel + " .w" + (document.querySelector(sel + " .eyebrow") ? ", " + sel + " .eyebrow" : ""), { opacity: 0, filter: "blur(6px)" }, 0);
      if (document.querySelector(sel + " .eyebrow")) tl.to(sel + " .eyebrow", { opacity: 1, filter: "blur(0px)", duration: 0.2, ease: "power2.out" }, tIn - 0.25);
      tl.set(sel, { opacity: 0, filter: "blur(0px)" }, 0);
      tl.to(sel, { opacity: 1, duration: 0.15, ease: "power2.out" }, tIn - 0.3);
      tl.to(sel + " .w", { opacity: 1, filter: "blur(0px)", duration: 0.13, stagger: 0.067, ease: "power2.out" }, tIn);
      tl.to(sel, { opacity: 0, filter: "blur(8px)", duration: 0.15, ease: "power2.in" }, tOut);
    };
    line("#in-a", 1.7, 4.15);
    line("#in-b", 4.45, 7.15);
    line("#in-c", 7.95, 11.15);
    line("#in-d", 11.45, 13.35);
    // Shot 1: a slow push while the gate check runs. Shot 2 holds; the tractor does the moving.
    tl.fromTo("#in-cam1", { scale: 1, x: 0 }, { scale: 1.06, duration: 7.4, ease: "none" }, 0);
    tl.set("#in-cam2", { scale: 1, x: 0 }, 0);
    // Whip out into the hook's open card.
    tl.to("#in-cam2", { x: -200, duration: 0.2, ease: "power3.in" }, 13.4);
    window.__timelines["intro"] = tl;
  </script>
</template>
