const DEFAULT_PASSWORD = "123456";

function sha256(ascii) {
  const rightRotate = (value, amount) => (value >>> amount) | (value << (32 - amount));
  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  const words = [];
  const asciiBitLength = ascii.length * 8;
  const hash = [];
  const k = [];
  let primeCounter = 0;

  const isComposite = {};

  for (let candidate = 2; primeCounter < 64; candidate += 1) {
    if (!isComposite[candidate]) {
      for (let multiple = 0; multiple < 313; multiple += candidate) {
        isComposite[multiple] = candidate;
      }

      hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
      k[primeCounter] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
      primeCounter += 1;
    }
  }

  const normalized = `${ascii}\u0080`;

  for (let index = 0; index < normalized.length; index += 1) {
    const characterCode = normalized.charCodeAt(index);
    words[index >> 2] |= characterCode << (((3 - index) % 4) * 8);
  }

  words[words.length] = ((asciiBitLength / maxWord) | 0);
  words[words.length] = asciiBitLength;

  for (let index = 0; index < words.length; ) {
    const chunk = words.slice(index, (index += 16));
    const previousHash = hash.slice(0);

    for (let offset = 0; offset < 64; offset += 1) {
      const word15 = chunk[offset - 15];
      const word2 = chunk[offset - 2];
      const schedule =
        offset < 16
          ? chunk[offset]
          : (((rightRotate(word15, 7) ^ rightRotate(word15, 18) ^ (word15 >>> 3)) +
              chunk[offset - 7] +
              (rightRotate(word2, 17) ^ rightRotate(word2, 19) ^ (word2 >>> 10)) +
              chunk[offset - 16]) |
              0);

      chunk[offset] = schedule;

      const temp1 =
        (hash[7] +
          (rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25)) +
          ((hash[4] & hash[5]) ^ (~hash[4] & hash[6])) +
          k[offset] +
          schedule) |
        0;
      const temp2 =
        ((rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22)) +
          ((hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]))) |
        0;

      hash.unshift((temp1 + temp2) | 0);
      hash[4] = (hash[4] + temp1) | 0;
      hash.pop();
    }

    for (let offset = 0; offset < 8; offset += 1) {
      hash[offset] = (hash[offset] + previousHash[offset]) | 0;
    }
  }

  let result = "";

  for (let index = 0; index < 8; index += 1) {
    for (let offset = 3; offset >= 0; offset -= 1) {
      const byte = (hash[index] >> (offset * 8)) & 255;
      result += (byte < 16 ? "0" : "") + byte.toString(16);
    }
  }

  return result;
}

function hashPassword(password) {
  return sha256(`limko::${String(password || "").trim()}`);
}

const faculties = [
  { id: "fict", code: "FICT", name: "Information & Communication Technology" },
  { id: "fbmg", code: "FBMG", name: "Business & Management" },
  { id: "fcmb", code: "FCMB", name: "Communication, Media & Broadcasting" },
  { id: "fdi", code: "FDI", name: "Design Innovation" },
  { id: "fcth", code: "FCTH", name: "Tourism & Hospitality" },
  { id: "fabe", code: "FABE", name: "Architecture & Built Environment" }
];

const programmes = [
  { id: "se", facultyId: "fict", code: "SE", name: "Software Engineering with Multimedia" },
  { id: "bit", facultyId: "fict", code: "BIT", name: "Business Information Technology" },
  { id: "it", facultyId: "fict", code: "IT", name: "Information Technology" },
  { id: "ib", facultyId: "fbmg", code: "IB", name: "International Business" },
  { id: "hrm", facultyId: "fbmg", code: "HR", name: "Human Resource Management" },
  { id: "bm", facultyId: "fbmg", code: "BM", name: "Business Management" },
  { id: "marketing", facultyId: "fbmg", code: "MKT", name: "Marketing" },
  { id: "pr", facultyId: "fcmb", code: "PR", name: "Public Relations" },
  { id: "tvf", facultyId: "fcmb", code: "TVF", name: "Television & Film Production" },
  { id: "jm", facultyId: "fcmb", code: "JM", name: "Journalism & Media" },
  { id: "graphic-design", facultyId: "fdi", code: "GD", name: "Graphic Design" },
  { id: "fashion", facultyId: "fdi", code: "FAD", name: "Fashion & Apparel Design" },
  { id: "tourism", facultyId: "fcth", code: "TM", name: "Tourism Management" },
  { id: "hotel", facultyId: "fcth", code: "HM", name: "Hotel Management" },
  { id: "arch-tech", facultyId: "fabe", code: "AT", name: "Architectural Technology" }
];

const facultyNames = Object.fromEntries(faculties.map((faculty) => [faculty.id, faculty.name]));

function createUser({
  id,
  fullName,
  email,
  role,
  facultyId,
  programmeIds = [],
  assignedClassIds,
  password = DEFAULT_PASSWORD
}) {
  return {
    id,
    fullName,
    email,
    passwordHash: hashPassword(password),
    role,
    facultyId,
    facultyName: facultyId ? facultyNames[facultyId] : "All Faculties",
    programmeIds,
    ...(assignedClassIds ? { assignedClassIds } : {})
  };
}

function createClass({
  id,
  facultyId,
  programmeId,
  plId,
  prlId,
  lecturerId,
  code,
  year,
  section,
  courseName,
  studentCount,
  venue,
  scheduleDay,
  scheduleTime
}) {
  const programme = programmes.find((entry) => entry.id === programmeId);

  return {
    id,
    facultyId,
    programmeId,
    plId,
    prlId,
    lecturerId,
    code,
    year,
    section,
    displayName: `${programme?.name || "Programme"} - Year ${year} (Class ${section})`,
    courseName,
    studentCount,
    venue,
    scheduleDay,
    scheduleTime
  };
}

