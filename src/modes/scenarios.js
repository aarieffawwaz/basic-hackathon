// Checkpoints for the hands-on modes. Same shape as scenario.js hazards minus the A/B/C
// (the controls are the decision), except where a mode still asks a question (evac).
// Rule names are real Indonesian regulations; wording is paraphrased, not quoted.

const DRIVE = [
  {
    id: 'speed',
    objective: { en: 'Drive the lane at 15 km/h or less past the radar', id: 'Lewati radar di jalur dengan kecepatan maks. 15 km/jam' },
    title: { en: 'Speed limit: 15 km/h in the yard', id: 'Batas kecepatan: 15 km/jam di lapangan' },
    why: { en: 'Stopping distance grows with the square of speed. At 15 km/h a loaded tractor stops in about 5 m; at 30 km/h it needs three times that, and people step out of blind spots every few minutes.', id: 'Jarak henti naik sebanding kuadrat kecepatan. Di 15 km/jam tractor bermuatan berhenti sekitar 5 m; di 30 km/jam butuh tiga kalinya, dan orang keluar dari blind spot tiap beberapa menit.' },
    rule: { name: 'Permenaker No. 8/2020 · pesawat angkutan', en: 'Operators of transport equipment must keep to the site operating limits, speed included.', id: 'Operator pesawat angkutan wajib mematuhi batas operasi lokasi, termasuk kecepatan.' },
  },
  {
    id: 'zebra',
    objective: { en: 'Give way at the zebra crossing', id: 'Beri jalan di zebra cross' },
    title: { en: 'Zebra crossing: a checker is on the road', id: 'Zebra cross: checker sedang menyeberang' },
    why: { en: 'A pedestrian on the crossing has right of way, every time. Stop before the white line, wait until they are clear and have looked at you.', id: 'Pejalan di zebra cross selalu didahulukan. Berhenti sebelum garis putih, tunggu sampai mereka lewat dan sudah menatapmu.' },
    rule: { name: 'UU No. 1/1970 · traffic segregation', en: 'The employer must prevent accidents from vehicle and pedestrian conflict; marked crossings give pedestrians priority.', id: 'Pengusaha wajib mencegah kecelakaan dari konflik kendaraan dan pejalan; penyeberangan bertanda mendahulukan pejalan.' },
  },
  {
    id: 'rtg',
    objective: { en: 'Turn into the block and wait for the RTG light', id: 'Masuk ke blok dan tunggu lampu RTG' },
    title: { en: 'Red light under the RTG: a box is landing', id: 'Lampu merah di bawah RTG: box sedang turun' },
    why: { en: 'The RTG operator lands boxes by the spreader, not by looking under it. The red light is the only thing telling you the bay is live.', id: 'Operator RTG menurunkan box berpatokan spreader, bukan melihat ke bawahnya. Lampu merah satu-satunya tanda bay sedang aktif.' },
    rule: { name: 'Permenaker No. 8/2020 · pesawat angkat', en: 'No person or vehicle may be under a suspended load; access to the lifting zone must be controlled.', id: 'Tidak boleh ada orang atau kendaraan di bawah beban tergantung; akses zona angkat wajib dikendalikan.' },
  },
];

