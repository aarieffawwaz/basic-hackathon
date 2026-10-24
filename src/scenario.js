import { MODE_ROLES } from './modes/scenarios.js';

// Five hazard checkpoints on a first shift at a container terminal.
// Each hazard: where it triggers, the situation, the choices, the rule it teaches,
// and which consequence replay plays when the choice is wrong.
// Rule names are real Indonesian regulations; wording is paraphrased, not quoted.

const CHECKER = [
  {
    id: 'ppe',
    action: { type: 'hold', key: 'KeyE', seconds: 1.6, label: { en: 'Hold E: put on helmet, vest and boots', id: 'Tahan E: pakai helm, rompi dan sepatu' } },
    zone: { x: 0, z: 43, r: 2.6 },
    objective: { en: 'Walk to the gate and put on your safety gear', id: 'Jalan ke gerbang dan pakai perlengkapan keselamatan' },
    title: { en: 'Gate check: what do you put on?', id: 'Pos gerbang: apa yang kamu pakai?' },
    situation: {
      en: 'Before the gate there is a rack of safety gear: helmets, bright vests, safety boots. Past the gate, cranes are lifting containers over the yard. You are already late.',
      id: 'Di depan gerbang ada rak perlengkapan keselamatan: helm, rompi terang, sepatu safety. Di balik gerbang, crane sedang mengangkat kontainer di atas lapangan. Kamu sudah telat.',
    },
    options: [
      { en: 'Vest only. Helmets are hot and the walk is short.', id: 'Rompi saja. Helm panas dan jalannya dekat.', correct: false, replay: 'ppe' },
      { en: 'Helmet, bright vest and safety boots. Then sign in.', id: 'Helm, rompi terang dan sepatu safety. Lalu absen.', correct: true },
      { en: 'Skip the rack, the supervisor already saw me.', id: 'Lewati rak, supervisor sudah lihat saya.', correct: false, replay: 'ppe' },
    ],
    why: {
      en: 'Cranes lift containers right over the yard, and small steel parts sometimes fall off them. From that height a bolt hits like a hammer. The helmet is what stops it.',
      id: 'Crane mengangkat kontainer tepat di atas lapangan, dan kadang ada bagian besi kecil yang jatuh. Dari ketinggian itu, sebuah baut terasa seperti pukulan palu. Helm yang menahannya.',
    },
    rule: {
      name: 'Permenaker No. 8/2010 (Alat Pelindung Diri)',
      en: 'Your employer must give you safety gear for free. You must wear it wherever the site says it is required.',
      id: 'Perusahaan wajib memberi APD gratis. Kamu wajib memakainya di area yang mewajibkan.',
    },
  },
  {
    id: 'cross',
    action: { type: 'timing', key: 'Space', label: { en: 'Press SPACE the moment the driver waves', id: 'Tekan SPASI saat pengemudi melambai' }, window: [0.58, 0.74] },
    zone: { x: 0, z: 25.5, r: 2.6 },
    objective: { en: 'Cross the truck lane to reach the stacks', id: 'Seberangi jalur truk menuju tumpukan' },
    title: { en: 'Truck lane: a container truck is coming', id: 'Jalur truk: truk kontainer mendekat' },
    situation: {
      en: 'Your walkway crosses the truck lane here. A container truck is about 40 m away. The driver sits high up and is watching the crane, not you.',
      id: 'Jalur pejalan kakimu memotong jalur truk di sini. Ada truk kontainer sekitar 40 m lagi. Sopirnya duduk tinggi dan sedang melihat crane, bukan kamu.',
    },
    options: [
      { en: 'Cross now. 40 m is plenty.', id: 'Seberang sekarang. 40 m cukup jauh.', correct: false, replay: 'cross' },
      { en: 'Jog across before it gets closer.', id: 'Lari kecil sebelum makin dekat.', correct: false, replay: 'cross' },
      { en: 'Stop at the yellow line. Wait until the driver looks at you and waves you across.', id: 'Berhenti di garis kuning. Tunggu sampai sopir melihatmu dan memberi isyarat menyeberang.', correct: true },
    ],
    why: {
      en: 'A loaded truck needs tens of metres to stop, and the driver cannot see the ground right next to the cab. Until the driver looks at you and waves, assume they have not seen you.',
      id: 'Truk bermuatan butuh puluhan meter untuk berhenti, dan sopir tidak bisa melihat tanah tepat di samping kabin. Selama sopir belum menatapmu dan melambai, anggap dia belum melihatmu.',
    },
    rule: {
      name: 'UU No. 1/1970 (Keselamatan Kerja) · keeping people and vehicles apart',
      en: 'The workplace must keep people on foot apart from moving vehicles. You cross only at the marked crossing, and only when it is safe.',
      id: 'Tempat kerja wajib memisahkan pejalan kaki dari kendaraan yang bergerak. Menyeberang hanya di titik yang ditandai, dan hanya saat aman.',
    },
  },
  {
    id: 'load',
    action: { type: 'hold', key: 'KeyE', seconds: 1.4, label: { en: 'Hold E: radio the crane driver and wait for the container to land', id: 'Tahan E: radio operator crane, tunggu kontainer turun' } },
    zone: { x: 0, z: -3, r: 2.6 },
    objective: { en: 'Walk to the container crane', id: 'Jalan ke crane kontainer' },
    title: { en: 'A container is hanging over your path', id: 'Kontainer menggantung di atas jalurmu' },
    situation: {
      en: 'A crane is holding a 12 m container about 7 m in the air, right above the path you need to take. Walking around the stacks takes three extra minutes.',
      id: 'Sebuah crane sedang mengangkat kontainer 12 m sekitar 7 m di udara, tepat di atas jalur yang harus kamu lewati. Memutar lewat tumpukan butuh tiga menit lebih lama.',
    },
    options: [
      { en: 'Walk under it quickly. It is not moving.', id: 'Lewat di bawahnya cepat-cepat. Bebannya diam.', correct: false, replay: 'load' },
      { en: 'Wait well clear until the container is set down, or take the marked detour.', id: 'Tunggu di jarak aman sampai kontainer diturunkan, atau ambil jalan memutar yang ditandai.', correct: true },
      { en: 'Wave at the operator and go. They will stop for you.', id: 'Lambaikan tangan ke operator lalu jalan. Mereka pasti berhenti.', correct: false, replay: 'load' },
    ],
    why: {
      en: 'The container hangs on four locks and steel cables. If one fails, about 30 tonnes drop with no warning. Nobody walks under a hanging load, not even for a second.',
      id: 'Kontainer itu tergantung pada empat kunci dan kabel baja. Kalau satu gagal, sekitar 30 ton jatuh tanpa peringatan. Jangan pernah lewat di bawah beban yang menggantung, sedetik pun.',
    },
    rule: {
      name: 'Permenaker No. 8/2020 (K3 Pesawat Angkat dan Pesawat Angkut)',
      en: 'Nobody may stand or walk under a load that is being lifted. The area under the crane must stay empty.',
      id: 'Dilarang berdiri atau lewat di bawah beban yang sedang diangkat. Area di bawah crane harus kosong.',
    },
  },
  {
    id: 'height',
    action: { type: 'hold', key: 'KeyE', seconds: 1.8, label: { en: 'Hold E: clip on your harness and check the platform', id: 'Tahan E: kaitkan harness, cek platform' } },
    zone: { x: 0, z: -24, r: 2.6 },
    objective: { en: 'Check the seal on container stack B-7', id: 'Periksa segel di tumpukan kontainer B-7' },
    title: { en: 'Check a seal two containers up', id: 'Cek segel di kontainer tingkat dua' },
    situation: {
      en: 'You need to read the seal (the numbered tag on the door) of the top container, 5 m up. There is no ladder nearby. The steel corners of the containers look easy to climb.',
      id: 'Kamu harus membaca segel (label bernomor di pintu) pada kontainer paling atas, 5 m di atas. Tidak ada tangga di dekat sini. Sudut besi kontainer kelihatan gampang dipanjat.',
    },
    options: [
      { en: 'Climb the corners. It is only two containers high.', id: 'Panjat sudutnya. Cuma dua kontainer.', correct: false, replay: 'height' },
      { en: 'Radio for a lift platform, or a ladder with someone holding it. Wear a harness above 1.8 m.', id: 'Radio minta platform angkat, atau tangga yang dipegangi orang. Pakai harness di atas 1,8 m.', correct: true },
      { en: 'Stand on the forklift forks, the driver will lift you.', id: 'Berdiri di garpu forklift, biar pengemudi angkat.', correct: false, replay: 'height' },
    ],
    why: {
      en: 'In logistics, most deadly falls happen from 2 to 6 m, about this high. Container roofs are slippery and have no railing.',
      id: 'Di logistik, kebanyakan jatuh yang mematikan terjadi dari 2 sampai 6 m, kira-kira setinggi ini. Atap kontainer licin dan tidak ada pagar.',
    },
    rule: {
      name: 'Permenaker No. 9/2016 (K3 Pekerjaan pada Ketinggian)',
      en: 'Any work higher than 1.8 m needs a proper way up (a platform or a secured ladder) and a harness. Climbing whatever is there is not allowed.',
      id: 'Kerja di atas 1,8 m wajib memakai akses yang layak (platform atau tangga yang aman) dan harness. Memanjat seadanya tidak diizinkan.',
    },
  },
  {
    id: 'report',
    action: { type: 'hold', key: 'KeyE', seconds: 2.0, label: { en: 'Hold E: fill in the near-miss form', id: 'Tahan E: isi form near miss' } },
    zone: { x: 0, z: -38, r: 2.8 },
    objective: { en: 'End of shift: go to the site office', id: 'Akhir shift: ke kantor lapangan' },
    title: { en: 'Shift over. Do you report the near miss?', id: 'Shift selesai. Lapor near miss atau tidak?' },
    situation: {
      en: 'Earlier at the crossing, a truck stopped much closer to you than it should have. Nobody got hurt. That is a near miss: an accident that almost happened. The report takes ten minutes, and your supervisor hates paperwork.',
      id: 'Tadi di penyeberangan, truk berhenti jauh lebih dekat denganmu dari seharusnya. Tidak ada yang terluka. Itu namanya near miss: kecelakaan yang hampir terjadi. Laporannya butuh sepuluh menit, dan supervisormu tidak suka urusan kertas.',
    },
    options: [
      { en: 'Nothing happened. Go home.', id: 'Tidak terjadi apa-apa. Pulang.', correct: false, replay: 'report' },
      { en: 'Mention it to a coworker, skip the form.', id: 'Cerita ke teman kerja, lewati form.', correct: false, replay: 'report' },
      { en: 'File the near-miss report: time, lane and truck number.', id: 'Isi laporan near miss: jam, jalur dan nomor truk.', correct: true },
    ],
    why: {
      en: 'A near miss shows you where the next accident will happen. If nobody reports it, the same lane and the same blind spot are still there for the next person.',
      id: 'Near miss menunjukkan di mana kecelakaan berikutnya akan terjadi. Kalau tidak dilaporkan, jalur yang sama dan titik buta yang sama tetap menunggu orang berikutnya.',
    },
    rule: {
      name: 'PP No. 50/2012 (SMK3) · incident and near-miss reporting',
      en: 'Companies must record near misses and accidents, find out why they happened, and fix the cause.',
      id: 'Perusahaan wajib mencatat near miss dan kecelakaan, mencari penyebabnya, dan memperbaikinya.',
    },
  },
];