const baseUsers = [
  createUser({
    id: "fmg-1",
    fullName: "Diana Moopisa",
    email: "fmg@limko.com",
    role: "fmg",
    facultyId: "fict"
  }),
  createUser({
    id: "fmg-hlabathe",
    fullName: "Hlabathe Posholi",
    email: "hlabathe.posholi@limko.com",
    role: "fmg",
    facultyId: "fbmg"
  }),
  createUser({
    id: "fmg-papiso",
    fullName: "Papiso Brown",
    email: "papiso.brown@limko.com",
    role: "fmg",
    facultyId: "fcmb"
  }),
  createUser({
    id: "fmg-ramohlaboli",
    fullName: "Ramohlaboli Khotle",
    email: "ramohlaboli.khotle@limko.com",
    role: "fmg",
    facultyId: "fabe"
  }),
  createUser({
    id: "fmg-molemo",
    fullName: "Molemo Ts'oeu",
    email: "molemo.tsoeu@limko.com",
    role: "fmg",
    facultyId: "fdi"
  }),
  createUser({
    id: "pl-kapela",
    fullName: "Kapela Morutwa",
    email: "pl@limko.com",
    role: "pl",
    facultyId: "fict",
    programmeIds: ["se"]
  }),
  createUser({
    id: "pl-tsietsi",
    fullName: "Tsietsi Matjele",
    email: "pl2@limko.com",
    role: "pl",
    facultyId: "fict",
    programmeIds: ["it", "bit"]
  }),
  createUser({
    id: "pl-khopotso",
    fullName: "Khopotso Molati",
    email: "khopotso.molati@limko.com",
    role: "pl",
    facultyId: "fbmg",
    programmeIds: ["marketing", "bm", "hrm"]
  }),
  createUser({
    id: "pl-kelebone",
    fullName: "Kelebone Fosa",
    email: "kelebone.fosa@limko.com",
    role: "pl",
    facultyId: "fbmg",
    programmeIds: ["ib"]
  }),
  createUser({
    id: "pl-nketsi",
    fullName: "Nketsi Moqasa",
    email: "nketsi.moqasa@limko.com",
    role: "pl",
    facultyId: "fcmb",
    programmeIds: ["tvf"]
  }),
  createUser({
    id: "pl-itumeleng",
    fullName: "Itumeleng Sekhamane",
    email: "itumeleng.sekhamane@limko.com",
    role: "pl",
    facultyId: "fcmb",
    programmeIds: ["pr", "jm"]
  }),
  createUser({
    id: "pl-arabang",
    fullName: "Arabang Maama",
    email: "arabang.maama@limko.com",
    role: "pl",
    facultyId: "fabe",
    programmeIds: ["arch-tech"]
  }),
  createUser({
    id: "pl-maseabata",
    fullName: "Maseabata Telite",
    email: "maseabata.telite@limko.com",
    role: "pl",
    facultyId: "fdi",
    programmeIds: ["graphic-design", "fashion"]
  }),
  createUser({
    id: "pl-sebinane",
    fullName: "Sebinane Lekoekoe",
    email: "sebinane.lekoekoe@limko.com",
    role: "pl",
    facultyId: "fcth",
    programmeIds: ["tourism", "hotel"]
  }),
  createUser({
    id: "prl-mpotla",
    fullName: "Mpotla Nthunya",
    email: "prl@limko.com",
    role: "prl",
    facultyId: "fict",
    programmeIds: ["se"]
  }),
  createUser({
    id: "prl-khauhelo",
    fullName: "Khauhelo Mahlakeng",
    email: "khauhelo@limko.com",
    role: "prl",
    facultyId: "fict",
    programmeIds: ["it", "bit"]
  }),
  createUser({
    id: "prl-batloung",
    fullName: "Batloung Hlabeli",
    email: "batloung@limko.com",
    role: "prl",
    facultyId: "fict",
    programmeIds: ["se", "it"]
  }),
  createUser({
    id: "prl-takura",
    fullName: "Takura Bhile",
    email: "takura@limko.com",
    role: "prl",
    facultyId: "fict",
    programmeIds: ["it", "bit"]
  }),
  createUser({
    id: "prl-makatleho",
    fullName: "Makatleho Mafura",
    email: "makatleho.mafura@limko.com",
    role: "prl",
    facultyId: "fbmg",
    programmeIds: ["bm"]
  }),
  createUser({
    id: "prl-joalane",
    fullName: "Joalane Putsoa",
    email: "joalane.putsoa@limko.com",
    role: "prl",
    facultyId: "fbmg",
    programmeIds: ["hrm"]
  }),
  createUser({
    id: "prl-mamello",
    fullName: "Mamello Mahlomola",
    email: "mamello.mahlomola@limko.com",
    role: "prl",
    facultyId: "fbmg",
    programmeIds: ["marketing"]
  }),
  createUser({
    id: "prl-likeleko",
    fullName: "Likeleko Damane",
    email: "likeleko.damane@limko.com",
    role: "prl",
    facultyId: "fbmg",
    programmeIds: ["ib"]
  }),
  createUser({
    id: "prl-motsabi",
    fullName: "Motsabi Korotsoane",
    email: "motsabi.korotsoane@limko.com",
    role: "prl",
    facultyId: "fbmg",
    programmeIds: ["marketing", "bm"]
  }),
  createUser({
    id: "prl-tsepiso",
    fullName: "Tsepiso Mncina",
    email: "tsepiso.mncina@limko.com",
    role: "prl",
    facultyId: "fcmb",
    programmeIds: ["pr"]
  }),
  createUser({
    id: "prl-teboho-mokonyana",
    fullName: "Teboho Mokonyana",
    email: "teboho.mokonyana@limko.com",
    role: "prl",
    facultyId: "fcmb",
    programmeIds: ["tvf"]
  }),
  createUser({
    id: "prl-mpaki",
    fullName: "Mpaki Molapo",
    email: "mpaki.molapo@limko.com",
    role: "prl",
    facultyId: "fcmb",
    programmeIds: ["jm"]
  }),
  createUser({
    id: "prl-thapelo-lebona",
    fullName: "Thapelo Lebona",
    email: "thapelo.lebona@limko.com",
    role: "prl",
    facultyId: "fcmb",
    programmeIds: ["tvf", "jm"]
  }),
  createUser({
    id: "prl-mapallo",
    fullName: "Mapallo Monoko",
    email: "mapallo.monoko@limko.com",
    role: "prl",
    facultyId: "fabe",
    programmeIds: ["arch-tech"]
  }),
  createUser({
    id: "prl-teboho-ntsaba",
    fullName: "Teboho Ntsaba",
    email: "teboho.ntsaba@limko.com",
    role: "prl",
    facultyId: "fabe",
    programmeIds: ["arch-tech"]
  }),
  createUser({
    id: "prl-thapelo-sebotsa",
    fullName: "Thapelo Sebotsa",
    email: "thapelo.sebotsa@limko.com",
    role: "prl",
    facultyId: "fdi",
    programmeIds: ["graphic-design"]
  }),
  createUser({
    id: "prl-maili",
    fullName: "Maili Moorosi",
    email: "maili.moorosi@limko.com",
    role: "prl",
    facultyId: "fdi",
    programmeIds: ["fashion", "tourism"]
  }),
  createUser({
    id: "lecturer-mpotla",
    fullName: "Mpotla Nthunya",
    email: "lecturer@limko.com",
    role: "lecturer",
    facultyId: "fict",
    programmeIds: ["se"]
  }),
  createUser({
    id: "lecturer-khauhelo",
    fullName: "Khauhelo Mahlakeng",
    email: "lecturer2@limko.com",
    role: "lecturer",
    facultyId: "fict",
    programmeIds: ["it", "bit"]
  }),
  createUser({
    id: "lecturer-batloung",
    fullName: "Batloung Hlabeli",
    email: "lecturer3@limko.com",
    role: "lecturer",
    facultyId: "fict",
    programmeIds: ["se", "it"]
  }),
  createUser({
    id: "lecturer-takura",
    fullName: "Takura Bhile",
    email: "lecturer4@limko.com",
    role: "lecturer",
    facultyId: "fict",
    programmeIds: ["it", "bit"]
  }),
  createUser({
    id: "lecturer-palesa",
    fullName: "Palesa Ntho",
    email: "palesa.ntho@limko.com",
    role: "lecturer",
    facultyId: "fict",
    programmeIds: ["se"]
  }),
  createUser({
    id: "lecturer-mabafokeng",
    fullName: "Mabafokeng Mokete",
    email: "mabafokeng.mokete@limko.com",
    role: "lecturer",
    facultyId: "fict",
    programmeIds: ["se"]
  }),
  createUser({
    id: "lecturer-makamohelo",
    fullName: "Makamohelo Mathe",
    email: "makamohelo.mathe@limko.com",
    role: "lecturer",
    facultyId: "fict",
    programmeIds: ["bit"]
  }),
  createUser({
    id: "lecturer-uduak",
    fullName: "Uduak Ebisoh",
    email: "uduak.ebisoh@limko.com",
    role: "lecturer",
    facultyId: "fict",
    programmeIds: ["it"]
  }),
  createUser({
    id: "lecturer-rethabile",
    fullName: "Rethabile Maekane",
    email: "rethabile.maekane@limko.com",
    role: "lecturer",
    facultyId: "fbmg",
    programmeIds: ["marketing"]
  }),
  createUser({
    id: "lecturer-thabiso",
    fullName: "Thabiso Molise",
    email: "thabiso.molise@limko.com",
    role: "lecturer",
    facultyId: "fbmg",
    programmeIds: ["ib"]
  }),
  createUser({
    id: "lecturer-matseliso",
    fullName: "Matseliso Morahanye",
    email: "matseliso.morahanye@limko.com",
    role: "lecturer",
    facultyId: "fbmg",
    programmeIds: ["bm"]
  }),
  createUser({
    id: "lecturer-lena",
    fullName: "Lena Jaase",
    email: "lena.jaase@limko.com",
    role: "lecturer",
    facultyId: "fbmg",
    programmeIds: ["hrm"]
  }),
  createUser({
    id: "lecturer-pusetso",
    fullName: "Pusetso Mopeli",
    email: "pusetso.mopeli@limko.com",
    role: "lecturer",
    facultyId: "fcmb",
    programmeIds: ["pr"]
  }),
  createUser({
    id: "lecturer-lijeng",
    fullName: "Lijeng Ranooe",
    email: "lijeng.ranooe@limko.com",
    role: "lecturer",
    facultyId: "fcmb",
    programmeIds: ["tvf"]
  }),
  createUser({
    id: "lecturer-morapeli",
    fullName: "Morapeli Moseme",
    email: "morapeli.moseme@limko.com",
    role: "lecturer",
    facultyId: "fcmb",
    programmeIds: ["jm"]
  }),
  createUser({
    id: "lecturer-nkopane",
    fullName: "Nkopane Mokuena",
    email: "nkopane.mokuena@limko.com",
    role: "lecturer",
    facultyId: "fcmb",
    programmeIds: ["tvf", "jm"]
  }),
  createUser({
    id: "lecturer-boikokobetso",
    fullName: "Boikokobetso Mohlomi",
    email: "boikokobetso.mohlomi@limko.com",
    role: "lecturer",
    facultyId: "fabe",
    programmeIds: ["arch-tech"]
  }),
  createUser({
    id: "lecturer-mphore",
    fullName: "Mphore Mapena",
    email: "mphore.mapena@limko.com",
    role: "lecturer",
    facultyId: "fdi",
    programmeIds: ["graphic-design", "fashion"]
  }),
  createUser({
    id: "lecturer-thato",
    fullName: "Thato Phafoli",
    email: "thato.phafoli@limko.com",
    role: "lecturer",
    facultyId: "fcth",
    programmeIds: ["tourism"]
  }),
  createUser({
    id: "lecturer-lineo",
    fullName: "Lineo Tsolo",
    email: "lineo.tsolo@limko.com",
    role: "lecturer",
    facultyId: "fcth",
    programmeIds: ["hotel"]
  }),
  createUser({
    id: "student-1",
    fullName: "Palesa Nthoi",
    email: "student@limko.com",
    role: "student",
    facultyId: "fict",
    programmeIds: ["se"],
    assignedClassIds: ["se-2a-data-structures", "se-2a-ux-foundations"]
  }),
  createUser({
    id: "student-2",
    fullName: "Lerato Mohale",
    email: "student2@limko.com",
    role: "student",
    facultyId: "fict",
    programmeIds: ["it"],
    assignedClassIds: ["it-2a-database-systems", "it-2b-networking"]
  }),
  createUser({
    id: "student-3",
    fullName: "Mpho Ralebitso",
    email: "student3@limko.com",
    role: "student",
    facultyId: "fbmg",
    programmeIds: ["bm"],
    assignedClassIds: ["bm-2a-accounting", "marketing-2a-brand-strategy"]
  }),
  createUser({
    id: "student-4",
    fullName: "Neo Khatleli",
    email: "student4@limko.com",
    role: "student",
    facultyId: "fcmb",
    programmeIds: ["pr"],
    assignedClassIds: ["pr-2a-public-relations", "tvf-2a-video-production"]
  }),
  createUser({
    id: "student-5",
    fullName: "Masego Tau",
    email: "student5@limko.com",
    role: "student",
    facultyId: "fcth",
    programmeIds: ["tourism"],
    assignedClassIds: ["tourism-2a-destination-planning", "tourism-2b-tour-guiding"]
  }),
  createUser({
    id: "student-6",
    fullName: "Hlompho Letlatsa",
    email: "student6@limko.com",
    role: "student",
    facultyId: "fcth",
    programmeIds: ["hotel"],
    assignedClassIds: ["hotel-2a-front-office-operations", "hotel-2b-hospitality-service"]
  })
];

