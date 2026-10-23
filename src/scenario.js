// Five hazard checkpoints on a first shift at a container terminal.
// Each hazard: where it triggers, the situation, the choices, the rule it teaches,
// and which consequence replay plays when the choice is wrong.
// Rule names are real Indonesian regulations; wording is paraphrased, not quoted.

export const HAZARDS = [
  {
    id: 'ppe',
    zone: { x: 0, z: 43, r: 2.6 },
    objective: { en: 'Walk to the gate and clear the PPE check', id: 'Jalan ke gerbang dan lewati pemeriksaan APD' },
    title: { en: 'Gate check: what do you put on?', id: 'Pos gerbang: apa yang kamu pakai?' },
    situation: {
      en: 'The supervisor points at the PPE rack. Cranes are working the stacks ahead. You are already late.',
      id: 'Supervisor menunjuk rak APD. Crane sedang bekerja di tumpukan depan. Kamu sudah telat.',
    },
    options: [
      { en: 'Vest only. Helmets are hot and the walk is short.', id: 'Rompi saja. Helm panas dan jalannya dekat.', correct: false, replay: 'ppe' },
      { en: 'Helmet, high-vis vest, safety boots. Then sign the log.', id: 'Helm, rompi high-vis, sepatu safety. Lalu isi log.', correct: true },
      { en: 'Skip the rack, the supervisor already saw me.', id: 'Lewati rak, supervisor sudah lihat saya.', correct: false, replay: 'ppe' },
    ],
    why: {
      en: 'Anything that falls from a crane spreader (twist-locks, cones, bolts) lands on whoever is below. The helmet is the only thing between that and your skull.',
      id: 'Apa pun yang jatuh dari spreader crane (twist-lock, cone, baut) mendarat ke siapa pun di bawahnya. Helm satu-satunya pelindung kepala.',
    },
    rule: {
      name: 'Permenaker No. 8/2010 (Alat Pelindung Diri)',
      en: 'Employers must provide PPE free of charge, and workers must wear it in areas where it is required.',
      id: 'Pengusaha wajib menyediakan APD secara cuma-cuma dan pekerja wajib memakainya di area yang mewajibkan.',
    },
  },
  {
    id: 'cross',
    zone: { x: 0, z: 25.5, r: 2.6 },
    objective: { en: 'Cross the truck lane to reach the stacks', id: 'Seberangi jalur truk menuju tumpukan' },
    title: { en: 'Truck lane: a terminal tractor is coming', id: 'Jalur truk: terminal tractor mendekat' },
    situation: {
      en: 'The walkway meets the truck lane. A tractor is about 40 m away. The driver sits high and is looking at the crane, not at you.',
      id: 'Jalur pejalan bertemu jalur truk. Tractor sekitar 40 m. Pengemudi duduk tinggi dan melihat crane, bukan kamu.',
    },
    options: [
      { en: 'Cross now. 40 m is plenty.', id: 'Seberang sekarang. 40 m cukup jauh.', correct: false, replay: 'cross' },
      { en: 'Jog across before it gets closer.', id: 'Lari kecil sebelum makin dekat.', correct: false, replay: 'cross' },
      { en: 'Stop at the yellow line, make eye contact, wait for the driver to wave you across.', id: 'Berhenti di garis kuning, kontak mata, tunggu pengemudi melambaikan tangan.', correct: true },
    ],
    why: {
      en: 'A loaded terminal tractor needs tens of metres to stop and has blind spots near the cab. Eye contact plus a wave is the only confirmation the driver has seen you.',
      id: 'Terminal tractor bermuatan butuh puluhan meter untuk berhenti dan punya blind spot dekat kabin. Kontak mata plus lambaian satu-satunya tanda pengemudi melihatmu.',
    },
    rule: {
      name: 'UU No. 1/1970 (Keselamatan Kerja) · pedestrian–vehicle segregation',
      en: 'Workplaces must separate pedestrians from moving vehicles; crossing points are controlled, not improvised.',
      id: 'Tempat kerja wajib memisahkan pejalan kaki dari kendaraan bergerak; titik penyeberangan diatur, bukan improvisasi.',
    },
  },
  {
    id: 'load',
    zone: { x: 0, z: -3, r: 2.6 },
    objective: { en: 'Reach the RTG crane block', id: 'Menuju blok crane RTG' },
    title: { en: 'Suspended load across your path', id: 'Beban menggantung di jalurmu' },
    situation: {
      en: 'The RTG is holding a 40-ft container about 7 m up, right over the corridor. Going around the block adds three minutes.',
      id: 'RTG memegang kontainer 40 kaki sekitar 7 m di atas, tepat di atas koridor. Memutar blok menambah tiga menit.',
    },
    options: [
      { en: 'Walk under it quickly. It is not moving.', id: 'Lewat di bawahnya cepat-cepat. Bebannya diam.', correct: false, replay: 'load' },
      { en: 'Wait outside the crane’s swing radius until the load is set down, or take the marked detour.', id: 'Tunggu di luar radius crane sampai beban diturunkan, atau ambil jalur memutar yang ditandai.', correct: true },
      { en: 'Wave at the operator and go. They will stop for you.', id: 'Lambaikan tangan ke operator lalu jalan. Mereka pasti berhenti.', correct: false, replay: 'load' },
    ],
    why: {
      en: 'Twist-locks fail, cables slip, spreaders drop. A 30-tonne box has no warning and no second chance. Never under a suspended load, no exceptions.',
      id: 'Twist-lock bisa lepas, kabel selip, spreader jatuh. Kotak 30 ton tidak memberi peringatan. Jangan pernah di bawah beban menggantung.',
    },
    rule: {
      name: 'Permenaker No. 8/2020 (K3 Pesawat Angkat dan Pesawat Angkut)',
      en: 'No person may stand or pass beneath a suspended load; the lifting area must be kept clear.',
      id: 'Dilarang berada atau melintas di bawah beban yang diangkat; area pengangkatan harus bebas orang.',
    },
  },
  {
    id: 'height',
    zone: { x: 0, z: -24, r: 2.6 },
    objective: { en: 'Check the seal on container stack B-7', id: 'Periksa segel di tumpukan kontainer B-7' },
    title: { en: 'Seal check on a two-high stack', id: 'Cek segel di tumpukan dua tingkat' },
    situation: {
      en: 'The seal you need to read is on the top container, 5 m up. There is no ladder nearby. The corner castings make decent footholds.',
      id: 'Segel yang harus dibaca ada di kontainer paling atas, 5 m. Tidak ada tangga di dekat sini. Corner casting bisa jadi pijakan.',
    },
    options: [
      { en: 'Climb the corner castings. It is only two high.', id: 'Panjat corner casting. Cuma dua tingkat.', correct: false, replay: 'height' },
      { en: 'Radio for the mobile platform or a ladder with a spotter, and clip in above 1.8 m.', id: 'Radio minta mobile platform atau tangga dengan pengawas, dan pakai harness di atas 1,8 m.', correct: true },
      { en: 'Stand on the forklift forks, the driver will lift you.', id: 'Berdiri di garpu forklift, biar pengemudi angkat.', correct: false, replay: 'height' },
    ],
    why: {
      en: 'Falls from 2–6 m are the most common fatal fall height in logistics. Container tops are slick and have no edge protection.',
      id: 'Jatuh dari 2–6 m adalah ketinggian jatuh fatal paling umum di logistik. Atap kontainer licin dan tanpa pengaman tepi.',
    },
    rule: {
      name: 'Permenaker No. 9/2016 (K3 Pekerjaan pada Ketinggian)',
      en: 'Work above 1.8 m needs a planned access method and fall protection; improvised climbing is not permitted.',
      id: 'Kerja di atas 1,8 m wajib punya metode akses terencana dan pelindung jatuh; memanjat improvisasi tidak diizinkan.',
    },
  },
  {
    id: 'report',
    zone: { x: 0, z: -38, r: 2.8 },
    objective: { en: 'End of shift: go to the site office', id: 'Akhir shift: ke kantor lapangan' },
    title: { en: 'Shift over. Do you report the near miss?', id: 'Shift selesai. Lapor near miss atau tidak?' },
    situation: {
      en: 'At the crossing earlier, a tractor came closer than it should have before stopping. Nobody was hurt. The report form takes ten minutes and your supervisor hates paperwork.',
      id: 'Di penyeberangan tadi, tractor sempat terlalu dekat sebelum berhenti. Tidak ada yang terluka. Form laporan butuh sepuluh menit dan supervisormu benci kertas kerja.',
    },
    options: [
      { en: 'Nothing happened. Go home.', id: 'Tidak terjadi apa-apa. Pulang.', correct: false, replay: 'report' },
      { en: 'Mention it to a coworker, skip the form.', id: 'Cerita ke teman kerja, lewati form.', correct: false, replay: 'report' },
      { en: 'File the near-miss report with the time, lane, and tractor number.', id: 'Isi laporan near miss dengan jam, jalur, dan nomor tractor.', correct: true },
    ],
    why: {
      en: 'Near misses are free lessons. Unreported, the same lane, the same blind spot, and the same driver habit wait for the next person.',
      id: 'Near miss adalah pelajaran gratis. Kalau tidak dilaporkan, jalur yang sama, blind spot yang sama, dan kebiasaan pengemudi yang sama menunggu orang berikutnya.',
    },
    rule: {
      name: 'PP No. 50/2012 (SMK3) · incident and near-miss reporting',
      en: 'A safety management system requires incidents and near misses to be recorded, investigated, and acted on.',
      id: 'Sistem manajemen K3 mewajibkan insiden dan near miss dicatat, diselidiki, dan ditindaklanjuti.',
    },
  },
];