const OPERATOR = [
  {
    id: 'prestart',
    zone: { x: 0, z: 43, r: 2.6 },
    objective: { en: 'Walk to the reach stacker and start your shift', id: 'Jalan ke reach stacker dan mulai shift' },
    title: { en: 'Before you drive: the machine is already running', id: 'Sebelum jalan: mesin sudah menyala' },
    situation: { en: 'You drive a reach stacker, a 45-tonne machine that lifts and stacks containers. The night driver left it running and did not fill in the safety checklist. Dispatch wants the first container moved in four minutes.', id: 'Kamu mengemudikan reach stacker, mesin 45 ton untuk mengangkat dan menumpuk kontainer. Sopir shift malam meninggalkannya menyala dan tidak mengisi checklist keselamatan. Dispatch minta kontainer pertama dipindah dalam empat menit.' },
    options: [
      { en: 'Climb in and go. It ran all night, it is fine.', id: 'Naik dan jalan. Semalaman jalan, pasti aman.', correct: false, replay: 'cross', captions: { en: ['Nobody tested the brakes after the night shift.', 'With weak brakes, a 45 t machine needs 30 m to stop.', 'The walkway was only 12 m away.'], id: ['Tidak ada yang mengecek rem setelah shift malam.', 'Dengan rem lemah, mesin 45 t butuh 30 m untuk berhenti.', 'Jalur pejalan hanya 12 m.'] } },
      { en: 'Walk around it first: tyres, brakes, horn, mirrors, lifting arm. Then log it.', id: 'Keliling cek dulu: ban, rem, klakson, spion, lengan angkat. Lalu catat.', correct: true },
      { en: 'Ask dispatch to check it later. Move the container first.', id: 'Minta dispatch cek nanti. Pindahkan kontainer dulu.', correct: false, replay: 'cross', captions: { en: ['The check that was going to happen later.', 'The brakes were at 60%. Nobody knew.', 'Someone is hit on the walkway.'], id: ['Pemeriksaan yang "nanti saja".', 'Rem tinggal 60%. Tidak ada yang tahu.', 'Seseorang tertabrak di jalur pejalan kaki.'] } },
    ],
    action: { type: 'hold', key: 'KeyE', seconds: 2.0, label: { en: 'Hold E: walk around and check the machine', id: 'Tahan E: keliling cek mesin' } },
    why: { en: 'It is the heaviest thing that moves in the yard. This quick check before you drive is the only time anyone tests its brakes today.', id: 'Ini benda terberat yang bergerak di lapangan. Cek singkat sebelum jalan ini satu-satunya saat remnya diuji hari ini.' },
    rule: { name: 'Permenaker No. 8/2020 · operator pre-use inspection', en: 'The driver must check a lifting machine before every use and report anything that is broken.', id: 'Operator wajib memeriksa alat angkat sebelum setiap pemakaian dan melaporkan yang rusak.' },
  },
  {
    id: 'blindspot',
    zone: { x: 0, z: 25.5, r: 2.6 },
    objective: { en: 'Drive to the lane crossing', id: 'Kemudikan ke penyeberangan jalur' },
    title: { en: 'Somebody is in your blind spot', id: 'Ada orang di titik butamu' },
    situation: { en: 'You are carrying a container lifted high, so you cannot see the ground in front of you. A worker in an orange vest just disappeared from your left mirror, near the crossing.', id: 'Kamu membawa kontainer yang terangkat tinggi, jadi tanah di depanmu tidak terlihat. Seorang pekerja berompi oranye baru saja hilang dari spion kiri, dekat penyeberangan.' },
    options: [
      { en: 'Keep rolling slowly, they will step back.', id: 'Terus jalan pelan, mereka pasti mundur.', correct: false, replay: 'cross', captions: { en: ['With the container raised, you cannot see the 3 m in front of you.', 'Slowly is still 5 km/h and 60 tonnes.', 'Run over at walking speed.'], id: ['Dengan kontainer terangkat, 3 m di depanmu tidak terlihat.', 'Pelan tetap 5 km/jam dan 60 ton.', 'Terlindas dalam kecepatan jalan kaki.'] } },
      { en: 'Stop, sound the horn, and wait until you see them safe and they wave.', id: 'Berhenti, bunyikan klakson, tunggu sampai mereka terlihat aman dan melambai.', correct: true },
      { en: 'Lower the container fast so you can see.', id: 'Turunkan kontainer cepat supaya kelihatan.', correct: false, replay: 'load', captions: { en: ['You lower it fast. Someone is underneath.', 'The machine cannot see who is below.', '30 t lands on a person.'], id: ['Kamu menurunkannya cepat. Ada orang di bawah.', 'Mesin tidak bisa melihat siapa di bawah.', '30 t menimpa seseorang.'] } },
    ],
    action: { type: 'timing', key: 'Space', label: { en: 'Press SPACE when the worker waves you on', id: 'Tekan SPASI saat pekerja itu melambai' }, window: [0.55, 0.72] },
    why: { en: 'Stop, horn, eye contact, wave. Skip any one of those four and you are only guessing where that person is.', id: 'Berhenti, klakson, kontak mata, lambaian. Lewatkan satu saja, dan kamu hanya menebak di mana orang itu berada.' },
    rule: { name: 'UU No. 1/1970 · vehicles and people on foot', en: 'If someone might be in your path, stop. Sound the horn and see them clear before you move.', id: 'Kalau mungkin ada orang di jalurmu, berhenti. Bunyikan klakson dan pastikan mereka sudah aman sebelum bergerak.' },
  },
  {
    id: 'wind',
    zone: { x: 0, z: -3, r: 2.6 },
    objective: { en: 'Stack the container at block B', id: 'Tumpuk kontainer di blok B' },
    title: { en: 'Strong wind, and the plan says stack it three high', id: 'Angin kencang, rencana minta tumpuk tiga tingkat' },
    situation: { en: 'The wind meter on the light pole shows 14 m/s, with stronger gusts. That is strong wind. The plan says put this container on top of two others. It is empty, so it is light and the wind catches it easily.', id: 'Pengukur angin di tiang lampu menunjukkan 14 m/s, dengan hembusan yang lebih kencang. Itu angin kencang. Rencananya kontainer ini ditaruh di atas dua kontainer lain. Kontainernya kosong, jadi ringan dan mudah terbawa angin.' },
    options: [
      { en: 'Stack it. Empty ones are easy.', id: 'Tumpuk saja. Yang kosong gampang.', correct: false, replay: 'load', captions: { en: ['An empty container catches wind like a 30 m² sail.', 'A gust catches it 8 m up.', 'It falls on whoever is below.'], id: ['Kontainer kosong menangkap angin seperti layar 30 m².', 'Hembusan angin menangkapnya di ketinggian 8 m.', 'Jatuh menimpa siapa pun di bawah.'] } },
      { en: 'Keep it on the ground, call the planner, and stack no higher than two until the wind drops.', id: 'Taruh di bawah dulu, hubungi planner, dan jangan tumpuk lebih dari dua sampai angin reda.', correct: true },
      { en: 'Stack it fast between gusts.', id: 'Tumpuk cepat di sela hembusan.', correct: false, replay: 'load', captions: { en: ['You cannot know when the next gust comes.', 'The container twists and one corner comes loose.', 'It falls from three containers high.'], id: ['Kamu tidak bisa tahu kapan hembusan berikutnya datang.', 'Kontainer terpuntir dan satu sudutnya lepas.', 'Jatuh dari ketinggian tiga kontainer.'] } },
    ],
    action: { type: 'hold', key: 'KeyE', seconds: 1.6, label: { en: 'Hold E: set the container down and stop stacking', id: 'Tahan E: turunkan kontainer, hentikan penumpukan' } },
    why: { en: 'An empty container is like a big sail. High up, a gust can swing it or tear it loose. The people below cannot see the gust coming, so there are wind limits for how high you may stack.', id: 'Kontainer kosong seperti layar besar. Di ketinggian, hembusan angin bisa mengayunkan atau melepasnya. Orang di bawah tidak bisa melihat hembusan datang, jadi ada batas angin untuk tinggi tumpukan.' },
    rule: { name: 'Permenaker No. 8/2020 · environmental limits for lifting', en: 'Lifting must stop when the wind is stronger than the machine or the site allows.', id: 'Pengangkatan wajib berhenti kalau angin lebih kencang dari batas alat atau lokasi.' },
  },
];