const classes = [
  createClass({
    id: "se-2a-data-structures",
    facultyId: "fict",
    programmeId: "se",
    plId: "pl-kapela",
    prlId: "prl-mpotla",
    lecturerId: "lecturer-mpotla",
    code: "SE 2A",
    year: 2,
    section: "A",
    courseName: "Data Structures",
    studentCount: 46,
    venue: "Lab 3",
    scheduleDay: "Tuesday",
    scheduleTime: "08:00 - 10:00"
  }),
  createClass({
    id: "se-2b-data-structures",
    facultyId: "fict",
    programmeId: "se",
    plId: "pl-kapela",
    prlId: "prl-mpotla",
    lecturerId: "lecturer-mpotla",
    code: "SE 2B",
    year: 2,
    section: "B",
    courseName: "Data Structures",
    studentCount: 41,
    venue: "Lab 1",
    scheduleDay: "Thursday",
    scheduleTime: "08:00 - 10:00"
  }),
  createClass({
    id: "it-2a-database-systems",
    facultyId: "fict",
    programmeId: "it",
    plId: "pl-tsietsi",
    prlId: "prl-khauhelo",
    lecturerId: "lecturer-khauhelo",
    code: "IT 2A",
    year: 2,
    section: "A",
    courseName: "Database Systems",
    studentCount: 52,
    venue: "Room B12",
    scheduleDay: "Monday",
    scheduleTime: "11:00 - 13:00"
  }),
  createClass({
    id: "bit-2a-database-systems",
    facultyId: "fict",
    programmeId: "bit",
    plId: "pl-tsietsi",
    prlId: "prl-khauhelo",
    lecturerId: "lecturer-khauhelo",
    code: "BIT 2A",
    year: 2,
    section: "A",
    courseName: "Database Systems",
    studentCount: 38,
    venue: "Room B10",
    scheduleDay: "Wednesday",
    scheduleTime: "09:00 - 11:00"
  }),
  createClass({
    id: "se-3a-cyber-security",
    facultyId: "fict",
    programmeId: "se",
    plId: "pl-kapela",
    prlId: "prl-batloung",
    lecturerId: "lecturer-batloung",
    code: "SE 3A",
    year: 3,
    section: "A",
    courseName: "Cyber Security",
    studentCount: 33,
    venue: "Cyber Lab",
    scheduleDay: "Friday",
    scheduleTime: "10:00 - 12:00"
  }),
  createClass({
    id: "it-3a-cyber-security",
    facultyId: "fict",
    programmeId: "it",
    plId: "pl-tsietsi",
    prlId: "prl-batloung",
    lecturerId: "lecturer-batloung",
    code: "IT 3A",
    year: 3,
    section: "A",
    courseName: "Cyber Security",
    studentCount: 36,
    venue: "Cyber Lab",
    scheduleDay: "Friday",
    scheduleTime: "13:00 - 15:00"
  }),
  createClass({
    id: "it-2b-networking",
    facultyId: "fict",
    programmeId: "it",
    plId: "pl-tsietsi",
    prlId: "prl-takura",
    lecturerId: "lecturer-takura",
    code: "IT 2B",
    year: 2,
    section: "B",
    courseName: "Networking",
    studentCount: 44,
    venue: "Networking Lab",
    scheduleDay: "Tuesday",
    scheduleTime: "14:00 - 16:00"
  }),
  createClass({
    id: "bit-2b-networking",
    facultyId: "fict",
    programmeId: "bit",
    plId: "pl-tsietsi",
    prlId: "prl-takura",
    lecturerId: "lecturer-takura",
    code: "BIT 2B",
    year: 2,
    section: "B",
    courseName: "Networking",
    studentCount: 37,
    venue: "Networking Lab",
    scheduleDay: "Thursday",
    scheduleTime: "14:00 - 16:00"
  }),
  createClass({
    id: "se-2a-ux-foundations",
    facultyId: "fict",
    programmeId: "se",
    plId: "pl-kapela",
    prlId: "prl-mpotla",
    lecturerId: "lecturer-palesa",
    code: "SE 2A",
    year: 2,
    section: "A",
    courseName: "UI/UX Foundations",
    studentCount: 46,
    venue: "Design Lab",
    scheduleDay: "Wednesday",
    scheduleTime: "11:00 - 13:00"
  }),
  createClass({
    id: "se-1b-programming-lab",
    facultyId: "fict",
    programmeId: "se",
    plId: "pl-kapela",
    prlId: "prl-mpotla",
    lecturerId: "lecturer-mabafokeng",
    code: "SE 1B",
    year: 1,
    section: "B",
    courseName: "Programming Lab Fundamentals",
    studentCount: 48,
    venue: "Lab 2",
    scheduleDay: "Monday",
    scheduleTime: "14:00 - 16:00"
  }),
  createClass({
    id: "bit-1a-digital-literacy",
    facultyId: "fict",
    programmeId: "bit",
    plId: "pl-tsietsi",
    prlId: "prl-khauhelo",
    lecturerId: "lecturer-makamohelo",
    code: "BIT 1A",
    year: 1,
    section: "A",
    courseName: "Digital Literacy",
    studentCount: 42,
    venue: "Smart Lab",
    scheduleDay: "Tuesday",
    scheduleTime: "10:00 - 12:00"
  }),
  createClass({
    id: "it-1a-web-foundations",
    facultyId: "fict",
    programmeId: "it",
    plId: "pl-tsietsi",
    prlId: "prl-khauhelo",
    lecturerId: "lecturer-uduak",
    code: "IT 1A",
    year: 1,
    section: "A",
    courseName: "Web Foundations",
    studentCount: 45,
    venue: "Room C3",
    scheduleDay: "Friday",
    scheduleTime: "08:00 - 10:00"
  }),
  createClass({
    id: "marketing-2a-brand-strategy",
    facultyId: "fbmg",
    programmeId: "marketing",
    plId: "pl-khopotso",
    prlId: "prl-mamello",
    lecturerId: "lecturer-rethabile",
    code: "MKT 2A",
    year: 2,
    section: "A",
    courseName: "Brand Strategy",
    studentCount: 39,
    venue: "Hall 1",
    scheduleDay: "Tuesday",
    scheduleTime: "09:00 - 11:00"
  }),
  createClass({
    id: "ib-3a-business-law",
    facultyId: "fbmg",
    programmeId: "ib",
    plId: "pl-kelebone",
    prlId: "prl-likeleko",
    lecturerId: "lecturer-thabiso",
    code: "IB 3A",
    year: 3,
    section: "A",
    courseName: "Business Law",
    studentCount: 34,
    venue: "Room B4",
    scheduleDay: "Wednesday",
    scheduleTime: "11:00 - 13:00"
  }),
  createClass({
    id: "bm-2a-accounting",
    facultyId: "fbmg",
    programmeId: "bm",
    plId: "pl-khopotso",
    prlId: "prl-makatleho",
    lecturerId: "lecturer-matseliso",
    code: "BM 2A",
    year: 2,
    section: "A",
    courseName: "Accounting",
    studentCount: 55,
    venue: "Hall 2",
    scheduleDay: "Monday",
    scheduleTime: "08:00 - 10:00"
  }),
  createClass({
    id: "hrm-2b-organisational-behaviour",
    facultyId: "fbmg",
    programmeId: "hrm",
    plId: "pl-khopotso",
    prlId: "prl-joalane",
    lecturerId: "lecturer-lena",
    code: "HR 2B",
    year: 2,
    section: "B",
    courseName: "Organisational Behaviour",
    studentCount: 43,
    venue: "Room A8",
    scheduleDay: "Thursday",
    scheduleTime: "10:00 - 12:00"
  }),
  createClass({
    id: "pr-2a-public-relations",
    facultyId: "fcmb",
    programmeId: "pr",
    plId: "pl-itumeleng",
    prlId: "prl-tsepiso",
    lecturerId: "lecturer-pusetso",
    code: "PR 2A",
    year: 2,
    section: "A",
    courseName: "Public Relations Practice",
    studentCount: 29,
    venue: "Studio 1",
    scheduleDay: "Wednesday",
    scheduleTime: "13:00 - 15:00"
  }),
  createClass({
    id: "tvf-2a-video-production",
    facultyId: "fcmb",
    programmeId: "tvf",
    plId: "pl-nketsi",
    prlId: "prl-teboho-mokonyana",
    lecturerId: "lecturer-lijeng",
    code: "TVF 2A",
    year: 2,
    section: "A",
    courseName: "Video Production",
    studentCount: 31,
    venue: "Studio 2",
    scheduleDay: "Monday",
    scheduleTime: "14:00 - 16:00"
  }),
  createClass({
    id: "jm-2a-news-writing",
    facultyId: "fcmb",
    programmeId: "jm",
    plId: "pl-itumeleng",
    prlId: "prl-mpaki",
    lecturerId: "lecturer-morapeli",
    code: "JM 2A",
    year: 2,
    section: "A",
    courseName: "News Writing",
    studentCount: 33,
    venue: "Newsroom Lab",
    scheduleDay: "Tuesday",
    scheduleTime: "11:00 - 13:00"
  }),
  createClass({
    id: "tvf-3a-media-law",
    facultyId: "fcmb",
    programmeId: "tvf",
    plId: "pl-nketsi",
    prlId: "prl-thapelo-lebona",
    lecturerId: "lecturer-nkopane",
    code: "TVF 3A",
    year: 3,
    section: "A",
    courseName: "Media Law and Ethics",
    studentCount: 27,
    venue: "Media Suite",
    scheduleDay: "Friday",
    scheduleTime: "09:00 - 11:00"
  }),
  createClass({
    id: "arch-tech-2a-design-studio",
    facultyId: "fabe",
    programmeId: "arch-tech",
    plId: "pl-arabang",
    prlId: "prl-mapallo",
    lecturerId: "lecturer-boikokobetso",
    code: "AT 2A",
    year: 2,
    section: "A",
    courseName: "Design Studio",
    studentCount: 26,
    venue: "Studio A",
    scheduleDay: "Monday",
    scheduleTime: "09:00 - 12:00"
  }),
  createClass({
    id: "arch-tech-3a-construction-methods",
    facultyId: "fabe",
    programmeId: "arch-tech",
    plId: "pl-arabang",
    prlId: "prl-teboho-ntsaba",
    lecturerId: "lecturer-boikokobetso",
    code: "AT 3A",
    year: 3,
    section: "A",
    courseName: "Construction Methods",
    studentCount: 22,
    venue: "Workshop 1",
    scheduleDay: "Thursday",
    scheduleTime: "08:00 - 11:00"
  }),
  createClass({
    id: "graphic-design-2a-visual-communication",
    facultyId: "fdi",
    programmeId: "graphic-design",
    plId: "pl-maseabata",
    prlId: "prl-thapelo-sebotsa",
    lecturerId: "lecturer-mphore",
    code: "GD 2A",
    year: 2,
    section: "A",
    courseName: "Visual Communication",
    studentCount: 28,
    venue: "Creative Lab",
    scheduleDay: "Tuesday",
    scheduleTime: "13:00 - 15:00"
  }),
  createClass({
    id: "fashion-2a-multimedia-branding",
    facultyId: "fdi",
    programmeId: "fashion",
    plId: "pl-maseabata",
    prlId: "prl-maili",
    lecturerId: "lecturer-mphore",
    code: "FAD 2A",
    year: 2,
    section: "A",
    courseName: "Multimedia Branding",
    studentCount: 24,
    venue: "Design Studio 2",
    scheduleDay: "Wednesday",
    scheduleTime: "10:00 - 12:00"
  }),
  createClass({
    id: "tourism-2a-destination-planning",
    facultyId: "fcth",
    programmeId: "tourism",
    plId: "pl-sebinane",
    prlId: "prl-maili",
    lecturerId: "lecturer-thato",
    code: "TM 2A",
    year: 2,
    section: "A",
    courseName: "Destination Planning",
    studentCount: 32,
    venue: "Travel Studio",
    scheduleDay: "Monday",
    scheduleTime: "10:00 - 12:00"
  }),
  createClass({
    id: "tourism-2b-tour-guiding",
    facultyId: "fcth",
    programmeId: "tourism",
    plId: "pl-sebinane",
    prlId: "prl-maili",
    lecturerId: "lecturer-thato",
    code: "TM 2B",
    year: 2,
    section: "B",
    courseName: "Tour Guiding Practice",
    studentCount: 29,
    venue: "Field Lab",
    scheduleDay: "Thursday",
    scheduleTime: "13:00 - 15:00"
  }),
  createClass({
    id: "hotel-2a-front-office-operations",
    facultyId: "fcth",
    programmeId: "hotel",
    plId: "pl-sebinane",
    prlId: "prl-maili",
    lecturerId: "lecturer-lineo",
    code: "HM 2A",
    year: 2,
    section: "A",
    courseName: "Front Office Operations",
    studentCount: 27,
    venue: "Hospitality Lab",
    scheduleDay: "Tuesday",
    scheduleTime: "09:00 - 11:00"
  }),
  createClass({
    id: "hotel-2b-hospitality-service",
    facultyId: "fcth",
    programmeId: "hotel",
    plId: "pl-sebinane",
    prlId: "prl-maili",
    lecturerId: "lecturer-lineo",
    code: "HM 2B",
    year: 2,
    section: "B",
    courseName: "Hospitality Service Excellence",
    studentCount: 25,
    venue: "Training Suite",
    scheduleDay: "Friday",
    scheduleTime: "11:00 - 13:00"
  })
];

