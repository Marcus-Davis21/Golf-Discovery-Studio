import { CohortId, CohortInfo, DemoStep, Participant, StorageConfig } from '../types';

export const DEFAULT_STORAGE_CONFIG: StorageConfig = {
  storageEmail: 'research-archive@golfdiscovery.org',
  secondaryEmail: '',
  autoEmailDigest: true,
  cloudSyncEnabled: true,
  studyTitle: 'Comprehensive 5-Cohort Golf Discovery Study (25 Per Cohort)',
  targetCountPerCohort: 25,
  totalTargetCount: 125, // 25 per cohort x 5 cohorts, unlimited allowed
};

export const INTERVIEW_TAGS: string[] = [
  'Time Friction',
  'Cost & Equipment',
  'Intimidation Factor',
  'Swing Plateau',
  'Muscle Memory',
  'Home Drills',
  'Coach Dependency',
  'Gadget Abandonment',
  'Social Golf',
  'Physical Strain',
  'Video Feedback Need',
  'Course Transition Failure',
];

export const FOLLOW_UP_PROBES: string[] = [
  'Can you tell me more about that specific moment?',
  'What made you feel that way?',
  'What did you try immediately afterwards?',
  'Why was that particularly frustrating or challenging?',
  'How did you try to solve or work around that problem?',
  'How often does that happen during your practice or rounds?',
  'What’s stopping you from doing that today?',
  'If you had a magic wand, what would have made that effortless?',
];

export const DISCOVERY_THEMES: { label: string; description: string }[] = [
  { label: 'Motivation', description: 'Underlying emotional drivers, triggers, and aspirations' },
  { label: 'Barriers', description: 'Cost, time, access, friction, and intimidation factors' },
  { label: 'Practice behavior', description: 'Frequency, habits, solo vs social, and routine consistency' },
  { label: 'Frustrations', description: 'Pain points with aids, plateauing, and inconsistent ball flight' },
  { label: 'Learning preferences', description: 'Self-guided vs coach, video, apps, and tactile muscle memory' },
  { label: 'Current solutions', description: 'Makeshift drills, purchased gadgets, and why they fall out of use' },
];