const LASHING = [
  {
    id: 'gangway',
    zone: { x: 0, z: -62, r: 2.8 },
    objective: { en: 'Walk up the gangway onto the ship', id: 'Naik ke kapal lewat gangway' },
    title: { en: 'The net under the gangway is missing', id: 'Jaring di bawah gangway tidak ada' },
    situation: { en: 'The gangway is the steep walkway from the quay up to the ship. A safety net should hang under it, but the net is lying in a pile on the ground. The tide is high, so the walkway is extra steep. Your foreman is already on board, waving you up.', id: 'Gangway adalah jalan miring dari dermaga naik ke kapal. Seharusnya ada jaring pengaman di bawahnya, tapi jaringnya tergeletak di tanah. Air sedang pasang, jadi jalannya makin curam. Mandormu sudah di atas kapal dan melambai menyuruhmu naik.' },
    options: [
      { en: 'Go up carefully, hold both rails.', id: 'Naik hati-hati, pegang kedua pegangan.', correct: false, replay: 'height', captions: { en: ['Wet metal, a steep slope, no net.', 'One slip, into the gap between ship and quay.', 'The next wave pushes the ship against the quay.'], id: ['Logam basah, miring curam, tanpa jaring.', 'Sekali terpeleset, masuk ke celah antara kapal dan dermaga.', 'Gelombang berikutnya mendorong kapal ke dermaga.'] } },
      { en: 'Do not go up until the net is hung and the walkway is less steep.', id: 'Jangan naik sampai jaring dipasang dan jalannya tidak terlalu curam.', correct: true },
      { en: 'Use the rope ladder on the side of the ship instead. It is quicker.', id: 'Pakai tangga tali di sisi kapal saja. Lebih cepat.', correct: false, replay: 'height', captions: { en: ['That ladder is meant for climbing up from a small boat on the water.', 'Here it is 12 m of rope over concrete.', 'Fall onto the quay edge.'], id: ['Tangga itu untuk naik dari perahu kecil di air.', 'Di sini, 12 m tali di atas beton.', 'Jatuh ke tepi dermaga.'] } },
    ],
    action: { type: 'hold', key: 'KeyE', seconds: 1.8, label: { en: 'Hold E: hang the net with the crew', id: 'Tahan E: pasang jaring bersama kru' } },
    why: { en: 'Falling into the gap between the ship and the quay is the most common deadly fall at a terminal. The net is what catches you.', id: 'Jatuh ke celah antara kapal dan dermaga adalah jatuh mematikan yang paling sering di terminal. Jaring itulah yang menangkapmu.' },
    rule: { name: 'Permenaker No. 9/2016 · access and fall protection', en: 'Any walkway over a place where you could fall needs rails and a safety net, or something just as safe.', id: 'Setiap jalan di atas tempat yang bisa membuatmu jatuh wajib punya pegangan dan jaring pengaman, atau yang setara.' },
  },
  {
    id: 'snapback',
    zone: { x: 0, z: -96, r: 2.8 },
    objective: { en: 'Walk along the quay to the lashing station', id: 'Jalan menyusuri dermaga ke pos lashing' },
    title: { en: 'A mooring rope is pulled tight across your path', id: 'Tali tambat tegang melintang di jalurmu' },
    situation: { en: 'Thick ropes tie the ship to the quay. The one at the back is pulled so tight it hums. If it snaps, it whips across the striped area painted on the ground, and your path goes right through it. Going around takes one more minute.', id: 'Tali tebal mengikat kapal ke dermaga. Tali di bagian belakang ditarik sangat kencang sampai berdengung. Kalau putus, tali itu menyabet area bergaris yang dicat di tanah, dan jalurmu lewat tepat di situ. Memutar butuh satu menit lebih lama.' },
    options: [
      { en: 'Walk through quickly. Ropes rarely snap.', id: 'Lewat cepat. Tali jarang putus.', correct: false, replay: 'snapback' },
      { en: 'Stay out of the striped area. Wait for the winch to loosen the rope, then pass behind the mooring post.', id: 'Jangan masuk area bergaris. Tunggu winch mengendurkan tali, lalu lewat di belakang tiang tambat.', correct: true },
      { en: 'Duck under the rope.', id: 'Merunduk di bawah tali.', correct: false, replay: 'snapback' },
    ],
    action: { type: 'timing', key: 'Space', label: { en: 'Press SPACE when the winch eases and the rope drops', id: 'Tekan SPASI saat winch mengendur dan tali turun' }, window: [0.6, 0.78] },
    why: { en: 'A snapping rope moves faster than you can see. The striped area marks where it would hit, and people have died there.', id: 'Tali yang putus bergerak lebih cepat dari yang bisa kamu lihat. Area bergaris menandai tempat tali itu akan menghantam, dan sudah ada orang yang tewas di situ.' },
    rule: { name: 'PP No. 50/2012 (SMK3) · hazard zoning', en: 'Known danger zones must be marked, and entry into them must be controlled.', id: 'Zona bahaya yang sudah diketahui wajib ditandai, dan akses masuknya dikendalikan.' },
  },
  {
    id: 'lashcage',
    zone: { x: 0, z: -106, r: 2.8 },
    objective: { en: 'Secure the top containers on the ship', id: 'Kencangkan kontainer paling atas di kapal' },
    title: { en: 'Work at the top of the stack: safety cage or climb?', id: 'Kerja di puncak tumpukan: cage pengaman atau panjat?' },
    situation: { en: 'You need to fit the steel bars that tie the containers down, 14 m up. The safety cage (a box with rails that the crane lifts you in) is at the other crane, ten minutes away. The crane driver offers to lift you up standing on the crane\'s lifting frame instead.', id: 'Kamu harus memasang batang besi pengikat kontainer, 14 m di atas. Cage pengaman (kotak berpagar yang diangkat crane) ada di crane lain, sepuluh menit dari sini. Operator crane menawarkan mengangkatmu sambil berdiri di rangka pengangkat crane.' },
    options: [
      { en: 'Ride the lifting frame. It is faster.', id: 'Naik rangka pengangkat. Lebih cepat.', correct: false, replay: 'height', captions: { en: ['Standing on the crane frame 14 m up, no cage, no harness.', 'The crane stops suddenly. You keep moving.', '14 m onto the deck.'], id: ['Berdiri di rangka crane 14 m di atas, tanpa cage, tanpa harness.', 'Crane berhenti mendadak. Tubuhmu terus terlempar.', '14 m ke dek.'] } },
      { en: 'Wait for the cage, clip on your harness, work from inside the rails.', id: 'Tunggu cage, kaitkan harness, kerja dari dalam pagar.', correct: true },
      { en: 'Climb the container ladder with the 20 kg bar on your shoulder.', id: 'Panjat tangga kontainer sambil memanggul batang 20 kg.', correct: false, replay: 'height', captions: { en: ['A 20 kg steel bar and only one free hand.', 'The steps are wet. The bar swings.', 'A fall from four containers high.'], id: ['Batang besi 20 kg dan hanya satu tangan bebas.', 'Anak tangga basah. Batangnya berayun.', 'Jatuh dari ketinggian empat kontainer.'] } },
    ],
    action: { type: 'hold', key: 'KeyE', seconds: 2.0, label: { en: 'Hold E: clip on and work from the cage', id: 'Tahan E: kaitkan harness, kerja dari cage' } },
    why: { en: 'Riding the lifting frame is the most common shortcut on deck. It is also how lashing crews most often die.', id: 'Naik rangka pengangkat adalah jalan pintas paling umum di dek. Itu juga cara paling sering kru lashing tewas.' },
    rule: { name: 'Permenaker No. 9/2016 · work at height on vessels', en: 'Work up high needs a proper platform (the cage) and a harness. Riding on loads or on lifting gear is not allowed.', id: 'Kerja di ketinggian wajib pakai platform yang layak (cage) dan harness. Menumpang di beban atau alat angkat dilarang.' },
  },
];