const autoAssignedClassIds = (user) => {
  if (user.role === "lecturer") {
    return classes.filter((classItem) => classItem.lecturerId === user.id).map((classItem) => classItem.id);
  }

  if (user.role === "prl") {
    return classes.filter((classItem) => classItem.prlId === user.id).map((classItem) => classItem.id);
  }

  if (user.role === "pl") {
    return classes.filter((classItem) => classItem.plId === user.id).map((classItem) => classItem.id);
  }

  return user.assignedClassIds || [];
};

const users = baseUsers.map((user) => ({
  ...user,
  ...(autoAssignedClassIds(user).length ? { assignedClassIds: autoAssignedClassIds(user) } : {})
}));

const reports = [
  {
    id: "report-1",
    classId: "se-2a-data-structures",
    facultyId: "fict",
    programmeId: "se",
    lecturerId: "lecturer-mpotla",
    lecturerName: "Mpotla Nthunya",
    classDisplayName: "Software Engineering with Multimedia - Year 2 (Class A)",
    courseName: "Data Structures",
    lectureDate: "2026-04-14",
    weekLabel: "Week 7",
    attendancePresent: 39,
    attendanceTotal: 46,
    topic: "Trees, traversal, and recursive search",
    outcomes: "Students practiced traversal strategies and compared recursive versus iterative approaches.",
    recommendations: "More time is needed for lab exercises involving recursion.",
    reviewStatus: "reviewed",
    seniorLecturerFeedback: "Good coverage. Add a brief quiz before the next practical session.",
    submittedAt: "2026-04-14T09:40:00.000Z"
  },
  {
    id: "report-2",
    classId: "se-2b-data-structures",
    facultyId: "fict",
    programmeId: "se",
    lecturerId: "lecturer-mpotla",
    lecturerName: "Mpotla Nthunya",
    classDisplayName: "Software Engineering with Multimedia - Year 2 (Class B)",
    courseName: "Data Structures",
    lectureDate: "2026-04-16",
    weekLabel: "Week 7",
    attendancePresent: 32,
    attendanceTotal: 41,
    topic: "Stacks and queues in real-world systems",
    outcomes: "Students can distinguish LIFO and FIFO structures in system design.",
    recommendations: "Need projector support in Lab 1.",
    reviewStatus: "submitted",
    seniorLecturerFeedback: "",
    submittedAt: "2026-04-16T08:55:00.000Z"
  },
  {
    id: "report-3",
    classId: "it-2a-database-systems",
    facultyId: "fict",
    programmeId: "it",
    lecturerId: "lecturer-khauhelo",
    lecturerName: "Khauhelo Mahlakeng",
    classDisplayName: "Information Technology - Year 2 (Class A)",
    courseName: "Database Systems",
    lectureDate: "2026-04-15",
    weekLabel: "Week 7",
    attendancePresent: 45,
    attendanceTotal: 52,
    topic: "Normalization and schema refinement",
    outcomes: "Students normalized sample tables and justified design choices.",
    recommendations: "Need more examples from business systems.",
    reviewStatus: "reviewed",
    seniorLecturerFeedback: "Strong session. Include one more group task next week.",
    submittedAt: "2026-04-15T12:35:00.000Z"
  },
  {
    id: "report-4",
    classId: "se-3a-cyber-security",
    facultyId: "fict",
    programmeId: "se",
    lecturerId: "lecturer-batloung",
    lecturerName: "Batloung Hlabeli",
    classDisplayName: "Software Engineering with Multimedia - Year 3 (Class A)",
    courseName: "Cyber Security",
    lectureDate: "2026-04-18",
    weekLabel: "Week 7",
    attendancePresent: 28,
    attendanceTotal: 33,
    topic: "Threat modeling and attack surfaces",
    outcomes: "Students mapped threats against a sample mobile application.",
    recommendations: "Would benefit from a guest session from industry.",
    reviewStatus: "submitted",
    seniorLecturerFeedback: "",
    submittedAt: "2026-04-18T11:20:00.000Z"
  },
  {
    id: "report-5",
    classId: "marketing-2a-brand-strategy",
    facultyId: "fbmg",
    programmeId: "marketing",
    lecturerId: "lecturer-rethabile",
    lecturerName: "Rethabile Maekane",
    classDisplayName: "Marketing - Year 2 (Class A)",
    courseName: "Brand Strategy",
    lectureDate: "2026-04-17",
    weekLabel: "Week 7",
    attendancePresent: 34,
    attendanceTotal: 39,
    topic: "Positioning and customer value propositions",
    outcomes: "Students drafted brand narratives for a local startup.",
    recommendations: "Schedule a practical critique session next week.",
    reviewStatus: "reviewed",
    seniorLecturerFeedback: "Useful case study selection. Build in a short reflection activity.",
    submittedAt: "2026-04-17T10:30:00.000Z"
  },
  {
    id: "report-6",
    classId: "pr-2a-public-relations",
    facultyId: "fcmb",
    programmeId: "pr",
    lecturerId: "lecturer-pusetso",
    lecturerName: "Pusetso Mopeli",
    classDisplayName: "Public Relations - Year 2 (Class A)",
    courseName: "Public Relations Practice",
    lectureDate: "2026-04-18",
    weekLabel: "Week 7",
    attendancePresent: 25,
    attendanceTotal: 29,
    topic: "Crisis response planning",
    outcomes: "Students built a press-response outline for a fictional incident.",
    recommendations: "More time is needed for role-play presentations.",
    reviewStatus: "submitted",
    seniorLecturerFeedback: "",
    submittedAt: "2026-04-18T14:10:00.000Z"
  },
  {
    id: "report-7",
    classId: "tourism-2a-destination-planning",
    facultyId: "fcth",
    programmeId: "tourism",
    lecturerId: "lecturer-thato",
    lecturerName: "Thato Phafoli",
    classDisplayName: "Tourism Management - Year 2 (Class A)",
    courseName: "Destination Planning",
    lectureDate: "2026-04-19",
    weekLabel: "Week 7",
    attendancePresent: 28,
    attendanceTotal: 32,
    topic: "Route mapping and visitor flow design",
    outcomes: "Students planned destination itineraries with transport and timing constraints.",
    recommendations: "More local tourism case studies would strengthen the practicals.",
    reviewStatus: "reviewed",
    seniorLecturerFeedback: "Solid practical approach. Add one assessment rubric example next session.",
    submittedAt: "2026-04-19T10:10:00.000Z"
  },
  {
    id: "report-8",
    classId: "hotel-2a-front-office-operations",
    facultyId: "fcth",
    programmeId: "hotel",
    lecturerId: "lecturer-lineo",
    lecturerName: "Lineo Tsolo",
    classDisplayName: "Hotel Management - Year 2 (Class A)",
    courseName: "Front Office Operations",
    lectureDate: "2026-04-20",
    weekLabel: "Week 7",
    attendancePresent: 23,
    attendanceTotal: 27,
    topic: "Guest check-in flow and reservation handling",
    outcomes: "Students practised reception scenarios using booking records and service scripts.",
    recommendations: "Need an extra mock reception desk session for slower learners.",
    reviewStatus: "submitted",
    seniorLecturerFeedback: "",
    submittedAt: "2026-04-20T09:25:00.000Z"
  }
];