export const COHORTS_DATA: Record<CohortId, CohortInfo> = {
  aspiring: {
    id: 'aspiring',
    name: 'Aspiring Golfer — Never Played',
    shortLabel: 'Aspiring (Target: 25)',
    description:
      'Explore attraction, fears, misconceptions, barriers, learning preferences, and the reason interest has not yet become a first swing.',
    tags: ['Customer discovery', 'Behavior focused', 'Early interest', 'No prior rounds'],
    questions: [
      'How did you first become interested in golf?',
      'What appeals to you most about golf?',
      'Why does learning golf feel relevant to you now?',
      'Who or what influenced your interest?',
      'What do you hope to get out of learning golf?',
      'What comes to mind when you think about playing golf?',
      'What seems like the easiest part of getting started?',
      'What seems most difficult?',
      'How intimidating or approachable does golf feel?',
      'What do you assume it takes to become decent at golf?',
      'What has prevented you from trying golf so far?',
      'Is there anything you feel uncertain or hesitant about?',
      'What do you think it would cost to get started?',
      'Do you feel you know enough to take a first lesson or visit a range?',
      'What is your biggest question about getting started?',
      'Where would you start learning?',
      'Would you prefer to learn on your own, with friends, through lessons, or online?',
      'How do you usually learn a new hobby or sport?',
      'What would build your confidence trying golf for the first time?',
      'What beginner guidance would be helpful?',
      'What would your ideal first golf experience look like?',
      'How would you know whether you want to continue?',
      'What would make the first experience enjoyable?',
      'What might make you quit after one try?',
      'If you could remove one obstacle to getting started, what would it be?',
    ],
  },
  novice: {
    id: 'novice',
    name: 'Inexperienced / Novice Golfer',
    shortLabel: 'Novice (Target: 25)',
    description:
      'Explore early golf experiences, practice behavior, confidence, frustrations, solutions already tried, and coaching.',
    tags: ['Customer discovery', 'Behavior focused', 'Early learner', 'Occasional player'],
    questions: [
      'How did you first become interested in golf and decide to try it?',
      'What stood out during your first few golf experiences?',
      'What do you enjoy most about golf, and what is most challenging?',
      'What do you usually do to get better?',
      'Tell me about the last time you practiced outside a round.',
      'How confident are you that you are practicing correctly?',
      'Where do you usually go for tips or advice?',
      'What is the most frustrating part of learning golf?',
      'Tell me about a time you felt stuck or discouraged.',
      'What mistakes do you find yourself repeating?',
      'What training tools or aids have you tried, and what was that experience like?',
      'If you have not tried any, why not?',
      'What has your experience been with online videos, apps, or other instruction?',
      'Have you considered lessons? Why or why not?',
      'What makes improvement difficult for you—time, cost, confidence, access, confusion, or something else?',
    ],
  },
  amateur: {
    id: 'amateur',
    name: 'Amateur Golfer',
    shortLabel: 'Amateur (Target: 25)',
    description:
      'Explore practice routines, training aids, frustrations, makeshift solutions, progress measurement, coaching, and practice barriers.',
    tags: ['Customer discovery', 'Behavior focused', 'Regular player', 'Gear conscious'],
    questions: [
      'How did you first get into golf, and what motivated you?',
      'What does your typical practice routine look like?',
      'Tell me about the last physical training aid you used.',
      'How did you discover it, and what problem were you hoping it would solve?',
      'What were your biggest frustrations or physical difficulties with it?',
      'Where is that aid now, and how often do you use it compared with when you bought it?',
      'Why have you not tried or bought other training aids?',
      'Have you ever improvised or \'hacked\' tools or routines at home? What happened?',
      'How do you measure your progress?',
      'Have you worked with a trainer or coach? Why or why not?',
      'Where do you first go for swing or ball-flight advice?',
      'What is your biggest barrier to practice—time, cost, or physical strain?',
    ],
  },
  mid: {
    id: 'mid',
    name: 'Mid-Level Golfer',
    shortLabel: 'Mid-Level (Target: 25)',
    description:
      'Explore established practice habits, equipment philosophy, plateaus, convenience, coaching-versus-tool decisions, and frustrations.',
    tags: ['Customer discovery', 'Behavior focused', 'Handicap focused', 'Technique driven'],
    questions: [
      'What is your current handicap, and what mechanical or physical milestones have you reached?',
      'Tell me about your most recent range or practice session.',
      'What is your philosophy on technology and physical equipment in training?',
      'Tell me about a training aid that proved effective and why it stayed in your routine.',
      'Describe a recommended tool that disappointed you. What went wrong?',
      'What makes a training aid practical and convenient for you?',
      'How do you balance fitness or strength development with technical development?',
      'What concerns would you have about a new aid or a heavy training regimen?',
      'Who do you trust for advanced equipment or techniques?',
      'How do you decide between spending on a coaching session and a self-guided tool?',
      'Tell me about a skill plateau and what you tried to break through it.',
      'What is one frustrating or tedious part of practice you would remove?',
    ],
  },
  coach: {
    id: 'coach',
    name: 'Professional Trainer / Coach',
    shortLabel: 'Coach (Target: 25)',
    description:
      'Explore coaching philosophy, physical limitations, training-aid use, homework, self-guided tools, data, and student behavior.',
    tags: ['Customer discovery', 'Behavior focused', 'PGA / Instructor', 'Biomechanics'],
    questions: [
      'How long have you coached, and what is your philosophy on building repeatable golf-specific muscle memory?',
      'What physical or strength limitations do you see most often?',
      'How do you integrate physical training aids into coaching sessions?',
      'What are the biggest pain points getting students to use tools correctly?',
      'What homework do you give, and how consistently do students practice?',
      'Why do golfers stop coaching or fail to make a long-term commitment?',
      'What is your experience with self-guided swing trainers, and what concerns do you have about use without supervision?',
      'What data do you track, such as launch monitor, swing speed, or spin data?',
      'Tell me about a student who brought in a self-bought training aid.',
      'What features make a practice tool safe, reproducible, and effective?',
      'How do you approach a beginner with zero muscle memory versus a mid-level golfer with ingrained habits?',
      'What would an ideal off-course home practice tool need to provide?',
    ],
  },
};