const CRANE = [
  {
    id: 'locks',
    objective: { en: 'Lock all four twist-locks, then hoist', id: 'Kunci keempat twist-lock, lalu angkat' },
    title: { en: 'Twist-locks: four green before you hoist', id: 'Twist-lock: empat hijau sebelum mengangkat' },
    why: { en: 'A 40-ft box hangs from four corners. Three locks feel the same as four in the cab, right up until the box is above someone.', id: 'Box 40 kaki tergantung di empat sudut. Tiga kunci terasa sama dengan empat dari kabin, sampai box berada di atas seseorang.' },
    rule: { name: 'Permenaker No. 8/2020 · alat bantu angkat', en: 'The operator must confirm lifting attachments are engaged and safe before every lift.', id: 'Operator wajib memastikan alat bantu angkat terpasang dan aman sebelum setiap pengangkatan.' },
  },
  {
    id: 'people',
    objective: { en: 'Travel to the truck at bay 24, never over people', id: 'Jalankan crane ke truk di bay 24, jangan lewat di atas orang' },
    title: { en: 'Never travel a load over a person', id: 'Jangan bawa beban melewati orang' },
    why: { en: 'Stop, sound the horn, and wait. A load that never passes over anyone cannot fall on anyone.', id: 'Berhenti, bunyikan klakson, dan tunggu. Beban yang tidak pernah lewat di atas orang tidak bisa jatuh menimpa siapa pun.' },
    rule: { name: 'Permenaker No. 8/2020 · pesawat angkat', en: 'Loads must not be moved over people; the operator must warn and wait until the path is clear.', id: 'Beban tidak boleh dipindahkan di atas orang; operator wajib memberi peringatan dan menunggu jalur kosong.' },
  },
  {
    id: 'land',
    objective: { en: 'Land the box on the chassis, slow and steady', id: 'Turunkan box ke chassis, pelan dan stabil' },
    title: { en: 'Landing: kill the sway, then lower slowly', id: 'Pendaratan: redam ayunan, lalu turunkan pelan' },
    why: { en: 'Sway turns 30 t into a pendulum. Let it settle high, then come down under 0.6 m/s. The driver is in the cab below.', id: 'Ayunan mengubah 30 t menjadi bandul. Biarkan stabil di atas, lalu turunkan di bawah 0,6 m/s. Pengemudi ada di kabin di bawah.' },
    rule: { name: 'Permenaker No. 8/2020 · SIO operator', en: 'Only licensed operators lift, within the rated wind and speed limits of the machine.', id: 'Hanya operator ber-SIO yang mengangkat, dalam batas angin dan kecepatan yang diizinkan alat.' },
  },
];

const SIGNAL = [
  {
    id: 'stand',
    objective: { en: 'Stand in the green signaller box, then signal', id: 'Berdiri di kotak hijau juru isyarat, lalu beri isyarat' },
    title: { en: 'Where the signaller stands', id: 'Posisi juru isyarat' },
    why: { en: 'Seen by the operator, outside the load path. If you are under the box to see better, you are the thing it lands on.', id: 'Terlihat oleh operator, di luar jalur beban. Kalau kamu di bawah box supaya lebih jelas, kamulah yang akan tertimpa.' },
    rule: { name: 'Permenaker No. 8/2020 · juru isyarat', en: 'The signaller must stay visible to the operator and outside the fall zone of the load.', id: 'Juru isyarat wajib terlihat operator dan berada di luar zona jatuh beban.' },
  },
  {
    id: 'intruder',
    objective: { en: 'Bring the box to the truck; stop it if anyone walks in', id: 'Bawa box ke truk; hentikan jika ada yang masuk' },
    title: { en: 'Someone walks into the path: STOP', id: 'Ada yang masuk jalur: STOP' },
    why: { en: 'The operator cannot see the corridor under the box. You can. All-stop first, then sort it out.', id: 'Operator tidak bisa melihat koridor di bawah box. Kamu bisa. Hentikan dulu, baru urus.' },
    rule: { name: 'Permenaker No. 8/2020 · pesawat angkat', en: 'Any person in the lifting path stops the lift; the signaller has stop authority.', id: 'Siapa pun di jalur angkat menghentikan pengangkatan; juru isyarat berwenang menghentikan.' },
  },
  {
    id: 'driver',
    objective: { en: 'Clear the driver, then lower onto the chassis', id: 'Amankan pengemudi, lalu turunkan ke chassis' },
    title: { en: 'Driver out of the cab during landing', id: 'Pengemudi di luar kabin saat pendaratan' },
    why: { en: 'A driver standing at the chassis is between 30 t and the trailer. Wave them to the safe zone, then call the box down.', id: 'Pengemudi di samping chassis berada di antara 30 t dan trailer. Arahkan ke zona aman, baru turunkan box.' },
    rule: { name: 'Permenaker No. 8/2020 · zona angkat', en: 'People must stay clear of the landing zone until the load is down and released.', id: 'Orang wajib menjauh dari zona pendaratan sampai beban turun dan dilepas.' },
  },
];

