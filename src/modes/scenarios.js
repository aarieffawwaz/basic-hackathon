// Checkpoints for the hands-on modes. Same shape as scenario.js hazards minus the A/B/C
// (the controls are the decision), except where a mode still asks a question (evac).
// Rule names are real Indonesian regulations; wording is paraphrased, not quoted.

const DRIVE = [
  {
    id: 'speed',
    objective: { en: 'Drive past the speed radar at 15 km/h or less', id: 'Lewati radar kecepatan, maks. 15 km/jam' },
    title: { en: 'Speed limit: 15 km/h in the yard', id: 'Batas kecepatan: 15 km/jam di lapangan' },
    why: { en: 'Go twice as fast and you need about four times the distance to stop. At 15 km/h a loaded truck stops in about 5 m. At 30 km/h it needs closer to 15 m, and in a yard people step out from behind containers all the time.', id: 'Kalau kecepatan naik dua kali, jarak henti naik sekitar empat kali. Di 15 km/jam truk bermuatan berhenti dalam sekitar 5 m. Di 30 km/jam butuh hampir 15 m, padahal di lapangan orang sering muncul dari balik kontainer.' },
    rule: { name: 'Permenaker No. 8/2020 · pesawat angkutan', en: 'Drivers must keep to the site limits, including the speed limit.', id: 'Pengemudi wajib mematuhi batas di lokasi, termasuk batas kecepatan.' },
  },
  {
    id: 'zebra',
    objective: { en: 'Stop for the person at the zebra crossing', id: 'Berhenti untuk orang di zebra cross' },
    title: { en: 'Zebra crossing: a worker is crossing', id: 'Zebra cross: ada pekerja menyeberang' },
    why: { en: 'A person on the crossing always goes first. Stop before the white line and wait until they have crossed and have looked at you.', id: 'Orang di zebra cross selalu didahulukan. Berhenti sebelum garis putih, tunggu sampai mereka sudah lewat dan sudah melihatmu.' },
    rule: { name: 'UU No. 1/1970 · keeping people and vehicles apart', en: 'The employer must stop vehicles and people on foot from running into each other. At a marked crossing, people on foot go first.', id: 'Perusahaan wajib mencegah kendaraan dan pejalan kaki saling bertabrakan. Di penyeberangan bertanda, pejalan kaki didahulukan.' },
  },
  {
    id: 'rtg',
    objective: { en: 'Drive under the crane and wait for its light', id: 'Masuk ke bawah crane dan tunggu lampunya' },
    title: { en: 'Red light under the crane: a container is coming down', id: 'Lampu merah di bawah crane: kontainer sedang turun' },
    why: { en: 'The crane driver sits high up and lowers containers without seeing the ground under them. The red light is your only warning that something is coming down there.', id: 'Operator crane duduk tinggi dan menurunkan kontainer tanpa melihat tanah di bawahnya. Lampu merah satu-satunya tanda bahwa ada yang sedang turun di situ.' },
    rule: { name: 'Permenaker No. 8/2020 · pesawat angkat', en: 'No person or vehicle may be under a hanging load. Entry to the lifting area must be controlled.', id: 'Tidak boleh ada orang atau kendaraan di bawah beban yang menggantung. Masuk ke area angkat wajib diatur.' },
  },
];