// Generate 25 distinct participant profiles for each of the 5 cohorts (125 total initial participants)
export function generateCohortParticipants(cohortId: CohortId): Participant[] {
  const cohortPrefixes: Record<CohortId, string> = {
    aspiring: 'ASP',
    novice: 'NOV',
    amateur: 'AM',
    mid: 'MID',
    coach: 'PRO',
  };

  const namesPool: Record<CohortId, string[]> = {
    aspiring: [
      'Sarah Lin', 'David Okafor', 'Elena Rostova', 'Mateo Morales', 'Chloe Bennett',
      'Jordan Lee', 'Hannah Schmidt', 'Tariq Vance', 'Avery Brooks', 'Liam Gallagher',
      'Mei-Ling Zhou', 'Lucas Silva', 'Zoe Washington', 'Ethan Miller', 'Pooja Sharma',
      'Noah Hernandez', 'Isabella King', 'Julian Ward', 'Sophia Rossi', 'Caleb Zhang',
      'Amber Robinson', 'Diego Santos', 'Mia Campbell', 'Ryan Murphy', 'Grace Kelly'
    ],
    novice: [
      'Jason Tyler', 'Priya Patel', 'Brendan Vance', 'Maya Goldstein', 'Liam O’Connor',
      'Samantha Fox', 'Tyler Ramirez', 'Kaitlyn Evans', 'Dylan Cooper', 'Nadia Al-Hassan',
      'Oliver Reed', 'Haley Jenkins', 'Marcus Cruz', 'Brooke Stewart', 'Connor Murphy',
      'Destiny Morgan', 'Zachary Cole', 'Lauren Price', 'Christian Bell', 'Victoria Chen',
      'Sean Kelly', 'Gabriella Gomez', 'Austin Bailey', 'Natalie Howard', 'Justin Ward'
    ],
    amateur: [
      'Marcus Chen', 'Rachel Adams', 'Derek Foster', 'Aisha Al-Mansoor', 'Carlos Mendez',
      'Kimberly Scott', 'Brett Larson', 'Danielle Kim', 'Eric Thornton', 'Chelsea Diaz',
      'Travis Meyer', 'Stephanie Hall', 'Adam Griffin', 'Megan Simmons', 'Kyle Foster',
      'Jessica Nguyen', 'Brian Hayes', 'Laura Martinez', 'Keith Fletcher', 'Heather Watson',
      'Patrick Ross', 'Erica Patterson', 'Corey Bryant', 'Vanessa Powell', 'Devin Cox'
    ],
    mid: [
      'Justin Becker', 'Naomi Tanaka', 'Trevor Higgins', 'Danielle Wu', 'Evan Kirkpatrick',
      'Mitchell Todd', 'Audrey Vance', 'Gavin Rivera', 'Courtney Baker', 'Lance Chapman',
      'Paige Hoffman', 'Trevor Knight', 'Valerie Ramos', 'Dominic Stone', 'Kelly Douglas',
      'Phillip Walsh', 'Monica Weaver', 'Garrett Larson', 'Diana Pierce', 'Raymond Fuller',
      'Alicia Wagner', 'Seth Reynolds', 'Taylor Morrison', 'Blake Snyder', 'Cynthia Olson'
    ],
    coach: [
      'Greg Callahan, PGA', 'Kelly McAllister, TPI', 'Arthur Sterling, PGA', 'Monique Dupont, LPGA', 'Darnell Washington, PGA',
      'Victor Hernandez, PGA', 'Sandra O’Neill, TPI', 'Bradley Chen, PGA', 'Evelyn St. Claire', 'Charles Montgomery, PGA',
      'Hannah Lindqvist', 'Terrence Boone, PGA', 'Jocelyn Alvarez, PGA', 'Robert MacIntyre, PGA', 'Dana Fletcher, TPI',
      'Jerome Dubois', 'Kirsten Nielsen, LPGA', 'Anthony Russo, PGA', 'Yvette Fontaine', 'Wade Hampton, PGA',
      'Simon Gallagher', 'Clara Vance, TPI', 'Roger Whitmore, PGA', 'Bethany Shaw, LPGA', 'Marcus Aurelius Brooks, PGA'
    ]
  };

  const biosPool: Record<CohortId, string[]> = {
    aspiring: [
      'Tech worker interested after visiting Topgolf with colleagues; wants low intimidation intro.',
      'Wants to learn for executive networking; worried about etiquette and looking inexperienced.',
      'Partner plays weekly; wants to join weekend scrambles without holding up the group.',
      'Former collegiate athlete looking for lifelong low-impact sport; confused by online tips.',
      'Inherited grandfather’s club set; afraid to go to commercial range alone.',
      'Curious after watching The Masters on TV; has no idea what gear is essential.',
      'Looking for active outdoor social hobby; intimidated by dress codes and course rules.',
      'Wants to try golf with family; sensitive to initial equipment costs.',
      'Attended corporate golf clinic once; wants structured step-by-step guidance.',
      'Enjoys VR / indoor golf simulators; hesitant to step onto a live grass fairway.',
      'Values mindfulness and outdoor focus; seeking welcoming practice environment.',
      'Friend offered to take them out; wants basic contact practice first.',
      'Looking for structured beginner group clinics; avoids high-pressure 1-on-1s.',
      'Enjoys fitness & racquet sports; curious how swing biomechanics compare.',
      'Wants to learn with spouse; needs beginner-friendly short-game drills.',
      'Interested in evening twilight rounds for relaxation after office work.',
      'Wants to test rental gear before committing $1,000 to a starter set.',
      'Watches golf YouTube for aesthetics; curious about muscle memory drills.',
      'Enjoys competitive sports; wants to know realistic timeline to shoot under 100.',
      'Local municipal course opened a learning academy; evaluating beginner packages.',
      'Interested in casual Par-3 golf; finds 18-hole rounds too long.',
      'Looking for female-friendly community golf programs and beginner meetups.',
      'Has bad back; needs gentle ergonomic guidance on swing rotation.',
      'Interested in driving range gamification like Toptracer; looking for fun drills.',
      'Seeks clear roadmap from first grip to playing first 9-hole round.'
    ],
    novice: [
      'Struggles with extreme slice off tee; gets discouraged after 3 bad holes.',
      'Practices at range every two weeks; feels progress resets between sessions.',
      'Bought putting mat and alignment sticks; abandoned in closet after 2 weeks.',
      'Hesitant about $150/hr coach fees; wants reliable self-guided feedback.',
      'Suffering from wrist soreness after hitting off hard synthetic driving range mats.',
      'Shoots 115-125; loses 6 balls a round; looking for off-the-tee consistency.',
      'Gets swing advice from 4 different friends; completely overloaded with thoughts.',
      'Plays 9-hole executive rounds; terrified of holding up groups behind them.',
      'Struggles with topped fairway woods and chunky wedge contact.',
      'Tried smartphone swing analysis apps; found lines and angles confusing to apply.',
      'Lacks practice space at home; wants compact drills for apartment living.',
      'Can hit well on range mats but tops everything off real course turf.',
      'Has trouble transferring range confidence onto real first-tee pressure.',
      'Wants simple feedback device that chirps or clicks on good takeaway.',
      'Can only practice 30 minutes on weekdays; needs ultra-efficient drills.',
      'Frustrated by 3-putting every green; looking for lag-putting feel.',
      'Finds conventional training aids too complicated to set up and transport.',
      'Suffers from early extension and lifting head through impact.',
      'Looking for reliable drill to stop lunging forward with shoulders.',
      'Wants a practice routine that takes under 20 minutes before a round.',
      'Struggles with distance control on short chip shots around green.',
      'Watches Instagram swing tips; changes swing thought every 15 minutes.',
      'Enjoys playing with friends but dislikes keeping scorecard due to high scores.',
      'Wants clear physical feeling for proper hip turn rather than arm swinging.',
      'Seeks measurable milestone to drop from 120 to sub-100 scoring.'
    ],
    amateur: [
      'Plays twice a month; tests swing trainers frequently; struggles with course transfer.',
      'Hacks DIY towel drills at home; finds commercial aids overpriced and bulky.',
      'Obsessed with YouTube golf channels; gets overwhelmed by conflicting models.',
      'Handicap 18.2; wants repeatable contact; struggles with early extension.',
      'Plays weekend leagues; finds launch monitors too expensive; wants simple feedback.',
      'Handicap 21.0; struggles with iron dispersion and push-slices under tournament pressure.',
      'Practices 2x weekly during season; loses feel entirely during winter layoff.',
      'Invested in weighted swing club; found it messed up normal club tempo.',
      'Wants kinesthetic feedback on proper lag and wrist hinge at top of backswing.',
      'Handicap 23.5; drives 230 yards but inconsistent strike location on face.',
      'Values feedback that doesn’t require staring at a smartphone screen mid-drill.',
      'Looking for home indoor drills that safely reinforce kinematic sequence.',
      'Struggles with casting and flipping wrists right before impact.',
      'Finds alignment sticks awkward to set up on crowded public driving ranges.',
      'Wants training tool that fits in golf bag pocket without heavy assembly.',
      'Handicap 19.5; plays company scramble tournaments; wants confident fairway woods.',
      'Frustrated by plateau between 88 and 96; wants specific fault isolation.',
      'Has used speed training sticks; worried about developing bad swing habits.',
      'Needs feedback on weight transfer from trail foot to lead heel during downswing.',
      'Prefers drills that create exaggerated sensations of proper swing plane.',
      'Finds 1-on-1 coaching sessions hard to retain without between-lesson tools.',
      'Wants reliable drill for bunker shots and wet sand conditions.',
      'Experiences right shoulder strain from over-swinging; seeks smoother tempo.',
      'Uses impact tape on irons; wants physical aid that guides center contact.',
      'Desires an objective benchmark to know when a practice drill has succeeded.'
    ],
    mid: [
      'Handicap 11.2; plateaued just above single digits; highly discerning with tools.',
      'Has home simulator net; balances gym strength workouts with speed protocols.',
      'Values quantifiable biofeedback over subjective swing feels; tracks launch data.',
      'Balances executive career with club tournaments; time efficiency is #1 priority.',
      'Wary of training gadgets that build artificial plane habits that collapse under pressure.',
      'Handicap 9.4; seeks 1.5 mph ball speed gain without compromising dispersion.',
      'Uses pressure plates and force pedals; focused on ground reaction force.',
      'Struggles with hook miss under weekend tournament playoff pressure.',
      'Requires training aids to be easily calibrated and scientifically grounded.',
      'Handicap 12.0; analyzes 120fps slow-motion video of swing path weekly.',
      'Needs training tools that provide real-time audio or tactile feedback at impact.',
      'Focuses on wedge matrix (50, 75, 100 yard precision distances).',
      'Plateaued at 82 scoring average; wants to eliminate the 2 catastrophic penalty holes.',
      'Works with golf fitness trainer; wants training aid compatible with gym routine.',
      'Travels for business 2 weeks a month; needs travel-friendly hotel room drill tool.',
      'Handicap 10.5; frustrated by inconsistent face-to-path angle with driver.',
      'Wants tools that measure transition tempo and backswing-to-downswing ratio.',
      'Critical of gimmicky Instagram ads; demands endorsements from respected tour fitters.',
      'Struggles with over-rotating pelvis and getting stuck behind the ball.',
      'Has home launch monitor; wants mechanical training aid to pair with radar numbers.',
      'Values mental game and preshot routine consistency under pressure.',
      'Wants training device that provides resistance without stressing spinal discs.',
      'Looking for speed gains without throwing off clubface control.',
      'Handicap 11.8; wants repeatable lag drill that prevents flip at bottom of arc.',
      'Seeks clear path to reach scratch / single-digit handicap within 18 months.'
    ],
    coach: [
      'PGA Master Professional (18 yrs); frustrated students do not practice homework.',
      'TPI Certified Golf Fitness (12 yrs); focuses on kinematic sequence and pelvic stability.',
      'PGA Teaching Pro (25 yrs); tested 200+ aids; 95% fail from lack of instant feedback.',
      'Tour Caddie & Coach (14 yrs); emphasizes pressure training and course feel.',
      'Urban youth golf director; teaches accessible golf; passionate about intuitive tools.',
      'Head PGA Instructor at resort; teaches 40 corporate students and clinics per week.',
      'Biomechanical specialist; uses 3D motion capture and force vector analysis.',
      'Junior golf academy director; needs aids that are safe, durable, and fun for kids.',
      'Former tour player coaching competitive collegiate teams; values transfer under pressure.',
      'Emphasizes external focus of attention over internal micromanagement of body parts.',
      'Frustrated by students buying random gadgets that contradict their swing philosophy.',
      'Wants off-course homework tool that gives auditable confirmation student did drills.',
      'Sees rampant lumbar injuries from rigid mechanical swing guides; warns against them.',
      'Believes tempo and rhythm are 80% of repeatable ball-striking for amateurs.',
      'Needs training tools that accommodate both right-handed and left-handed players.',
      'Teaches senior golfers with reduced hip mobility; needs aids for modified swings.',
      'Integrates video analysis into all lessons; needs students to see and feel the delta.',
      'Finds setup time of complicated training aids eats up expensive lesson minutes.',
      'Wants students to build self-correcting intuition rather than instructor dependency.',
      'Specializes in short-game artistry and greenside bunker recovery techniques.',
      'Uses biofeedback sensors; wants low-tech physical counterparts for home practice.',
      'Focuses on clubface angle control as the primary variable in shot dispersion.',
      'Advises equipment manufacturers on ergonomic safety and kinesthetic feedback.',
      'Wants aids that promote effortless clubhead speed rather than muscle tension.',
      'Passionate about standardizing customer discovery to build the ultimate training tool.'
    ]
  };

  const pNames = namesPool[cohortId];
  const pBios = biosPool[cohortId];
  const prefix = cohortPrefixes[cohortId];

  return pNames.map((name, index) => {
    const numStr = String(index + 1).padStart(2, '0');
    return {
      id: `${prefix}-${numStr}`,
      name,
      cohortId,
      email: `${name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@study.io`,
      experienceLevel:
        cohortId === 'aspiring'
          ? '0 rounds (Pure Beginner)'
          : cohortId === 'novice'
          ? 'Novice (< 1 year)'
          : cohortId === 'amateur'
          ? 'Amateur (2-5 years)'
          : cohortId === 'mid'
          ? 'Mid-Level (5-10 years)'
          : 'Professional Coach / Instructor',
      handicapOrRounds:
        cohortId === 'aspiring'
          ? 'Never played on course'
          : cohortId === 'novice'
          ? `Score ~110-125`
          : cohortId === 'amateur'
          ? `Handicap: ${(18 + (index % 8)).toFixed(1)}`
          : cohortId === 'mid'
          ? `Handicap: ${(8 + (index % 6)).toFixed(1)}`
          : 'PGA / TPI Certified Instructor',
      status: 'not_started',
      briefBio: pBios[index] || 'Customer discovery participant ready for cohort interview.',
    };
  });
}