const INSPECT = [
  {
    id: 'nohelmet', replay: 'ppe',
    objective: { en: 'Find the hazards before the shift starts', id: 'Temukan bahaya sebelum shift dimulai' },
    title: { en: 'Worker at the gate without a helmet', id: 'Pekerja di gerbang tanpa helm' },
    why: { en: 'Twist-locks and cones fall from spreaders. Helmet on before the gate, not after.', id: 'Twist-lock dan cone jatuh dari spreader. Helm dipakai sebelum gerbang, bukan sesudah.' },
    rule: { name: 'Permenaker No. 8/2010 (APD)', en: 'PPE must be worn wherever it is required.', id: 'APD wajib dipakai di area yang mewajibkan.' },
  },
  {
    id: 'phone', replay: 'cross',
    captions: { en: ['A checker on the phone, standing in the truck lane.', 'The tractor driver is looking at the crane. 20 m to stop.', 'Head down, earbud in. Struck.'], id: ['Checker menelepon, berdiri di jalur truk.', 'Pengemudi tractor melihat crane. Butuh 20 m untuk berhenti.', 'Kepala menunduk, earbud terpasang. Tertabrak.'] },
    objective: { en: 'Find the hazards before the shift starts', id: 'Temukan bahaya sebelum shift dimulai' },
    title: { en: 'Checker on the phone in the truck lane', id: 'Checker menelepon di jalur truk' },
    why: { en: 'Nobody stands in a live lane. Calls happen behind the barrier.', id: 'Tidak ada yang berdiri di jalur aktif. Telepon dilakukan di balik pembatas.' },
    rule: { name: 'UU No. 1/1970 · traffic segregation', en: 'Pedestrians stay out of vehicle lanes except at marked crossings.', id: 'Pejalan tidak masuk jalur kendaraan kecuali di penyeberangan bertanda.' },
  },
  {
    id: 'underload', replay: 'load',
    objective: { en: 'Find the hazards before the shift starts', id: 'Temukan bahaya sebelum shift dimulai' },
    title: { en: 'Someone waiting under the RTG load', id: 'Ada yang menunggu di bawah beban RTG' },
    why: { en: 'The red zone under a crane is never a waiting area, not even for a minute.', id: 'Zona merah di bawah crane bukan tempat menunggu, satu menit pun tidak.' },
    rule: { name: 'Permenaker No. 8/2020 · pesawat angkat', en: 'No person may stand under a suspended load.', id: 'Tidak seorang pun boleh berdiri di bawah beban tergantung.' },
  },
  {
    id: 'roof', replay: 'height',
    objective: { en: 'Find the hazards before the shift starts', id: 'Temukan bahaya sebelum shift dimulai' },
    title: { en: 'On a wet container roof, no harness', id: 'Di atap kontainer basah, tanpa harness' },
    why: { en: 'Above 1.8 m you are clipped in or you are not up there.', id: 'Di atas 1,8 m kamu memakai harness, atau kamu tidak naik.' },
    rule: { name: 'Permenaker No. 9/2016 (K3 Ketinggian)', en: 'Work at height requires fall protection.', id: 'Bekerja di ketinggian wajib dengan pelindung jatuh.' },
  },
  {
    id: 'shade', replay: 'cross',
    captions: { en: ['Break in the shade of a parked tractor. Engine still running.', 'The driver climbs in. From the cab, the ground beside the trailer is invisible.', 'It pulls away.'], id: ['Istirahat di bayangan tractor yang parkir. Mesin masih menyala.', 'Pengemudi naik. Dari kabin, tanah di samping trailer tidak terlihat.', 'Tractor jalan.'] },
    objective: { en: 'Find the hazards before the shift starts', id: 'Temukan bahaya sebelum shift dimulai' },
    title: { en: 'Resting beside a running tractor', id: 'Istirahat di samping tractor menyala' },
    why: { en: 'A parked vehicle with the engine on is a moving vehicle. Rest in the marked break area.', id: 'Kendaraan parkir dengan mesin menyala adalah kendaraan bergerak. Istirahat di area yang ditandai.' },
    rule: { name: 'PP No. 50/2012 (SMK3) · hazard control', en: 'Identified hazards are controlled: rest areas are designated away from traffic.', id: 'Bahaya teridentifikasi dikendalikan: area istirahat ditetapkan jauh dari lalu lintas.' },
  },
];