export const STRINGS = {
  startLead: {
    en: 'Your first shift at a container terminal, in the browser. No headset. Walk the yard, make five calls a new worker makes every day. Get one wrong and the sim does not tell you — it shows you.',
    id: 'Shift pertamamu di terminal kontainer, langsung di browser. Tanpa headset. Jalani lapangan, ambil lima keputusan yang dihadapi pekerja baru tiap hari. Kalau salah, sim tidak sekadar memberi tahu — ia memperlihatkannya.',
  },
  startList: {
    en: ['WASD to walk, mouse to look', 'Follow the yellow beacon', 'Decide at each checkpoint', 'Wrong call → consequence replay → the rule'],
    id: ['WASD jalan, mouse lihat', 'Ikuti beacon kuning', 'Putuskan di tiap checkpoint', 'Salah → replay akibatnya → aturannya'],
  },
  startBtn: { en: 'Start shift', id: 'Mulai shift' },
  startFine: { en: 'Click locks your mouse to the sim. Press Esc to release it.', id: 'Klik akan mengunci mouse ke sim. Tekan Esc untuk melepas.' },
  hint: { en: 'WASD walk · mouse look · Esc release mouse', id: 'WASD jalan · mouse lihat · Esc lepas mouse' },
  hintClick: { en: 'Click to resume', id: 'Klik untuk lanjut' },
  passed: { en: 'SAFE CALL', id: 'KEPUTUSAN AMAN' },
  nearMiss: { en: 'NEAR MISS — THIS IS WHAT WOULD HAVE HAPPENED', id: 'NEAR MISS — INI YANG AKAN TERJADI' },
  cont: { en: 'Continue', id: 'Lanjut' },
  retry: { en: 'Choose again', id: 'Pilih lagi' },
  decide: { en: 'DECISION', id: 'KEPUTUSAN' },
  hazards: { en: 'Checkpoints', id: 'Checkpoint' },
  near: { en: 'near miss', id: 'near miss' },
  endTitle: { en: 'Shift report', id: 'Laporan shift' },
  endScore: { en: 'clean calls', id: 'keputusan bersih' },
  endNear: { en: 'near misses replayed', id: 'near miss diputar ulang' },
  endTime: { en: 'shift time', id: 'durasi shift' },
  endLead: {
    en: 'Every replay above is a real failure mode in container yards. The rule next to it is the one that exists because someone did not get a replay.',
    id: 'Setiap replay di atas adalah kegagalan nyata di lapangan kontainer. Aturan di sebelahnya ada karena seseorang tidak mendapat replay.',
  },
  restart: { en: 'Run the shift again', id: 'Ulangi shift' },
  firstTry: { en: 'first try', id: 'langsung benar' },
  replayed: { en: 'replayed', id: 'diputar ulang' },
};
