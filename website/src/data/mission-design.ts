/**
 * Mission Design Library — sample problems.
 *
 * Concept preview. Every problem is a composite built from public
 * information; none describes a specific OCEANS engagement. Only the
 * first problem carries a full write-up so far. The rest ship with the
 * prompt and opening questions, which is enough to practice them.
 */

export type Complexity = "Medium" | "Hard" | "Very Hard";

export const COMPLEXITY_BARS: Record<Complexity, number> = {
  Medium: 3,
  Hard: 4,
  "Very Hard": 5,
};

export interface Requirement {
  metric: string;
  threshold: string;
  objective: string;
}

export interface Sizing {
  value: string;
  label: string;
  note: string;
  binding?: boolean;
}

export interface TradeOff {
  decision: string;
  a: string;
  b: string;
  pick: "a" | "b";
  why: string;
}

export interface Note {
  t: string;
  d: string;
}

export interface Measure {
  kind: "MOE" | "MOP";
  measure: string;
  how: string;
}

export interface WriteUp {
  readTime: string;
  functional: string[];
  nonFunctional: Requirement[];
  sizing: Sizing[];
  sizingNote: string;
  diagramCaption: string;
  tradeOffs: TradeOff[];
  federal: Note[];
  failureModes: Note[];
  measures: Measure[];
}

export interface MissionProblem {
  n: number;
  slug: string;
  title: string;
  short: string;
  domain: string;
  capability: { slug: string; label: string };
  complexity: Complexity;
  constraints: string[];
  prompt: string;
  questions: string[];
  writeUp?: WriteUp;
}