const EVAC = [
  {
    id: 'plume',
    objective: { en: 'Alarm: ammonia leak. Stay out of the cloud', id: 'Alarm: bocor amonia. Jauhi awan gas' },
    title: { en: 'Read the wind, stay out of the plume', id: 'Baca angin, jauhi kepulan gas' },
    why: { en: 'Gas goes where the wind goes. Look at the windsock first, then move crosswind and upwind, never along the cloud.', id: 'Gas bergerak ke arah angin. Lihat windsock dulu, lalu bergerak menyamping dan melawan angin, jangan searah awan.' },
    rule: { name: 'Permenaker No. 5/2018 · NAB amonia 25 ppm', en: 'Exposure to chemical agents must stay under the threshold limit value (ammonia: 25 ppm).', id: 'Paparan faktor kimia wajib di bawah Nilai Ambang Batas (amonia: 25 ppm).' },
  },
  {
    id: 'mandown',
    objective: { en: 'Respond to the man-down call', id: 'Tanggapi panggilan man-down' },
    title: { en: 'Man down inside the cloud', id: 'Rekan tumbang di dalam awan gas' },
    situation: { en: 'Radio: "Man down by the reefer row, east side!" You can see his vest 15 m away, inside the haze. Nobody else is closer.', id: 'Radio: "Ada yang tumbang di deret reefer, sisi timur!" Rompinya terlihat 15 m darimu, di dalam kabut. Tidak ada orang lain yang lebih dekat.' },
    options: [
      { en: 'Run in and drag him out. It is 15 m, you can hold your breath.', id: 'Lari masuk dan seret dia. Hanya 15 m, kamu bisa tahan napas.', correct: false },
      { en: 'Stay upwind. Radio his exact location to the ERT, keep eyes on him until the SCBA team arrives.', id: 'Tetap di sisi atas angin. Radiokan lokasi tepatnya ke ERT, awasi dia sampai tim SCBA datang.', correct: true },
      { en: 'Wet your shirt, cover your face, go in.', id: 'Basahi baju, tutup wajah, masuk.', correct: false },
    ],
    why: { en: 'Most deaths in gas releases are rescuers. One casualty becomes two in under a minute. The rescue is the ERT with breathing apparatus; your job is the location.', id: 'Kebanyakan korban tewas pada kebocoran gas adalah penolong. Satu korban jadi dua dalam kurang dari semenit. Penyelamatan adalah tugas ERT dengan alat bantu napas; tugasmu adalah lokasinya.' },
    rule: { name: 'PP No. 50/2012 (SMK3) · tanggap darurat', en: 'Emergency rescue is done by a trained team with the right equipment; others report and keep clear.', id: 'Penyelamatan darurat dilakukan tim terlatih dengan peralatan yang tepat; yang lain melapor dan menjauh.' },
  },
  {
    id: 'muster',
    objective: { en: 'Go to the muster point the wind is not blowing toward', id: 'Pergi ke titik kumpul yang tidak searah angin' },
    title: { en: 'Muster point: out of the wind, not the nearest', id: 'Titik kumpul: yang aman dari angin, bukan yang terdekat' },
    why: { en: 'Every terminal has two muster points for this reason. The right one depends on today\'s wind, not on which is closer.', id: 'Setiap terminal punya dua titik kumpul karena alasan ini. Yang benar tergantung angin hari ini, bukan yang lebih dekat.' },
    rule: { name: 'PP No. 50/2012 (SMK3) · prosedur darurat', en: 'Emergency procedures define assembly points and how to choose them; workers must be trained in them.', id: 'Prosedur darurat menetapkan titik kumpul dan cara memilihnya; pekerja wajib dilatih.' },
  },
];