const attendance = [
  { id: "attendance-1", classId: "se-2a-data-structures", lectureDate: "2026-04-14", lecturerId: "lecturer-mpotla", totalPresent: 39 },
  { id: "attendance-2", classId: "se-2b-data-structures", lectureDate: "2026-04-16", lecturerId: "lecturer-mpotla", totalPresent: 32 },
  { id: "attendance-3", classId: "it-2a-database-systems", lectureDate: "2026-04-15", lecturerId: "lecturer-khauhelo", totalPresent: 45 },
  { id: "attendance-4", classId: "bit-2a-database-systems", lectureDate: "2026-04-16", lecturerId: "lecturer-khauhelo", totalPresent: 34 },
  { id: "attendance-5", classId: "se-3a-cyber-security", lectureDate: "2026-04-18", lecturerId: "lecturer-batloung", totalPresent: 28 },
  { id: "attendance-6", classId: "marketing-2a-brand-strategy", lectureDate: "2026-04-17", lecturerId: "lecturer-rethabile", totalPresent: 34 },
  { id: "attendance-7", classId: "pr-2a-public-relations", lectureDate: "2026-04-18", lecturerId: "lecturer-pusetso", totalPresent: 25 },
  { id: "attendance-8", classId: "tourism-2a-destination-planning", lectureDate: "2026-04-19", lecturerId: "lecturer-thato", totalPresent: 28 },
  { id: "attendance-9", classId: "hotel-2a-front-office-operations", lectureDate: "2026-04-20", lecturerId: "lecturer-lineo", totalPresent: 23 }
];

