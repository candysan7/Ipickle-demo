export const locations = [
  {
    county: 'Los Angeles County',
    clubs: [
      { name: 'iPickle Arcadia', courts: '8 courts (all dedicated)', address: '405 S. Santa Anita Dr, Arcadia, CA 91006', phone: '(626) 888-3675' },
      { name: 'iPickle Arroyo Seco (South Pasadena)', courts: '12 courts (6 dedicated; 6 dual-use during socials)', address: '920 Lohman Lane, South Pasadena, CA', phone: '(323) 258-4178' },
      { name: 'iPickle "The Narrows"', courts: '28 courts (16 dedicated; 12 dual-use)', address: '1201 Potrero Ave, South El Monte, CA 91733', phone: '(626) 944-0453' },
      { name: 'iPickle Cerritos', courts: '10 courts (all dedicated)', address: '19700 Bloomfield Ave., Cerritos, CA 90703', phone: '(562) 826-1587' },
    ],
  },
  {
    county: 'Orange County',
    clubs: [
      { name: 'iPickle La Habra', courts: '17 courts (all dedicated)', address: '351 S. Euclid Street, La Habra, CA 90631', phone: '(562) 690-5040' },
    ],
  },
  {
    county: 'Riverside County',
    clubs: [
      { name: 'iPickle Riverside', courts: '8 courts (4 dedicated and 4 dual-use)', address: '5051 Chicago Ave., Riverside, CA 92506', phone: '(951) 683-0667' },
    ],
  },
];

export const locationNames = locations.flatMap((g) => g.clubs.map((c) => c.name));

export const upcomingEvents = [
  { title: 'iPickle Summer Ladder League starts', location: 'Register weekly via PlaybyPoint', date: '2026-06-15', dateLabel: 'June 15' },
  { title: 'iPickle presents PICKLETOPIA', location: 'iPickle The Narrows', date: '2026-07-17', dateLabel: 'July 17-19' },
  { title: "Let's Teach Summer Swing Tournament & Fundraiser", location: 'LA City College', date: '2026-08-09', dateLabel: 'Aug 9' },
  { title: 'iPickle Fall Classic Tournament', location: 'iPickle La Habra', date: '2026-09-11', dateLabel: 'Sept 11-13' },
  { title: 'Kids Scramble Kids Tournament', location: 'iPickle La Habra', date: '2026-09-19', dateLabel: 'Sept 19' },
  { title: 'Young & Healthy Tournament', location: 'iPickle Arcadia', date: '2026-10-10', dateLabel: 'Oct 10' },
].sort((a, b) => new Date(a.date) - new Date(b.date));

export const programs = [
  { title: 'Tournaments', desc: 'Year-round USA Pickleball-sanctioned tournaments across all locations, with and without DUPR-reported scores.' },
  { title: 'Group Classes', desc: 'A great way to meet other players. Learn the basics or sharpen your game with one of our pros — join any time with a prorated fee.' },
  { title: 'Private Lessons', desc: 'Certified professionals offering private and semi-private lessons at reasonable rates.' },
  { title: 'Pickleball Leagues', desc: 'Multiple leagues running across different locations throughout the year.' },
];

export const leagues = {
  open: [
    { name: 'Pickleball Ladder League — Summer 2026', format: 'DUPR', location: 'iPickle Arcadia', deadline: 'Aug 8, 2026', spotsLeft: 14 },
    { name: '4x4 Pickleball League — Fall 2026 | OC Mixed', format: 'Mixed Doubles', location: 'iPickle La Habra', deadline: 'Aug 22, 2026', spotsLeft: 6 },
  ],
  upcoming: [
    { name: '4x4 Pickleball League — Winter 2027 | LA Mixed', opensOn: 'Oct 1, 2026', location: 'iPickle The Narrows' },
    { name: 'Tennis Round Robin League — Winter 2027', opensOn: 'Oct 15, 2026', location: 'iPickle Riverside' },
  ],
  completed: [
    "4x4 Pickleball League — Spring 2026 | Mixed League",
    "4x4 Pickleball League — Winter 2026 | LA Men's/Women's League",
    '4x4 Pickleball League — Winter 2026 | OC Mixed League',
    '4x4 Pickleball Senior League — Los Angeles Winter 2026 | Mixed',
    '4x4 Winter 2026 League Team Rosters',
  ],
};