export const MODE_ROLES = [
  { id: 'driver', mode: 'drive', icon: 'ic-wheel', name: { en: 'Tractor driver', id: 'Sopir tractor' }, tag: { en: 'You drive · 3 checkpoints', id: 'Kamu menyetir · 3 checkpoint' },
    blurb: { en: 'W/S and A/D. Radar, zebra, the RTG bay. Crash and you watch your own run.', id: 'W/S dan A/D. Radar, zebra, bay RTG. Tabrak, kamu nonton rekamanmu sendiri.' }, hazards: DRIVE },
  { id: 'crane', mode: 'crane', icon: 'ic-crane', name: { en: 'RTG crane operator', id: 'Operator crane RTG' }, tag: { en: 'You lift · 3 checkpoints', id: 'Kamu mengangkat · 3 checkpoint' },
    blurb: { en: 'Locks, hoist, gantry, sway. Land 30 t on a truck with a person below.', id: 'Kunci, hoist, gantry, ayunan. Daratkan 30 t di truk dengan orang di bawah.' }, hazards: CRANE },
  { id: 'signal', mode: 'signal', icon: 'ic-hand', name: { en: 'Signaller (banksman)', id: 'Juru isyarat' }, tag: { en: 'You guide · 3 checkpoints', id: 'Kamu memandu · 3 checkpoint' },
    blurb: { en: 'The operator cannot see the ground. You can. Your hands move the crane.', id: 'Operator tidak melihat tanah. Kamu bisa. Tanganmu yang menggerakkan crane.' }, hazards: SIGNAL },
  { id: 'inspect', mode: 'inspect', icon: 'ic-eye', name: { en: 'HSE inspector', id: 'Inspektur K3' }, tag: { en: 'Spot the hazard · 90 s', id: 'Cari bahaya · 90 dtk' },
    blurb: { en: 'The yard frozen at 07:42. Five things are wrong. Missed ones play out.', id: 'Lapangan dibekukan pukul 07.42. Lima hal salah. Yang terlewat diputar akibatnya.' }, hazards: INSPECT },
  { id: 'evac', mode: 'evac', icon: 'ic-alarm', name: { en: 'Emergency: gas leak', id: 'Darurat: bocor gas' }, tag: { en: 'Evacuate · 3 checkpoints', id: 'Evakuasi · 3 checkpoint' },
    blurb: { en: 'A reefer is leaking ammonia. Read the wind, pick the muster point, do not be the second casualty.', id: 'Reefer bocor amonia. Baca angin, pilih titik kumpul, jangan jadi korban kedua.' }, hazards: EVAC },
];