export const problems: MissionProblem[] = [
  {
    n: 1,
    slug: "vessel-of-interest-fusion",
    title: "Design a vessel-of-interest fusion pipeline for a maritime common operating picture",
    short: "Fuse AIS, coastal radar and satellite detections into one picture, and flag the vessels that go dark.",
    domain: "Maritime",
    capability: { slug: "mission-data", label: "Mission Data" },
    complexity: "Hard",
    constraints: ["Cross-agency sharing", "CUI marking", "PIA", "Human in the loop"],
    prompt:
      "Four agencies watch the same stretch of coastline with different sensors, and none of them sees the whole picture. Design a system that fuses AIS, coastal radar and satellite detections into one common operating picture, flags vessels of interest, and shares the result with partners who are each allowed to see different things.",
    questions: [
      "Which decisions does the watch floor make from this picture, and how fast does it need to make them?",
      "Who are the partners, and what is each one allowed to see? Does any feed sit above CUI, and could the fused picture itself be classified by compilation?",
      "Who defines a vessel of interest: policy, the analysts, or us?",
      "What happens today when two sensors disagree about a track?",
      "Does the picture have to keep working when the satellite or partner feeds drop?",
      "How long do we keep the data, and under which records schedule?",
    ],
    writeUp: {
      readTime: "14 min",
      functional: [
        "Ingest terrestrial AIS, satellite AIS, coastal radar tracks and satellite SAR detections, each through its own adapter.",
        "Correlate reports from different sources into one fused track per vessel, and keep the source tracks behind it.",
        "Detect dark gaps, AIS identity changes, loitering and ship-to-ship rendezvous.",
        "Score vessels of interest with reasons an analyst can read, and route them to a review queue.",
        "Serve the picture to the watch floor, and a filtered feed to each partner under its own agreement.",
        "Record every analyst decision and every release to a partner.",
      ],
      nonFunctional: [
        { metric: "Sensor report to picture (p95)", threshold: "≤ 10 s", objective: "≤ 3 s" },
        { metric: "Dark-gap alert after AIS goes silent", threshold: "≤ 15 min", objective: "≤ 5 min" },
        { metric: "Watch-floor picture availability", threshold: "99.5%", objective: "99.9%" },
        { metric: "Fused-track mis-association rate", threshold: "≤ 2%", objective: "≤ 0.5%" },
        { metric: "Releases to the wrong partner or with the wrong fields", threshold: "0", objective: "0, with audit proof" },
      ],
      sizing: [
        { value: "~15,000", label: "Vessels in view at peak", note: "One regional area of responsibility, port approaches included" },
        { value: "~2,500/s", label: "AIS reports", note: "15,000 vessels at about one report every 6 s" },
        { value: "~2,000/s", label: "Radar track updates", note: "20 coastal radars, ~400 tracks each, 4 s scan" },
        { value: "~45 GB/day", label: "Normalized storage", note: "~390M records a day at ~120 bytes each" },
        { value: "~4 TB", label: "Hot store", note: "90 days online; older data moves to the archive tier" },
        { value: "~150/hr", label: "Flags the watch can review", note: "6 analysts × ~25 reviews an hour. This is the number that bounds the design.", binding: true },
      ],
      sizingNote:
        "The machines are the easy part. 4,500 messages a second is modest for any modern stream. The real ceiling is six people on a watch, so the scorer is designed to stay under their review rate, not the hardware's.",
      diagramCaption:
        "Source tracks are never thrown away: every fused track points back to the reports that formed it. The release gateway sits in its own authorization boundary, and every analyst decision and partner release lands in the audit ledger.",
      tradeOffs: [
        {
          decision: "One fused track, or keep the source tracks?",
          a: "Replace source tracks with a single fused track",
          b: "A fused track that points to every source track behind it",
          pick: "b",
          why: "When an analyst asks why the system thinks two contacts are one ship, the answer has to be on screen. A fused track that has thrown its inputs away can't defend itself, and it can't be split when the association turns out to be wrong.",
        },
        {
          decision: "Where does correlation run?",
          a: "At each sensor site",
          b: "Centrally, partitioned by geographic cell",
          pick: "b",
          why: "Cross-sensor association needs every source in one place. Partitioning the stream by cell keeps each correlator small, and neighbouring cells hand off tracks that cross the line.",
        },
        {
          decision: "Rules or a model for vessel-of-interest scoring?",
          a: "A learned model from day one",
          b: "Readable rules first, a model once analyst decisions build a labeled set",
          pick: "b",
          why: "A referral has to state its reasons. Rules give readable reasons on day one, and every accept or dismiss an analyst records becomes training data for the model that comes later.",
        },
        {
          decision: "Partner sharing: one feed, or one per agreement?",
          a: "One shared feed that partners filter on their side",
          b: "A gateway that filters per agreement before anything leaves",
          pick: "b",
          why: "If the filtering happens on the partner's side, the data has already left. The gateway applies each agreement's field rules, stamps the marking and logs the release.",
        },
        {
          decision: "Stream every detector, or batch some?",
          a: "Run every behavior detector on the stream",
          b: "Stream the fast detectors, batch pattern-of-life every 15 minutes",
          pick: "b",
          why: "A dark-gap alert is worth minutes. Pattern-of-life analysis is worth hours, and running it continuously costs far more than it returns.",
        },
      ],
      federal: [
        { t: "Draw the ATO boundary on purpose", d: "The release gateway sits in its own system boundary, so a partner agreement can change without reopening the core system's authorization." },
        { t: "PIA before the first byte", d: "Vessel ownership records and crew lists carry personal information. The Privacy Impact Assessment decides which fields the system may hold and for how long, and that shapes the schema." },
        { t: "An ISA and an MOA for every feed", d: "Each partner connection needs an Interconnection Security Agreement and a Memorandum of Agreement. Budget weeks for each, and build adapters so a new feed is configuration, not code." },
        { t: "Markings travel with the record", d: "Each record carries its CUI categories and dissemination controls from ingest. A fused track carries all of them, because CUI categories are not ranked: its marking is the sum of its inputs, and it can be released only where every input allows. Check the program's classification guide too, since a fused picture can reveal coverage or patterns that are classified by compilation." },
        { t: "Retention is a requirement", d: "How long data lives comes from the agency's records schedule, not from storage cost. The 90-day hot tier and the archive rules both trace to it." },
        { t: "Section 508 covers the watch floor", d: "The picture has to work from a keyboard, and alert states can't rely on color alone." },
      ],
      failureModes: [
        { t: "Alert fatigue", d: "Flags outrun analyst capacity and the queue gets ignored. Hold flag volume under the 150-an-hour budget and watch dismissal rates every week." },
        { t: "Spoofed AIS taken as truth", d: "AIS is self-reported. Cross-check identity against radar and SAR, and treat AIS-only contacts as lower confidence." },
        { t: "Clock drift between sources", d: "A few seconds of skew makes one ship look like two. Timestamp at the sensor, and correct or reject reports that arrive outside tolerance." },
        { t: "A partner agreement changes quietly", d: "The MOA is amended and nobody updates the gateway. Version the release rules, tie each version to the signed agreement, and test releases against it." },
      ],
      measures: [
        { kind: "MOE", measure: "Lead time on a vessel of interest before it reaches the port approach (threshold ≥ 30 min, objective ≥ 2 h)", how: "A red team runs dark-vessel scenarios the watch has not seen during a live exercise. A white team runs the event and scores each run against an analysis plan written beforehand." },
        { kind: "MOE", measure: "Time from flag to analyst decision (threshold ≤ 10 min, objective ≤ 3 min)", how: "Instrument the review queue during an operational assessment with real watch-standers." },
        { kind: "MOP", measure: "Sensor-to-picture latency, p95", how: "Synthetic load at twice peak, timestamped at the sensor, the stream and the display. Feeds the lead-time MOE." },
        { kind: "MOP", measure: "Dark-gap alert latency", how: "Cut AIS from chosen vessels in replayed traffic while radar or SAR still holds them, then confirm with cooperative vessels in the exercise. Time each alert against the 15-minute threshold." },
        { kind: "MOP", measure: "Track mis-association rate, scored by vessel class", how: "Replay recorded traffic against ground truth from a cooperative-vessel test." },
        { kind: "MOP", measure: "Watch-floor picture availability", how: "Logged over a 30-day operational assessment, with maintenance windows declared in advance." },
        { kind: "MOP", measure: "Release correctness", how: "Automated tests for every agreement version. One wrong field fails the build." },
      ],
    },
  },
  {
    n: 2,
    slug: "counter-uas-site-alerting",
    title: "Design a counter-UAS alerting system for a critical infrastructure site",
    short: "Detect, track and identify drones near a coastal power plant without crying wolf, then hand off to whoever holds the authority to act.",
    domain: "C-UAS",
    capability: { slug: "systems-engineering", label: "Systems Engineering" },
    complexity: "Very Hard",
    constraints: ["Legal authorities", "Human in the loop", "ATO boundary"],
    prompt:
      "A power plant on the coast logs a drone sighting most weeks, and most of them are hobbyists. Design a detect, track and identify system that tells the site's security team which contacts matter, without crying wolf, and that hands off cleanly to the agencies that hold mitigation authority.",
    questions: [
      "Which agencies can legally mitigate here, and what does the site itself own?",
      "What false-alarm rate will the security team put up with before they stop looking?",
      "Which sensors are allowed at the site: RF, radar, EO/IR, acoustic? Any spectrum limits?",
      "How do we tell an authorized drone, a utility inspection say, from an unknown one?",
      "Who is on shift at 3 a.m., and what can they actually do with an alert?",
    ],
  },
  {
    n: 3,
    slug: "traceability-rebaseline",
    title: "Design a requirements traceability service that survives a re-baseline",
    short: "Carry 4,000 requirements through a mid-program re-baseline without losing the thread to test and hardware.",
    domain: "Acquisition",
    capability: { slug: "requirements", label: "Requirements" },
    complexity: "Medium",
    constraints: ["Re-baseline", "CUI marking", "Disconnected ops"],
    prompt:
      "A program carries 4,000 requirements across three baselines, linked to systems, test cases and fielded hardware. Mid-program the sponsor re-baselines and 600 requirements change. Design a traceability service that shows exactly what the change touches, keeps the history auditable, and still exports to the tools the program office already uses.",
    questions: [
      "Is the system of record the traceability tool, or the signed baseline documents?",
      "Who approves a change, and does that approval have to live inside the system?",
      "Which exports are non-negotiable: DOORS, Excel, ReqIF?",
      "Does \"traced\" mean linked, or linked and verified by a test?",
      "Does it have to run on a disconnected network?",
    ],
  },
  {
    n: 4,
    slug: "ote-test-data-pipeline",
    title: "Design the data pipeline for an operational test event",
    short: "Collect sensor, operator and white-team data at a remote range so every measure in the test plan holds up afterward.",
    domain: "T&E",
    capability: { slug: "rdte", label: "RDT&E" },
    complexity: "Medium",
    constraints: ["Disconnected ops", "CUI marking", "Human in the loop"],
    prompt:
      "A two-week operational test runs at a remote range with patchy connectivity. Sensors, operator logs and white-team observers all generate data. Design the collection pipeline so every measure in the test plan can be computed afterward, the chain of custody holds up, and nothing depends on the network being up.",
    questions: [
      "Is the analysis plan locked before the event, and who signs it?",
      "Which clocks do we trust, and how do we sync them without a network?",
      "What counts as a valid trial, and who rules on the disputed ones?",
      "How do observer notes get structured enough to compute against?",
      "Where does the data go at the end, and under what marking?",
    ],
  },
  {
    n: 5,
    slug: "cargo-manifest-risk-scoring",
    title: "Design a cargo manifest risk-scoring service for a seaport",
    short: "Score container manifests before the ship arrives, explain every score, and learn from what inspections find.",
    domain: "Border",
    capability: { slug: "mission-data", label: "Mission Data" },
    complexity: "Hard",
    constraints: ["PIA", "Human in the loop", "Cross-agency sharing", "ATO boundary"],
    prompt:
      "Thousands of container manifests arrive ahead of each vessel, and officers can physically inspect only a small fraction of them. Design a service that scores manifests for risk, explains every score in terms an officer can act on, and learns from inspection results without encoding bias the agency can't defend.",
    questions: [
      "What is the inspection capacity per vessel, and does it change by port?",
      "Which data sources is the service allowed to use under its PIA?",
      "How soon do inspection results come back, and how reliable are they?",
      "Which features are off limits for fairness or legal reasons?",
      "Does a score ever trigger action on its own, or only a referral?",
    ],
  },
];

export const DOMAINS = [...new Set(problems.map((p) => p.domain))];
export const CAPABILITIES = [...new Set(problems.map((p) => p.capability.label))];
export const COMPLEXITIES: Complexity[] = ["Medium", "Hard", "Very Hard"];
export const CONSTRAINTS = [...new Set(problems.flatMap((p) => p.constraints))].sort();

export const COMPOSITE_NOTE =
  "A composite built from public information. It does not describe a specific OCEANS engagement, customer system or solicitation, and every figure on this page is an assumption for the exercise.";