export const tournaments = {
  upcoming: [
    {
      name: 'iPickle presents PICKLETOPIA',
      location: 'iPickle The Narrows',
      address: '1201 Potrero Ave, South El Monte, CA 91733',
      date: 'July 17-19, 2026',
      time: 'Check-in 7:30am daily',
    },
    {
      name: "Let's Teach Summer Swing powered by iPickle",
      location: 'LA City College',
      address: '855 N Vermont Ave, Los Angeles, CA 90029',
      date: 'August 9, 2026',
      time: 'Check-in 8:00am',
    },
  ],
  past: [
    {
      year: 2026,
      events: [
        'iPickle Summer Breeze — iPickle La Habra — June 5-7',
        'iPickle Kids Scramble Tournament — iPickle The Narrows — May 30',
        'iPasadena Senior Games — iPickle Arcadia — May 22-24',
        'iPickle OC Open Tournament — iPickle La Habra — April 24-26',
        'iPickle 4X4 Cup Team Tournament — iPickle The Narrows — Feb 28 - Mar 1',
        'iPickle Spring Classic Tournament — iPickle Cerritos — Mar 14 & 15',
        'iPickle Winter Classic — iPickle The Narrows — Jan 30 - Feb 1',
      ],
    },
    {
      year: 2025,
      events: [
        'iPickle South Pas Holiday Bash — iPickle Arroyo Seco — Dec 27 & 28',
        'iPickle Jingle Ball — iPickle La Habra — Dec 13 & 14',
        'iPickle Dink for Pink — iPickle Cerritos — Oct 11',
        'iPickle Fall Classic — iPickle La Habra — Sept 12-14',
        'iPickle presents Pickletopia — iPickle The Narrows — July 11-13',
        'iPickle Summer Breeze — iPickle La Habra — June 6-8',
        'Pasadena Senior Games — iPickle Arcadia — May 23-25',
        'iPickle OC Open — iPickle La Habra — April 25-27',
        'iPickle Spring Classic — iPickle Cerritos — March 15 & 16',
        'iPickle Rallies and Roses Singles Tournament — iPickle The Narrows — Feb 15',
        'San Gabriel Valley School Invitational — iPickle Arcadia — Feb 1',
        'iPickle $10K Winter Classic Tournament — iPickle The Narrows — Jan 18 & 19',
      ],
    },
    {
      year: 2024,
      events: [
        'Jingle Ball Tournament & Toy Drive — iPickle La Habra — Dec 14 & 15',
        'POSH Pickleball Tournament — La Cañada Flintridge Country Club — Nov 3',
        '$10,000 Spooky Slam — iPickle The Narrows — Oct 19-20',
        '$1,700 Dink for Pink — iPickle Cerritos — Oct 6',
        'PICKLETOPIA — iPickle The Narrows — July 12-14',
        'Pasadena Senior Games — iPickle Arcadia — May 26-28',
        'iPickle Spring DUPR Waterfall — iPickle Cerritos — April 27-28',
        '$6,000 iPickle Orange County Open — March 2-3',
        '$3,000 iPickle Winter Classic — Jan 6-7',
      ],
    },
  ],
};

export const socialSchedule = [
  { day: 'Tuesdays', slots: [
    { time: '8:00am-10:00am', location: 'La Habra', label: "Dinks 'n Donuts", host: 'Pam Purcell' },
    { time: '7:00pm-10:00pm', location: 'Arcadia', host: 'Joe & Leslie Matias' },
  ]},
  { day: 'Wednesdays', slots: [
    { time: '7:00pm-10:00pm', location: 'Arcadia', host: 'Joe & Leslie Matias' },
  ]},
  { day: 'Thursdays', slots: [
    { time: '8:00am-10:00am', location: 'La Habra', label: 'Chick a Dinks', host: 'Pam Purcell' },
    { time: '7:00pm-10:00pm', location: 'Arcadia', host: 'Joe & Leslie Matias' },
  ]},
  { day: 'Fridays', slots: [
    { time: '7:00pm-10:30pm', location: 'Arroyo Seco', host: 'Blake Rutledge' },
    { time: '7:00pm-10:00pm', location: 'The Narrows', host: 'Will Lam' },
    { time: '6:30pm-10:00pm', location: 'Cerritos', host: 'Courteney Nojiri' },
  ]},
  { day: 'Saturdays', slots: [
    { time: '4:00pm-7:00pm', location: 'Riverside', label: 'Beginner Night Social' },
    { time: '6:00pm-7:00pm', location: 'Arroyo Seco', label: 'FREE Pickleball 101 (RSVP required)' },
    { time: '7:00pm-10:30pm', location: 'Arroyo Seco', host: 'Jordan Murphey' },
  ]},
  { day: 'Sundays', slots: [
    { time: '7:00pm-10:30pm', location: 'Arroyo Seco', host: 'Isaac Smith' },
  ]},
];

export const coaches = [
  {
    id: 1,
    name: 'Joe Matias',
    location: 'iPickle Arcadia',
    specialty: 'Private & Semi-Private Lessons',
    rate: 75,
    rateUnit: 'hr',
    availability: ['Mon 9:00am-12:00pm', 'Wed 9:00am-12:00pm', 'Fri 3:00pm-6:00pm'],
  },
  {
    id: 2,
    name: 'Pam Purcell',
    location: 'iPickle La Habra',
    specialty: 'Group Classes & Beginners',
    rate: 45,
    rateUnit: 'hr',
    availability: ['Tue 7:00am-8:00am', 'Thu 7:00am-8:00am', 'Sat 10:00am-12:00pm'],
  },
  {
    id: 3,
    name: 'Blake Rutledge',
    location: 'iPickle Arroyo Seco',
    specialty: 'Advanced Strategy & Doubles',
    rate: 85,
    rateUnit: 'hr',
    availability: ['Mon 4:00pm-7:00pm', 'Wed 4:00pm-7:00pm'],
  },
  {
    id: 4,
    name: 'Will Lam',
    location: 'iPickle The Narrows',
    specialty: 'Private Lessons & Paddle Fitting',
    rate: 70,
    rateUnit: 'hr',
    availability: ['Tue 6:00pm-9:00pm', 'Fri 1:00pm-4:00pm'],
  },
  {
    id: 5,
    name: 'Courteney Nojiri',
    location: 'iPickle Cerritos',
    specialty: 'Group Classes & Tournament Prep',
    rate: 60,
    rateUnit: 'hr',
    availability: ['Wed 5:00pm-7:00pm', 'Sat 9:00am-11:00am'],
  },
  {
    id: 6,
    name: 'Jordan Murphey',
    location: 'iPickle Riverside',
    specialty: 'Beginner & Youth Coaching',
    rate: 50,
    rateUnit: 'hr',
    availability: ['Thu 4:00pm-6:00pm', 'Sun 11:00am-1:00pm'],
  },
];