const CRANE = [
  {
    id: 'locks',
    objective: { en: 'Close all four corner locks, then lift', id: 'Kunci keempat sudut, lalu angkat' },
    title: { en: 'Corner locks: all four green before you lift', id: 'Kunci sudut: keempatnya hijau sebelum mengangkat' },
    why: { en: 'The crane holds a container by four locks, one in each corner. From the cab, three locks feel the same as four. You only find out when the container tips over someone.', id: 'Crane memegang kontainer dengan empat kunci, satu di tiap sudut. Dari kabin, tiga kunci terasa sama dengan empat. Kamu baru tahu saat kontainer miring di atas seseorang.' },
    rule: { name: 'Permenaker No. 8/2020 · alat bantu angkat', en: 'Before every lift, the operator must check that the load is attached properly.', id: 'Sebelum setiap pengangkatan, operator wajib memastikan beban terpasang dengan benar.' },
  },
  {
    id: 'people',
    objective: { en: 'Move the container to the truck at bay 24, never over people', id: 'Bawa kontainer ke truk di bay 24, jangan lewat di atas orang' },
    title: { en: 'Never carry a load over a person', id: 'Jangan bawa beban melewati orang' },
    why: { en: 'Stop, sound the horn and wait. If the load never goes over anyone, it cannot fall on anyone.', id: 'Berhenti, bunyikan klakson dan tunggu. Kalau beban tidak pernah lewat di atas orang, beban itu tidak bisa jatuh menimpa siapa pun.' },
    rule: { name: 'Permenaker No. 8/2020 · pesawat angkat', en: 'Loads must not be moved over people. The operator must warn them and wait until the way is clear.', id: 'Beban tidak boleh dipindahkan di atas orang. Operator wajib memberi peringatan dan menunggu sampai jalurnya kosong.' },
  },
  {
    id: 'land',
    objective: { en: 'Set the container on the truck, slow and steady', id: 'Turunkan kontainer ke truk, pelan dan stabil' },
    title: { en: 'Landing: stop the swinging, then lower slowly', id: 'Pendaratan: hentikan ayunan, lalu turunkan pelan' },
    why: { en: 'A swinging container is 30 t on a rope. Wait up high until it stops swinging, then lower it slowly (under 0.6 m/s). The truck driver is sitting right below.', id: 'Kontainer yang berayun itu 30 t di ujung tali. Tunggu di atas sampai ayunannya berhenti, lalu turunkan pelan (di bawah 0,6 m/s). Sopir truk duduk tepat di bawahnya.' },
    rule: { name: 'Permenaker No. 8/2020 · SIO operator', en: 'Only licensed operators may lift, and only within the wind and speed limits of the crane.', id: 'Hanya operator berlisensi (SIO) yang boleh mengangkat, dan hanya dalam batas angin dan kecepatan crane.' },
  },
];

const SIGNAL = [
  {
    id: 'stand',
    objective: { en: 'Stand in the green box, then start signalling', id: 'Berdiri di kotak hijau, lalu mulai beri isyarat' },
    title: { en: 'Where the signaller stands', id: 'Tempat juru isyarat berdiri' },
    why: { en: 'Stand where the crane driver can see you, and away from where the load moves. If you stand under the container to see better, you are what it lands on.', id: 'Berdiri di tempat yang terlihat oleh operator crane, dan jauh dari jalur beban. Kalau kamu berdiri di bawah kontainer supaya lebih jelas, kamulah yang tertimpa.' },
    rule: { name: 'Permenaker No. 8/2020 · juru isyarat', en: 'The signaller must stay where the operator can see them, and away from where the load could fall.', id: 'Juru isyarat wajib berada di tempat yang terlihat operator, dan jauh dari tempat beban bisa jatuh.' },
  },
  {
    id: 'intruder',
    objective: { en: 'Guide the container to the truck. Stop it if anyone walks in', id: 'Pandu kontainer ke truk. Hentikan kalau ada yang masuk' },
    title: { en: 'Someone walks into the path: STOP', id: 'Ada yang masuk jalur: STOP' },
    why: { en: 'The crane driver cannot see the ground under the container. You can. Stop everything first, then deal with the person.', id: 'Operator crane tidak bisa melihat tanah di bawah kontainer. Kamu bisa. Hentikan semuanya dulu, baru urus orangnya.' },
    rule: { name: 'Permenaker No. 8/2020 · pesawat angkat', en: 'If anyone is in the path, the lift stops. The signaller is allowed to stop it.', id: 'Kalau ada orang di jalur, pengangkatan berhenti. Juru isyarat berhak menghentikannya.' },
  },
  {
    id: 'driver',
    objective: { en: 'Get the driver to safety, then lower onto the truck', id: 'Amankan sopir, lalu turunkan ke truk' },
    title: { en: 'The truck driver got out during landing', id: 'Sopir truk turun saat pendaratan' },
    why: { en: 'A driver standing next to the truck is between 30 t and the trailer. Wave them to the safe zone first, then bring the container down.', id: 'Sopir yang berdiri di samping truk berada di antara 30 t dan trailer. Arahkan dia ke zona aman dulu, baru turunkan kontainer.' },
    rule: { name: 'Permenaker No. 8/2020 · zona angkat', en: 'People must stay away from where the load lands until it is down and unhooked.', id: 'Orang wajib menjauh dari tempat beban mendarat sampai beban turun dan dilepas.' },
  },
];