export const ROLES = [
  { id: 'checker', icon: 'ic-hat', name: { en: 'Yard checker', id: 'Checker lapangan' }, tag: { en: 'On foot · 5 checkpoints', id: 'Jalan kaki · 5 checkpoint' },
    blurb: { en: 'Your first day on foot in the container yard: the gate, the truck lane, the cranes, the stacks and the office.', id: 'Hari pertamamu jalan kaki di lapangan kontainer: gerbang, jalur truk, crane, tumpukan dan kantor.' },
    spawn: { x: 0, z: 48, yaw: 0 }, hazards: CHECKER },
  { id: 'operator', icon: 'ic-truck', name: { en: 'Reach stacker operator', id: 'Operator reach stacker' }, tag: { en: 'Heavy equipment · 3 checkpoints', id: 'Alat berat · 3 checkpoint' },
    blurb: { en: 'You drive a 45-tonne machine that stacks containers. Check it, watch your blind spots, mind the wind.', id: 'Kamu mengemudikan mesin 45 ton penumpuk kontainer. Cek mesinnya, awasi titik buta, perhatikan angin.' },
    spawn: { x: 0, z: 48, yaw: 0 }, hazards: OPERATOR },
  { id: 'lashing', icon: 'ic-ship', name: { en: 'Lashing crew', id: 'Kru lashing' }, tag: { en: 'Quay & vessel · 3 checkpoints', id: 'Dermaga & kapal · 3 checkpoint' },
    blurb: { en: 'You work on the ship: the walkway up, the mooring ropes, the top of the container stack.', id: 'Kamu bekerja di kapal: jalan naik ke kapal, tali tambat, dan puncak tumpukan kontainer.' },
    spawn: { x: 0, z: -52, yaw: 0 }, hazards: LASHING },
  ...MODE_ROLES,
];
export const HAZARDS = CHECKER;