// Master initial participant list: 25 participants for EACH of the 5 cohorts (125 participants total)
export const INITIAL_ALL_COHORTS_PARTICIPANTS: Participant[] = [
  ...generateCohortParticipants('aspiring'),
  ...generateCohortParticipants('novice'),
  ...generateCohortParticipants('amateur'),
  ...generateCohortParticipants('mid'),
  ...generateCohortParticipants('coach'),
];

export const DEMO_STEPS: DemoStep[] = [
  {
    tab: 'participants',
    title: '1. Select Cohort & 25-Interview Roster',
    prompt: 'Browse your active cohort. Notice each cohort has its own target of 25 interviews (125 total), with unlimited interviews supported.',
  },
  {
    tab: 'interview',
    title: '2. Video & Voice Interview Mode',
    prompt: 'Conduct the interview using real or simulated camera video and microphone voice recording. Works seamlessly on both laptop and mobile.',
  },
  {
    tab: 'review',
    title: '3. Verify & Auto-Save Session',
    prompt: 'Review completed question answers, quotes, video/audio status, then commit to high-capacity storage with instant backup.',
  },
  {
    tab: 'dashboard',
    title: '4. Track Quota per Specific Cohort',
    prompt: 'Inspect progress towards 25 for each specific cohort, watch recorded sessions, and export cohort data as CSV or JSON.',
  },
  {
    tab: 'storage',
    title: '5. Storage & Email Archive',
    prompt: 'Set your designated storage email address and dispatch full cohort interview packages with a single tap.',
  },
];