const INSPECT = [
  {
    id: 'nohelmet', replay: 'ppe',
    objective: { en: 'Find the hazards before the shift starts', id: 'Temukan bahaya sebelum shift dimulai' },
    title: { en: 'Worker at the gate without a helmet', id: 'Pekerja di gerbang tanpa helm' },
    why: { en: 'Small steel parts can fall from the cranes. The helmet goes on before the gate, not after.', id: 'Bagian besi kecil bisa jatuh dari crane. Helm dipakai sebelum gerbang, bukan sesudah.' },
    rule: { name: 'Permenaker No. 8/2010 (APD)', en: 'Safety gear must be worn wherever the site requires it.', id: 'APD wajib dipakai di area yang mewajibkan.' },
  },
  {
    id: 'phone', replay: 'cross',
    captions: { en: ['A worker on the phone, standing in the truck lane.', 'The truck driver is watching the crane and needs 20 m to stop.', 'Head down, earbud in. Hit.'], id: ['Seorang pekerja menelepon, berdiri di jalur truk.', 'Sopir truk sedang melihat crane dan butuh 20 m untuk berhenti.', 'Kepala menunduk, earbud terpasang. Tertabrak.'] },
    objective: { en: 'Find the hazards before the shift starts', id: 'Temukan bahaya sebelum shift dimulai' },
    title: { en: 'Worker on the phone in the truck lane', id: 'Pekerja menelepon di jalur truk' },
    why: { en: 'Nobody stands in a lane where trucks are driving. Take calls behind the barrier.', id: 'Tidak ada yang boleh berdiri di jalur yang dilewati truk. Menelepon di balik pembatas.' },
    rule: { name: 'UU No. 1/1970 · keeping people and vehicles apart', en: 'People on foot stay out of vehicle lanes, except at marked crossings.', id: 'Pejalan kaki tidak masuk jalur kendaraan, kecuali di penyeberangan bertanda.' },
  },
  {
    id: 'underload', replay: 'load',
    objective: { en: 'Find the hazards before the shift starts', id: 'Temukan bahaya sebelum shift dimulai' },
    title: { en: 'Someone waiting under a crane load', id: 'Ada yang menunggu di bawah beban crane' },
    why: { en: 'The red zone under a crane is never a place to wait, not even for a minute.', id: 'Zona merah di bawah crane bukan tempat menunggu, semenit pun tidak.' },
    rule: { name: 'Permenaker No. 8/2020 · pesawat angkat', en: 'Nobody may stand under a hanging load.', id: 'Tidak seorang pun boleh berdiri di bawah beban yang menggantung.' },
  },
  {
    id: 'roof', replay: 'height',
    objective: { en: 'Find the hazards before the shift starts', id: 'Temukan bahaya sebelum shift dimulai' },
    title: { en: 'On a wet container roof, no harness', id: 'Di atap kontainer basah, tanpa harness' },
    why: { en: 'Higher than 1.8 m, you wear a clipped-on harness. Without one, you do not go up.', id: 'Di atas 1,8 m kamu wajib memakai harness yang terkait. Tanpa itu, jangan naik.' },
    rule: { name: 'Permenaker No. 9/2016 (K3 Ketinggian)', en: 'Work up high needs protection against falling.', id: 'Bekerja di ketinggian wajib memakai pelindung jatuh.' },
  },
  {
    id: 'shade', replay: 'cross',
    captions: { en: ['A break in the shade of a parked truck. The engine is still running.', 'The driver climbs in. From the cab, the ground next to the trailer cannot be seen.', 'The truck pulls away.'], id: ['Istirahat di bayangan truk yang parkir. Mesinnya masih menyala.', 'Sopir naik. Dari kabin, tanah di samping trailer tidak terlihat.', 'Truk mulai jalan.'] },
    objective: { en: 'Find the hazards before the shift starts', id: 'Temukan bahaya sebelum shift dimulai' },
    title: { en: 'Resting next to a truck with the engine on', id: 'Istirahat di samping truk yang mesinnya menyala' },
    why: { en: 'If the engine is on, the truck can move at any second. Rest in the marked break area.', id: 'Kalau mesinnya menyala, truk bisa jalan kapan saja. Istirahat di area yang ditandai.' },
    rule: { name: 'PP No. 50/2012 (SMK3) · hazard control', en: 'Known dangers must be controlled. Break areas are placed away from traffic.', id: 'Bahaya yang sudah diketahui wajib dikendalikan. Area istirahat ditempatkan jauh dari lalu lintas.' },
  },
];