// What the start screen shows for the selected role: a screenshot, the keys that matter, and the start label.
const WALK_KEYS = { en: [['W A S D', 'walk'], ['Mouse', 'look'], ['A B C', 'decide']], id: [['W A S D', 'jalan'], ['Mouse', 'lihat'], ['A B C', 'putuskan']] };
export const PREVIEW = {
  checker: { shot: '/screenshots/decision.jpg', keys: WALK_KEYS, go: { en: 'Start shift', id: 'Mulai shift' } },
  operator: { shot: '/screenshots/role-operator.jpg', keys: WALK_KEYS, go: { en: 'Start shift', id: 'Mulai shift' } },
  lashing: { shot: '/screenshots/quay.jpg', keys: WALK_KEYS, go: { en: 'Start shift', id: 'Mulai shift' } },
  driver: { shot: '/screenshots/mode-driver.jpg', keys: { en: [['W S', 'gas, brake'], ['A D', 'steer'], ['V', 'cab']], id: [['W S', 'gas, rem'], ['A D', 'setir'], ['V', 'kabin']] }, go: { en: 'Start driving', id: 'Mulai menyetir' } },
  crane: { shot: '/screenshots/mode-crane.jpg', keys: { en: [['W S', 'move crane'], ['R F', 'lift / lower'], ['Space', 'locks']], id: [['W S', 'geser crane'], ['R F', 'naik / turun'], ['Space', 'kunci']] }, go: { en: 'Start lifting', id: 'Mulai mengangkat' } },
  signal: { shot: '/screenshots/mode-signal.jpg', keys: { en: [['1 2 3 4', 'signal'], ['Space', 'all-stop']], id: [['1 2 3 4', 'isyarat'], ['Space', 'stop total']] }, go: { en: 'Start signalling', id: 'Mulai memandu' } },
  inspect: { shot: '/screenshots/mode-inspect.jpg', keys: { en: [['W A S D', 'walk'], ['Mouse', 'look'], ['F', 'flag']], id: [['W A S D', 'jalan'], ['Mouse', 'lihat'], ['F', 'tandai']] }, go: { en: 'Start inspecting', id: 'Mulai inspeksi' } },
  evac: { shot: '/screenshots/mode-evac.jpg', keys: { en: [['W A S D', 'walk'], ['E', 'radio']], id: [['W A S D', 'jalan'], ['E', 'radio']] }, go: { en: 'Start the drill', id: 'Mulai latihan' } },
};