// Copy used only by the hands-on modes.
export const M = {
  kmh: { en: 'km/h', id: 'km/jam' }, limit: { en: 'Limit', id: 'Batas' }, gear: { en: 'Gear', id: 'Gigi' },
  light: { en: 'RTG light', id: 'Lampu RTG' }, red: { en: 'RED', id: 'MERAH' }, green: { en: 'GREEN', id: 'HIJAU' },
  driveKeys: { en: [['W', 'gas'], ['S', 'brake / reverse'], ['A D', 'steer'], ['H', 'horn'], ['V', 'cab / chase']], id: [['W', 'gas'], ['S', 'rem / mundur'], ['A D', 'setir'], ['H', 'klakson'], ['V', 'kabin / luar']] },
  craneKeys: { en: [['W S', 'gantry'], ['R F', 'hoist'], ['Shift', 'creep'], ['SPACE', 'twist-locks'], ['H', 'horn'], ['V', 'cab / side']], id: [['W S', 'gantry'], ['R F', 'hoist'], ['Shift', 'pelan'], ['SPASI', 'twist-lock'], ['H', 'klakson'], ['V', 'kabin / samping']] },
  signalKeys: { en: [['1', 'travel to me'], ['4', 'travel away'], ['2', 'lower'], ['3', 'raise'], ['SPACE', 'all stop'], ['F', 'wave person off']], id: [['1', 'jalan ke saya'], ['4', 'menjauh'], ['2', 'turunkan'], ['3', 'naikkan'], ['SPASI', 'stop total'], ['F', 'usir orang']] },
  locks: { en: 'Twist-locks', id: 'Twist-lock' }, hoist: { en: 'Load height', id: 'Tinggi beban' }, sway: { en: 'Sway', id: 'Ayunan' }, wind: { en: 'Wind', id: 'Angin' }, travel: { en: 'Gantry', id: 'Gantry' },
  locked: { en: 'LOCKED', id: 'TERKUNCI' }, unlocked: { en: 'OPEN', id: 'TERBUKA' },
  signal: { en: 'Your signal', id: 'Isyaratmu' }, sigNone: { en: '— none —', id: '— tidak ada —' },
  sigTravel: { en: 'TRAVEL TO ME', id: 'JALAN KE SAYA' }, sigAway: { en: 'TRAVEL AWAY', id: 'MENJAUH' },
  cantSee: { en: 'Operator cannot see you', id: 'Operator tidak bisa melihatmu' }, emptySpreader: { en: 'Spreader lifted empty: lower and lock', id: 'Spreader naik kosong: turunkan dan kunci' },
  interlock: { en: 'Interlock: locks only turn when the box is seated', id: 'Interlock: kunci hanya berputar saat box duduk' },
  toTruck: { en: 'to truck', id: 'ke truk' }, driverSafe: { en: 'Driver', id: 'Pengemudi' }, safe: { en: 'SAFE', id: 'AMAN' }, atRisk: { en: 'IN ZONE', id: 'DI ZONA' }, sigLower: { en: 'LOWER', id: 'TURUNKAN' }, sigRaise: { en: 'RAISE', id: 'NAIKKAN' }, sigStop: { en: 'ALL STOP', id: 'STOP TOTAL' },
  inBox: { en: 'In the signaller box', id: 'Di kotak juru isyarat' }, outBox: { en: 'Outside the box', id: 'Di luar kotak' },
  found: { en: 'found', id: 'ditemukan' }, timeLeft: { en: 'left', id: 'tersisa' },
  inspectHint: { en: 'Look at a hazard and press F · Enter to finish early', id: 'Arahkan ke bahaya lalu tekan F · Enter untuk selesai' },
  decoy: { en: 'That one is fine: helmet, vest, behind the barrier. −5 s', id: 'Yang itu aman: helm, rompi, di balik pembatas. −5 dtk' },
  missedTitle: { en: 'What you missed', id: 'Yang terlewat' },
  exposure: { en: 'NH₃ at you', id: 'NH₃ di posisimu' }, dose: { en: 'Dose', id: 'Dosis' },
  windFrom: { en: 'Wind blowing toward', id: 'Angin bertiup ke arah' },
  musterA: { en: 'Muster A', id: 'Titik kumpul A' }, musterB: { en: 'Muster B', id: 'Titik kumpul B' },
  radioHold: { en: 'Hold E — radio the ERT his location', id: 'Tahan E — radiokan lokasinya ke ERT' },
  evacHint: { en: 'WASD walk · mouse look · watch the windsock', id: 'WASD jalan · mouse lihat · perhatikan windsock' },
  signalHint: { en: 'Hold 1/4/2/3 to signal, release to stop · SPACE all stop · F wave off', id: 'Tahan 1/4/2/3 untuk isyarat, lepas untuk berhenti · SPASI stop total · F usir' },
};