const EVAC = [
  {
    id: 'plume',
    objective: { en: 'Alarm: ammonia gas leak. Stay out of the cloud', id: 'Alarm: gas amonia bocor. Jauhi awan gasnya' },
    title: { en: 'Check the wind, stay out of the gas', id: 'Lihat arah angin, jauhi gasnya' },
    why: { en: 'The gas goes wherever the wind blows it. Look at the windsock (the striped cloth tube on a pole) first. Then walk sideways out of the cloud and toward where the wind comes from. Never walk the same way the cloud is moving.', id: 'Gas bergerak ke mana angin bertiup. Lihat windsock (kantong kain bergaris di tiang) dulu. Lalu jalan ke samping keluar dari awan, ke arah datangnya angin. Jangan pernah jalan searah gerak awan gas.' },
    rule: { name: 'Permenaker No. 5/2018 · NAB amonia 25 ppm', en: 'Workers must not breathe more chemical than the safe limit. For ammonia that limit is 25 ppm.', id: 'Pekerja tidak boleh menghirup zat kimia melebihi batas aman (NAB). Untuk amonia batasnya 25 ppm.' },
  },
  {
    id: 'mandown',
    objective: { en: 'Respond to the call: someone has collapsed', id: 'Tanggapi panggilan: ada yang pingsan' },
    title: { en: 'A worker has collapsed inside the gas', id: 'Ada pekerja pingsan di dalam gas' },
    situation: { en: 'Radio: "Someone is down by the fridge containers, east side!" You can see their vest 15 m away, inside the gas. Nobody else is closer.', id: 'Radio: "Ada yang tumbang di deret kontainer pendingin, sisi timur!" Rompinya terlihat 15 m darimu, di dalam gas. Tidak ada orang lain yang lebih dekat.' },
    options: [
      { en: 'Run in and drag them out. It is only 15 m, you can hold your breath.', id: 'Lari masuk dan seret dia keluar. Cuma 15 m, kamu bisa tahan napas.', correct: false },
      { en: 'Stay on the side the wind comes from. Radio their exact location to the emergency team and keep watching them until the team arrives with breathing masks.', id: 'Tetap di sisi datangnya angin. Radiokan lokasi tepatnya ke tim darurat, dan terus awasi dia sampai tim datang dengan masker oksigen.', correct: true },
      { en: 'Wet your shirt, cover your face, go in.', id: 'Basahi baju, tutup wajah, masuk.', correct: false },
    ],
    why: { en: 'In gas leaks, most of the people who die are the ones who ran in to help. One victim becomes two in under a minute. The emergency team has air tanks and masks. Your job is to tell them exactly where the person is.', id: 'Pada kebocoran gas, kebanyakan yang tewas justru orang yang masuk untuk menolong. Satu korban jadi dua dalam kurang dari semenit. Tim darurat punya tabung udara dan masker. Tugasmu memberi tahu mereka di mana tepatnya orang itu.' },
    rule: { name: 'PP No. 50/2012 (SMK3) · tanggap darurat', en: 'Rescue is done by a trained team with the right equipment. Everyone else reports and stays away.', id: 'Penyelamatan dilakukan tim terlatih dengan peralatan yang tepat. Yang lain melapor dan menjauh.' },
  },
  {
    id: 'muster',
    objective: { en: 'Go to the meeting point the wind is not blowing toward', id: 'Pergi ke titik kumpul yang tidak searah angin' },
    title: { en: 'Meeting point: the one away from the wind, not the nearest', id: 'Titik kumpul: yang jauh dari arah angin, bukan yang terdekat' },
    why: { en: 'Every terminal has two meeting points for exactly this. The right one depends on which way the wind blows today, not on which is closer.', id: 'Setiap terminal punya dua titik kumpul untuk keadaan seperti ini. Yang benar tergantung arah angin hari ini, bukan mana yang lebih dekat.' },
    rule: { name: 'PP No. 50/2012 (SMK3) · prosedur darurat', en: 'The emergency plan names the meeting points and how to choose one. Workers must be trained on it.', id: 'Rencana darurat menetapkan titik kumpul dan cara memilihnya. Pekerja wajib dilatih.' },
  },
];