export const STRINGS = {
  roleTitle: { en: 'Pick your shift', id: 'Pilih shift-mu' },
  groupWalk: { en: 'On foot · decide A/B/C', id: 'Jalan kaki · pilih A/B/C' },
  groupHands: { en: 'At the controls', id: 'Pegang kendali' },
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
    en: 'Your first shift at a container terminal, in the browser. No headset. Walk the yard and make the calls a new worker makes every day, or take the controls of a truck, a crane, the signals. Get one wrong and the sim does not just tell you. It shows you.',
    id: 'Shift pertamamu di terminal kontainer, langsung di browser. Tanpa headset. Jalani lapangan dan ambil keputusan yang dihadapi pekerja baru tiap hari, atau pegang kendali truk, crane, dan isyarat. Kalau salah, sim tidak sekadar memberi tahu. Sim memperlihatkannya.',
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
  disclaimer: {
    en: 'A training aid, not a site induction. Regulation names are real; the one-line summaries are our paraphrase and have not been reviewed by a K3 practitioner. On a real site, follow your induction and your supervisor.',
    id: 'Alat bantu latihan, bukan pengganti induksi K3 di lokasi. Nama regulasi asli; ringkasan satu barisnya adalah parafrase kami dan belum direview praktisi K3. Di lapangan, ikuti induksi dan arahan supervisor.',
  },
  hint: { en: 'WASD walk · mouse look · V view · Esc release mouse', id: 'WASD jalan · mouse lihat · V sudut pandang · Esc lepas mouse' },
  hintClick: { en: 'Click to resume', id: 'Klik untuk lanjut' },
  passed: { en: 'SAFE CALL', id: 'KEPUTUSAN AMAN' },
  nearMiss: { en: 'NEAR MISS: THIS IS WHAT WOULD HAVE HAPPENED', id: 'NEAR MISS: INI YANG AKAN TERJADI' },
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