const ratings = [
  {
    id: "rating-1",
    classId: "se-2a-data-structures",
    lecturerId: "lecturer-mpotla",
    studentId: "student-1",
    rating: 4,
    comment: "Clear explanations and useful examples.",
    createdAt: "2026-04-15T09:00:00.000Z"
  },
  {
    id: "rating-2",
    classId: "se-2a-ux-foundations",
    lecturerId: "lecturer-palesa",
    studentId: "student-1",
    rating: 5,
    comment: "The studio session was very engaging.",
    createdAt: "2026-04-17T13:00:00.000Z"
  },
  {
    id: "rating-3",
    classId: "it-2a-database-systems",
    lecturerId: "lecturer-khauhelo",
    studentId: "student-2",
    rating: 4,
    comment: "Practical examples helped me understand normalization.",
    createdAt: "2026-04-16T14:20:00.000Z"
  },
  {
    id: "rating-4",
    classId: "bm-2a-accounting",
    lecturerId: "lecturer-matseliso",
    studentId: "student-3",
    rating: 4,
    comment: "Examples were easy to follow and linked well to assessments.",
    createdAt: "2026-04-19T08:30:00.000Z"
  },
  {
    id: "rating-5",
    classId: "tourism-2a-destination-planning",
    lecturerId: "lecturer-thato",
    studentId: "student-5",
    rating: 5,
    comment: "The destination planning workshop felt practical and well-paced.",
    createdAt: "2026-04-20T12:00:00.000Z"
  },
  {
    id: "rating-6",
    classId: "hotel-2a-front-office-operations",
    lecturerId: "lecturer-lineo",
    studentId: "student-6",
    rating: 4,
    comment: "The reception role-play helped me understand real guest handling.",
    createdAt: "2026-04-21T11:10:00.000Z"
  }
];

export const mockFaculties = faculties;
export const mockProgrammes = programmes;
export const mockUsers = users;
export const mockAuthSeedUsers = users.map((user) => ({
  email: user.email,
  password: DEFAULT_PASSWORD
}));
export const mockClasses = classes;
export const mockReports = reports;
export const mockAttendance = attendance;
export const mockRatings = ratings;