export const MODE_ROLES = [
  { id: 'driver', mode: 'drive', icon: 'ic-wheel', name: { en: 'Truck driver', id: 'Sopir truk' }, tag: { en: 'You drive · 3 checkpoints', id: 'Kamu menyetir · 3 checkpoint' },
    blurb: { en: 'Drive a container truck with W/S and A/D. Watch your speed, stop for people, wait under the crane. Crash and you watch your own run.', id: 'Setir truk kontainer dengan W/S dan A/D. Jaga kecepatan, berhenti untuk orang, tunggu di bawah crane. Tabrak, kamu nonton rekamanmu sendiri.' }, hazards: DRIVE },
  { id: 'crane', mode: 'crane', icon: 'ic-crane', name: { en: 'Crane operator', id: 'Operator crane' }, tag: { en: 'You lift · 3 checkpoints', id: 'Kamu mengangkat · 3 checkpoint' },
    blurb: { en: 'Lock the container, lift it, move the crane, stop the swinging. Put 30 t on a truck with a person below.', id: 'Kunci kontainer, angkat, geser crane, hentikan ayunan. Taruh 30 t di truk dengan orang di bawah.' }, hazards: CRANE },
  { id: 'signal', mode: 'signal', icon: 'ic-hand', name: { en: 'Signaller (banksman)', id: 'Juru isyarat' }, tag: { en: 'You guide · 3 checkpoints', id: 'Kamu memandu · 3 checkpoint' },
    blurb: { en: 'The crane driver cannot see the ground. You can. Your hand signals move the crane.', id: 'Operator crane tidak bisa melihat tanah. Kamu bisa. Isyarat tanganmu yang menggerakkan crane.' }, hazards: SIGNAL },
  { id: 'inspect', mode: 'inspect', icon: 'ic-eye', name: { en: 'Safety inspector', id: 'Inspektur K3' }, tag: { en: 'Spot the hazard · 90 s', id: 'Cari bahaya · 90 dtk' },
    blurb: { en: 'The yard is frozen at 07:42. Five things are wrong. Any you miss, you see what happens next.', id: 'Lapangan dibekukan pukul 07.42. Ada lima hal yang salah. Yang terlewat, kamu lihat akibatnya.' }, hazards: INSPECT },
  { id: 'evac', mode: 'evac', icon: 'ic-alarm', name: { en: 'Emergency: gas leak', id: 'Darurat: bocor gas' }, tag: { en: 'Evacuate · 3 checkpoints', id: 'Evakuasi · 3 checkpoint' },
    blurb: { en: 'A fridge container is leaking ammonia gas. Check the wind, pick the right meeting point, and do not become the second victim.', id: 'Kontainer pendingin bocor gas amonia. Lihat arah angin, pilih titik kumpul yang benar, jangan jadi korban kedua.' }, hazards: EVAC },
];

