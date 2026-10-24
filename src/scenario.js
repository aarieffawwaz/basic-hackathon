import { MODE_ROLES } from './modes/scenarios.js';

// Five hazard checkpoints on a first shift at a container terminal.
// Each hazard: where it triggers, the situation, the choices, the rule it teaches,
// and which consequence replay plays when the choice is wrong.
// Rule names are real Indonesian regulations; wording is paraphrased, not quoted.

const CHECKER = [
  {
    id: 'ppe',
    action: { type: 'hold', key: 'KeyE', seconds: 1.6, label: { en: 'Hold E — put on helmet, vest, boots', id: 'Tahan E — pakai helm, rompi, sepatu' } },
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
    action: { type: 'timing', key: 'Space', label: { en: 'Press SPACE the moment the driver waves', id: 'Tekan SPASI saat pengemudi melambai' }, window: [0.58, 0.74] },
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
    action: { type: 'hold', key: 'KeyE', seconds: 1.4, label: { en: 'Hold E — radio the RTG operator, wait for set-down', id: 'Tahan E — radio operator RTG, tunggu beban turun' } },
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
    action: { type: 'hold', key: 'KeyE', seconds: 1.8, label: { en: 'Hold E — clip harness, check the platform', id: 'Tahan E — pasang harness, cek platform' } },
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
    action: { type: 'hold', key: 'KeyE', seconds: 2.0, label: { en: 'Hold E — fill the near-miss form', id: 'Tahan E — isi form near miss' } },
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

const OPERATOR = [
  {
    id: 'prestart',
    zone: { x: 0, z: 43, r: 2.6 },
    objective: { en: 'Walk to the reach stacker and start your shift', id: 'Jalan ke reach stacker dan mulai shift' },
    title: { en: 'Pre-start: the machine is already warm', id: 'Pre-start: mesin sudah menyala' },
    situation: { en: 'The night driver left the 45-tonne reach stacker running. The checklist board is empty. Dispatch wants the first box moved in four minutes.', id: 'Pengemudi malam meninggalkan reach stacker 45 ton menyala. Papan checklist kosong. Dispatch minta kotak pertama dipindah dalam empat menit.' },
    options: [
      { en: 'Climb in and go. It ran all night, it is fine.', id: 'Naik dan jalan. Semalaman jalan, pasti aman.', correct: false, replay: 'cross', captions: { en: ['Brakes never tested after the night shift.', 'A 45 t machine with a soft pedal needs 30 m to stop.', 'The walkway was 12 m away.'], id: ['Rem tidak pernah dicek setelah shift malam.', 'Mesin 45 t dengan pedal lembek butuh 30 m untuk berhenti.', 'Jalur pejalan hanya 12 m.'] } },
      { en: 'Do the walkaround: tyres, brakes, horn, mirrors, spreader. Then log it.', id: 'Lakukan walkaround: ban, rem, klakson, spion, spreader. Lalu catat.', correct: true },
      { en: 'Ask dispatch to check it later, move the box first.', id: 'Minta dispatch cek nanti, pindahkan kotak dulu.', correct: false, replay: 'cross', captions: { en: ['The check that was going to happen later.', 'Service brake at 60%. Nobody knew.', 'Struck on the walkway.'], id: ['Pemeriksaan yang "nanti saja".', 'Rem servis 60%. Tidak ada yang tahu.', 'Tertabrak di jalur pejalan.'] } },
    ],
    action: { type: 'hold', key: 'KeyE', seconds: 2.0, label: { en: 'Hold E — walkaround inspection', id: 'Tahan E — inspeksi walkaround' } },
    why: { en: 'A reach stacker is the heaviest thing that moves in the yard. The pre-start is the only brake test it gets today.', id: 'Reach stacker adalah benda terberat yang bergerak di lapangan. Pre-start adalah satu-satunya uji rem hari ini.' },
    rule: { name: 'Permenaker No. 8/2020 · operator pre-use inspection', en: 'Lifting equipment must be inspected by the operator before each use and defects reported.', id: 'Pesawat angkat wajib diperiksa operator sebelum digunakan dan cacat dilaporkan.' },
  },
  {
    id: 'blindspot',
    zone: { x: 0, z: 25.5, r: 2.6 },
    objective: { en: 'Drive to the lane crossing', id: 'Kemudikan ke penyeberangan jalur' },
    title: { en: 'Somebody is in your blind spot', id: 'Ada orang di blind spot-mu' },
    situation: { en: 'You are carrying a 40-ft box, spreader high. A checker in orange just vanished from the left mirror near the crossing.', id: 'Kamu membawa kotak 40 kaki, spreader tinggi. Seorang checker berompi oranye baru saja hilang dari spion kiri dekat penyeberangan.' },
    options: [
      { en: 'Keep rolling slowly, they will step back.', id: 'Terus jalan pelan, mereka pasti mundur.', correct: false, replay: 'cross', captions: { en: ['From the cab, the three metres in front of a raised box are invisible.', 'Slowly is still 5 km/h and 60 tonnes.', 'Run over at walking pace.'], id: ['Dari kabin, tiga meter di depan kotak yang terangkat tidak terlihat.', 'Pelan tetap 5 km/jam dan 60 ton.', 'Terlindas dalam kecepatan jalan kaki.'] } },
      { en: 'Stop, sound the horn, wait until you see them clear and get a wave.', id: 'Berhenti, bunyikan klakson, tunggu sampai terlihat aman dan dapat lambaian.', correct: true },
      { en: 'Lower the box fast so you can see.', id: 'Turunkan kotak cepat supaya terlihat.', correct: false, replay: 'load', captions: { en: ['A fast lower with a person underneath the swing.', 'The spreader does not know who is below it.', '30 t, set down on a person.'], id: ['Menurunkan cepat dengan orang di bawah ayunan.', 'Spreader tidak tahu siapa di bawahnya.', '30 t, diturunkan ke atas orang.'] } },
    ],
    action: { type: 'timing', key: 'Space', label: { en: 'Press SPACE when the checker waves you on', id: 'Tekan SPASI saat checker melambai' }, window: [0.55, 0.72] },
    why: { en: 'Stop, horn, eye contact, wave. Every pedestrian strike by a container handler in the last decade had one of those four missing.', id: 'Berhenti, klakson, kontak mata, lambaian. Setiap pejalan tertabrak container handler dalam sepuluh tahun terakhir kehilangan salah satu dari empat itu.' },
    rule: { name: 'UU No. 1/1970 · vehicle–pedestrian interaction', en: 'Drivers must stop when a pedestrian may be in the path; horn and visual confirmation before moving.', id: 'Pengemudi wajib berhenti bila pejalan mungkin di jalur; klakson dan konfirmasi visual sebelum bergerak.' },
  },
  {
    id: 'wind',
    zone: { x: 0, z: -3, r: 2.6 },
    objective: { en: 'Stack the box at block B', id: 'Tumpuk kotak di blok B' },
    title: { en: 'Gusts at 14 m/s, stacking three-high', id: 'Angin 14 m/s, menumpuk tiga tingkat' },
    situation: { en: 'The anemometer on the light mast reads 14 m/s with gusts. The plan says third tier. The box is empty and light.', id: 'Anemometer di tiang lampu menunjukkan 14 m/s dengan hembusan. Rencana: tingkat ketiga. Kotak kosong dan ringan.' },
    options: [
      { en: 'Stack it. Empty boxes are easy.', id: 'Tumpuk saja. Kotak kosong gampang.', correct: false, replay: 'load', captions: { en: ['An empty 40-ft box is a 30 m² sail.', 'Gust catches it on the spreader at 8 m.', 'It lands on whoever is on the ground side.'], id: ['Kotak 40 kaki kosong adalah layar seluas 30 m².', 'Hembusan menangkapnya di spreader pada 8 m.', 'Mendarat ke siapa pun yang ada di sisi bawah.'] } },
      { en: 'Hold at ground tier, call the planner, stop stacking above two until the wind drops.', id: 'Tahan di tingkat dasar, hubungi planner, stop menumpuk di atas dua sampai angin turun.', correct: true },
      { en: 'Stack it fast between gusts.', id: 'Tumpuk cepat di antara hembusan.', correct: false, replay: 'load', captions: { en: ['Between gusts is a guess.', 'The spreader twists, one corner unlocks.', 'Dropped from the third tier.'], id: ['"Di antara hembusan" hanyalah tebakan.', 'Spreader terpuntir, satu sudut terlepas.', 'Jatuh dari tingkat ketiga.'] } },
    ],
    action: { type: 'hold', key: 'KeyE', seconds: 1.6, label: { en: 'Hold E — set the box down, lock out stacking', id: 'Tahan E — turunkan kotak, kunci penumpukan' } },
    why: { en: 'Empty containers are the ones the wind takes. Wind limits exist per tier because the people under the stack cannot see the gust coming.', id: 'Kontainer kosong justru yang dibawa angin. Batas angin per tingkat ada karena orang di bawah tumpukan tidak bisa melihat hembusan datang.' },
    rule: { name: 'Permenaker No. 8/2020 · environmental limits for lifting', en: 'Lifting operations must stop when wind exceeds the equipment or site limit.', id: 'Operasi pengangkatan wajib berhenti bila angin melebihi batas alat atau lokasi.' },
  },
];

const LASHING = [
  {
    id: 'gangway',
    zone: { x: 0, z: -62, r: 2.8 },
    objective: { en: 'Board the vessel by the gangway', id: 'Naik ke kapal lewat gangway' },
    title: { en: 'The gangway safety net is missing', id: 'Jaring pengaman gangway tidak ada' },
    situation: { en: 'High tide, the gangway sits at a steep angle. The net that should hang under it is on the quay in a heap. The foreman is already aboard, waving you up.', id: 'Pasang tinggi, gangway miring curam. Jaring yang seharusnya tergantung di bawahnya tergeletak di dermaga. Mandor sudah di atas, melambaikan tangan.' },
    options: [
      { en: 'Go up carefully, hold both rails.', id: 'Naik hati-hati, pegang kedua pegangan.', correct: false, replay: 'height', captions: { en: ['Wet aluminium, 38° angle, no net.', 'One slip between hull and quay.', 'Crushed between ship and fender on the next swell.'], id: ['Aluminium basah, kemiringan 38°, tanpa jaring.', 'Satu kali terpeleset di antara lambung dan dermaga.', 'Terjepit antara kapal dan fender pada gelombang berikutnya.'] } },
      { en: 'Refuse to board until the net is rigged and the angle is reduced.', id: 'Tolak naik sampai jaring terpasang dan sudut dikurangi.', correct: true },
      { en: 'Use the pilot ladder instead, it is quicker.', id: 'Pakai tangga pilot saja, lebih cepat.', correct: false, replay: 'height', captions: { en: ['A pilot ladder is for pilots, with a boat below.', '12 m of rope ladder over concrete.', 'Fall onto the quay edge.'], id: ['Tangga pilot untuk pandu, dengan kapal di bawahnya.', '12 m tangga tali di atas beton.', 'Jatuh ke tepi dermaga.'] } },
    ],
    action: { type: 'hold', key: 'KeyE', seconds: 1.8, label: { en: 'Hold E — rig the net with the crew', id: 'Tahan E — pasang jaring bersama kru' } },
    why: { en: 'The gap between ship and quay is the most common fatal fall on a terminal. The net is not optional equipment; it is the floor.', id: 'Celah antara kapal dan dermaga adalah jatuh fatal paling umum di terminal. Jaring bukan perlengkapan opsional; itu lantainya.' },
    rule: { name: 'Permenaker No. 9/2016 · access and fall protection', en: 'Access ways over a fall hazard require guard rails and a safety net or equivalent.', id: 'Jalur akses di atas bahaya jatuh wajib pagar pengaman dan jaring atau setara.' },
  },
  {
    id: 'snapback',
    zone: { x: 0, z: -96, r: 2.8 },
    objective: { en: 'Walk the quay to the lashing station', id: 'Jalani dermaga ke stasiun lashing' },
    title: { en: 'Mooring line under load, you are in the bight', id: 'Tali tambat tertegang, kamu di zona bight' },
    situation: { en: 'The stern line is humming. The hatched snap-back zone on the quay is painted right across your route. Going round adds a minute.', id: 'Tali buritan berdengung. Zona snap-back bergaris di dermaga tepat melintang rute-mu. Memutar menambah satu menit.' },
    options: [
      { en: 'Walk through quickly, lines rarely part.', id: 'Lewati cepat, tali jarang putus.', correct: false, replay: 'snapback' },
      { en: 'Stay outside the hatched zone, wait for the winch to ease, then pass behind the bollard.', id: 'Tetap di luar zona bergaris, tunggu winch mengendur, lalu lewat di belakang bollard.', correct: true },
      { en: 'Duck under the line.', id: 'Merunduk di bawah tali.', correct: false, replay: 'snapback' },
    ],
    action: { type: 'timing', key: 'Space', label: { en: 'Press SPACE when the winch eases and the line drops', id: 'Tekan SPASI saat winch mengendur dan tali turun' }, window: [0.6, 0.78] },
    why: { en: 'A parted mooring line travels faster than you can see it. The hatched zone is drawn where bodies have been found.', id: 'Tali tambat yang putus bergerak lebih cepat dari yang bisa kamu lihat. Zona bergaris digambar di tempat korban pernah ditemukan.' },
    rule: { name: 'PP No. 50/2012 (SMK3) · hazard zoning', en: 'Identified hazard zones must be marked and entry controlled.', id: 'Zona bahaya teridentifikasi wajib ditandai dan aksesnya dikendalikan.' },
  },
  {
    id: 'lashcage',
    zone: { x: 0, z: -106, r: 2.8 },
    objective: { en: 'Lash the top tier at bay 22', id: 'Lashing tingkat atas di bay 22' },
    title: { en: 'Twist-locks on the top tier, cage or climb?', id: 'Twist-lock di tingkat atas, cage atau panjat?' },
    situation: { en: 'The lashing cage is on the other crane, ten minutes away. The gantry operator offers to lift you on the spreader. The rods are 14 m up.', id: 'Lashing cage ada di crane lain, sepuluh menit jauhnya. Operator gantry menawarkan mengangkatmu dengan spreader. Batangnya 14 m di atas.' },
    options: [
      { en: 'Ride the spreader, it is faster.', id: 'Naik spreader, lebih cepat.', correct: false, replay: 'height', captions: { en: ['Standing on a spreader beam at 14 m, no cage, no clip.', 'The trolley brakes. You do not.', '14 m onto the deck.'], id: ['Berdiri di balok spreader pada 14 m, tanpa cage, tanpa harness.', 'Trolley mengerem. Kamu tidak.', '14 m ke dek.'] } },
      { en: 'Wait for the cage, clip in, work from inside the rails.', id: 'Tunggu cage, pasang harness, kerja dari dalam pagar.', correct: true },
      { en: 'Climb the container ladder rungs with the rod on your shoulder.', id: 'Panjat anak tangga kontainer dengan batang di bahu.', correct: false, replay: 'height', captions: { en: ['A 20 kg lashing rod and one free hand.', 'Rungs are wet. The rod swings.', 'Fall from the fourth tier.'], id: ['Batang lashing 20 kg dan satu tangan bebas.', 'Anak tangga basah. Batang berayun.', 'Jatuh dari tingkat keempat.'] } },
    ],
    action: { type: 'hold', key: 'KeyE', seconds: 2.0, label: { en: 'Hold E — clip in, lash from the cage', id: 'Tahan E — pasang harness, lashing dari cage' } },
    why: { en: 'Riding a spreader is the single most common shortcut on deck and the single most common way lashers die.', id: 'Menaiki spreader adalah jalan pintas paling umum di dek dan cara paling umum lasher meninggal.' },
    rule: { name: 'Permenaker No. 9/2016 · work at height on vessels', en: 'Work at height requires an engineered platform (cage) and fall arrest; riding loads or lifting gear is prohibited.', id: 'Kerja di ketinggian wajib platform terencana (cage) dan penahan jatuh; menumpang beban atau alat angkat dilarang.' },
  },
];

export const ROLES = [
  { id: 'checker', icon: 'ic-hat', name: { en: 'Yard checker', id: 'Checker lapangan' }, tag: { en: 'On foot · 5 checkpoints', id: 'Jalan kaki · 5 checkpoint' },
    blurb: { en: 'First day on foot in the container yard. Gate, lane, crane block, stacks, office.', id: 'Hari pertama jalan kaki di lapangan kontainer. Gerbang, jalur, blok crane, tumpukan, kantor.' },
    spawn: { x: 0, z: 48, yaw: 0 }, hazards: CHECKER },
  { id: 'operator', icon: 'ic-truck', name: { en: 'Reach stacker operator', id: 'Operator reach stacker' }, tag: { en: 'Heavy equipment · 3 checkpoints', id: 'Alat berat · 3 checkpoint' },
    blurb: { en: 'You drive the 45-tonne machine. Pre-start, blind spots, wind limits.', id: 'Kamu mengemudikan mesin 45 ton. Pre-start, blind spot, batas angin.' },
    spawn: { x: 0, z: 48, yaw: 0 }, hazards: OPERATOR },
  { id: 'lashing', icon: 'ic-ship', name: { en: 'Lashing crew', id: 'Kru lashing' }, tag: { en: 'Quay & vessel · 3 checkpoints', id: 'Dermaga & kapal · 3 checkpoint' },
    blurb: { en: 'Ship side. Gangway, mooring lines, the top tier.', id: 'Sisi kapal. Gangway, tali tambat, tingkat atas.' },
    spawn: { x: 0, z: -52, yaw: 0 }, hazards: LASHING },
  ...MODE_ROLES,
];
export const HAZARDS = CHECKER;

export const STRINGS = {
  roleTitle: { en: 'Pick your shift', id: 'Pilih shift-mu' },
  groupWalk: { en: 'Walk the shift · decide A / B / C', id: 'Jalani shift · putuskan A / B / C' },
  groupHands: { en: 'Hands-on · you are at the controls', id: 'Hands-on · kamu yang mengendalikan' },
  groupNew: { en: 'NEW', id: 'BARU' },
  tryAgain: { en: 'Try again', id: 'Coba lagi' },
  yourRun: { en: 'YOUR RUN', id: 'REKAMANMU' },
  replayTag: { en: 'REPLAY', id: 'REPLAY' },
  roleLead: { en: 'Three jobs, three sets of calls. Each one ends in a shift report.', id: 'Tiga pekerjaan, tiga rangkaian keputusan. Masing-masing berakhir dengan laporan shift.' },
  actionDone: { en: 'DONE', id: 'SELESAI' },
  actionMiss: { en: 'Too early / too late', id: 'Terlalu cepat / terlambat' },
  mission: { en: 'MISSION', id: 'MISI' },
  milestones: { en: 'Milestones', id: 'Milestone' },
  shiftTime: { en: 'Shift time', id: 'Waktu shift' },
  distance: { en: 'to checkpoint', id: 'ke checkpoint' },
  sound: { en: 'Sound', id: 'Suara' },
  chooseKey: { en: 'Press 1 · 2 · 3 or click', id: 'Tekan 1 · 2 · 3 atau klik' },
  view: { en: 'Switch first / third person (V)', id: 'Ganti sudut pandang orang pertama / ketiga (V)' },
  startLead: {
    en: 'Your first shift at a container terminal, in the browser. No headset. Walk the yard and make the calls a new worker makes every day, or take the controls of a tractor, a crane, the signals. Get one wrong and the sim does not tell you — it shows you.',
    id: 'Shift pertamamu di terminal kontainer, langsung di browser. Tanpa headset. Jalani lapangan dan ambil keputusan yang dihadapi pekerja baru tiap hari, atau pegang kendali tractor, crane, dan isyarat. Kalau salah, sim tidak sekadar memberi tahu — ia memperlihatkannya.',
  },
  startList: {
    en: ['WASD to walk, mouse to look, V for third person', 'Follow the yellow beacon', 'Decide at each checkpoint', 'Wrong call → consequence replay → the rule'],
    id: ['WASD jalan, mouse lihat, V untuk sudut orang ketiga', 'Ikuti beacon kuning', 'Putuskan di tiap checkpoint', 'Salah → replay akibatnya → aturannya'],
  },
  startKeys: {
    en: [['W A S D', 'walk'], ['Mouse', 'look'], ['V', 'third person'], ['A B C', 'decide'], ['Esc', 'release mouse']],
    id: [['W A S D', 'jalan'], ['Mouse', 'lihat'], ['V', 'orang ketiga'], ['A B C', 'putuskan'], ['Esc', 'lepas mouse']],
  },
  startBtn: { en: 'Start shift', id: 'Mulai shift' },
  startFine: { en: 'Clicking locks your mouse to the sim. Follow the yellow beacon. A wrong call plays the consequence, then the rule.', id: 'Klik akan mengunci mouse ke sim. Ikuti beacon kuning. Keputusan salah memutar akibatnya, lalu aturannya.' },
  hint: { en: 'WASD walk · mouse look · V view · Esc release mouse', id: 'WASD jalan · mouse lihat · V sudut pandang · Esc lepas mouse' },
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