// Copy used only by the hands-on modes.
export const M = {
  kmh: { en: 'km/h', id: 'km/jam' }, limit: { en: 'Limit', id: 'Batas' }, gear: { en: 'Gear', id: 'Gigi' },
  light: { en: 'Crane light', id: 'Lampu crane' }, red: { en: 'RED', id: 'MERAH' }, green: { en: 'GREEN', id: 'HIJAU' },
  driveKeys: { en: [['W', 'gas'], ['S', 'brake / reverse'], ['A D', 'steer'], ['H', 'horn'], ['V', 'cab / chase']], id: [['W', 'gas'], ['S', 'rem / mundur'], ['A D', 'setir'], ['H', 'klakson'], ['V', 'kabin / luar']] },
  craneKeys: { en: [['W S', 'move crane'], ['R F', 'lift / lower'], ['Shift', 'slow'], ['SPACE', 'corner locks'], ['H', 'horn'], ['V', 'cab / side']], id: [['W S', 'geser crane'], ['R F', 'naik / turun'], ['Shift', 'pelan'], ['SPASI', 'kunci sudut'], ['H', 'klakson'], ['V', 'kabin / samping']] },
  signalKeys: { en: [['1', 'travel to me'], ['4', 'travel away'], ['2', 'lower'], ['3', 'raise'], ['SPACE', 'all stop'], ['F', 'wave person off']], id: [['1', 'jalan ke saya'], ['4', 'menjauh'], ['2', 'turunkan'], ['3', 'naikkan'], ['SPASI', 'stop total'], ['F', 'usir orang']] },
  locks: { en: 'Corner locks', id: 'Kunci sudut' }, hoist: { en: 'Load height', id: 'Tinggi beban' }, sway: { en: 'Sway', id: 'Ayunan' }, wind: { en: 'Wind', id: 'Angin' }, travel: { en: 'Crane position', id: 'Posisi crane' },
  locked: { en: 'LOCKED', id: 'TERKUNCI' }, unlocked: { en: 'OPEN', id: 'TERBUKA' },
  signal: { en: 'Your signal', id: 'Isyaratmu' }, sigNone: { en: '(none)', id: '(tidak ada)' },
  sigTravel: { en: 'TRAVEL TO ME', id: 'JALAN KE SAYA' }, sigAway: { en: 'TRAVEL AWAY', id: 'MENJAUH' },
  cantSee: { en: 'Operator cannot see you', id: 'Operator tidak bisa melihatmu' }, emptySpreader: { en: 'Nothing attached yet: lower onto the container and lock', id: 'Belum ada yang terpasang: turunkan ke kontainer lalu kunci' },
  interlock: { en: 'The locks only turn when the frame sits on the container', id: 'Kunci hanya bisa diputar saat rangka duduk di atas kontainer' },
  toTruck: { en: 'to truck', id: 'ke truk' }, driverSafe: { en: 'Driver', id: 'Sopir' }, safe: { en: 'SAFE', id: 'AMAN' }, atRisk: { en: 'IN ZONE', id: 'DI ZONA' }, sigLower: { en: 'LOWER', id: 'TURUNKAN' }, sigRaise: { en: 'RAISE', id: 'NAIKKAN' }, sigStop: { en: 'ALL STOP', id: 'STOP TOTAL' },
  inBox: { en: 'In the signaller box', id: 'Di kotak juru isyarat' }, outBox: { en: 'Outside the box', id: 'Di luar kotak' },
  found: { en: 'found', id: 'ditemukan' }, timeLeft: { en: 'left', id: 'tersisa' },
  inspectHint: { en: 'Look at a hazard and press F · Enter to finish early', id: 'Arahkan ke bahaya lalu tekan F · Enter untuk selesai' },
  decoy: { en: 'That one is fine: helmet, vest, behind the barrier. −5 s', id: 'Yang itu aman: helm, rompi, di balik pembatas. −5 dtk' },
  missedTitle: { en: 'What you missed', id: 'Yang terlewat' },
  exposure: { en: 'Ammonia where you stand', id: 'Amonia di posisimu' }, dose: { en: 'Dose', id: 'Dosis' },
  windFrom: { en: 'Wind blowing toward', id: 'Angin bertiup ke arah' },
  musterA: { en: 'Meeting point A', id: 'Titik kumpul A' }, musterB: { en: 'Meeting point B', id: 'Titik kumpul B' },
  radioHold: { en: 'Hold E: radio their location to the emergency team', id: 'Tahan E: radiokan lokasinya ke tim darurat' },
  evacHint: { en: 'WASD walk · mouse look · watch the windsock', id: 'WASD jalan · mouse lihat · perhatikan windsock' },
  signalHint: { en: 'Hold 1/4/2/3 to signal, release to stop · SPACE all stop · F wave off', id: 'Tahan 1/4/2/3 untuk isyarat, lepas untuk berhenti · SPASI stop total · F usir' },
};
