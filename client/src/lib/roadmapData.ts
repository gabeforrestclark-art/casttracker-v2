// Working Man's Waters — Complete Day-by-Day Roadmap
// Covers: Campaign Launch Prep → Season 1 → Off-Season → Season 2 → Off-Season → Season 3 → Off-Season → Season 4 Finish

export interface RoadmapTask {
  id: string;
  label: string;
  detail?: string;
  category: "gear" | "media" | "fundraising" | "fishing" | "business" | "admin";
}

export interface RoadmapDay {
  dayId: string;
  date: string;       // YYYY-MM-DD
  label: string;      // e.g. "Day 1 — Saturday, April 7, 2026"
  isTripDay: boolean;
  tripNumber?: number;
  siteName?: string;
  milestone?: string; // e.g. "🎯 FIRST TRIP EVER"
  tasks: RoadmapTask[];
}

export interface RoadmapPhase {
  phaseId: string;
  title: string;
  subtitle: string;
  dateRange: string;
  color: string; // oklch color string
  icon: string;
  days: RoadmapDay[];
}

export const ROADMAP_PHASES: RoadmapPhase[] = [
  // ─────────────────────────────────────────────
  // PHASE 0: LAUNCH PREP (March 30 – April 6, 2026)
  // ─────────────────────────────────────────────
  {
    phaseId: "phase-0",
    title: "LAUNCH PREP",
    subtitle: "Get everything ready before the first paddle hits the water",
    dateRange: "March 30 – April 6, 2026",
    color: "oklch(0.65 0.18 50)",
    icon: "🚀",
    days: [
      {
        dayId: "p0-d1",
        date: "2026-03-30",
        label: "Monday, March 30 — Week Before Launch",
        isTripDay: false,
        milestone: "🚀 CAMPAIGN KICKOFF WEEK",
        tasks: [
          { id: "p0-d1-t1", label: "Create GoFundMe campaign page (use the copy from Fundraising_Copy.md)", category: "fundraising" },
          { id: "p0-d1-t2", label: "Create Patreon page with all 3 tier descriptions", category: "fundraising" },
          { id: "p0-d1-t3", label: "Set up Instagram account: @WorkingMansWaters", category: "media" },
          { id: "p0-d1-t4", label: "Set up TikTok account: @WorkingMansWaters", category: "media" },
          { id: "p0-d1-t5", label: "Set up YouTube channel: Working Man's Waters", category: "media" },
        ],
      },
      {
        dayId: "p0-d2",
        date: "2026-03-31",
        label: "Tuesday, March 31",
        isTripDay: false,
        tasks: [
          { id: "p0-d2-t1", label: "Set up Facebook Group: Working Man's Waters — MN Kayak Fishing", category: "media" },
          { id: "p0-d2-t2", label: "Film the 3-minute campaign announcement video (use the script)", category: "media", detail: "Wear your work clothes. Film at the truck. Don't over-edit." },
          { id: "p0-d2-t3", label: "Edit and upload the announcement video to YouTube (unlisted for now)", category: "media" },
          { id: "p0-d2-t4", label: "Design or order kayak decal / truck decal for Working Man's Waters branding", category: "business" },
        ],
      },
      {
        dayId: "p0-d3",
        date: "2026-04-01",
        label: "Wednesday, April 1",
        isTripDay: false,
        tasks: [
          { id: "p0-d3-t1", label: "Send sponsorship email to 3 local Moorhead/Fargo businesses (use the template)", category: "business" },
          { id: "p0-d3-t2", label: "Print and distribute Weekend Warrior Package flyers (Snow Bros)", category: "business" },
          { id: "p0-d3-t3", label: "Contact Heroes on the Water MN chapter — introduce the campaign", category: "fundraising", detail: "heroesonthewater.org — let them know you're pledging 15% of donations" },
          { id: "p0-d3-t4", label: "Confirm MN fishing license is purchased for 2026 season", category: "admin" },
        ],
      },
      {
        dayId: "p0-d4",
        date: "2026-04-02",
        label: "Thursday, April 2 — Pre-Trip Prep",
        isTripDay: false,
        tasks: [
          { id: "p0-d4-t1", label: "Inspect and clean kayak — check hull, seat, footpegs", category: "gear" },
          { id: "p0-d4-t2", label: "Check all safety gear: PFD, whistle, first aid kit, dry bag", category: "gear" },
          { id: "p0-d4-t3", label: "Charge all camera batteries and clear SD cards", category: "media" },
          { id: "p0-d4-t4", label: "Rig rods for Red River — catfish/walleye setup", category: "fishing" },
          { id: "p0-d4-t5", label: "Check weather forecast for Saturday April 7", category: "fishing" },
          { id: "p0-d4-t6", label: "Make the announcement video public on YouTube", category: "media" },
          { id: "p0-d4-t7", label: "Post campaign launch on all social platforms with GoFundMe link", category: "media" },
        ],
      },
      {
        dayId: "p0-d5",
        date: "2026-04-06",
        label: "Monday, April 6 — Day Before Trip 1",
        isTripDay: false,
        tasks: [
          { id: "p0-d5-t1", label: "Load kayak on truck the night before", category: "gear" },
          { id: "p0-d5-t2", label: "Pack tackle box, cooler, water, snacks", category: "gear" },
          { id: "p0-d5-t3", label: "Post 'Tomorrow it begins' teaser on Instagram & TikTok", category: "media" },
          { id: "p0-d5-t4", label: "Post Snow Bros 'Where's Gabe?' Friday post on Facebook", category: "business" },
          { id: "p0-d5-t5", label: "Set alarm for early morning launch", category: "admin" },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────
  // PHASE 1: SEASON 1 (April 7 – November 28, 2026)
  // ─────────────────────────────────────────────
  {
    phaseId: "phase-1",
    title: "SEASON 1 — 2026",
    subtitle: "35 trips across Minnesota's northwest, central, and northeast regions",
    dateRange: "April 7 – November 28, 2026",
    color: "oklch(0.65 0.18 200)",
    icon: "🛶",
    days: [
      {
        dayId: "p1-d1",
        date: "2026-04-07",
        label: "Saturday, April 7 — TRIP 1",
        isTripDay: true,
        tripNumber: 1,
        siteName: "Red River - Moorhead Access",
        milestone: "🎯 FIRST TRIP — THE JOURNEY BEGINS",
        tasks: [
          { id: "p1-d1-t1", label: "Launch from Red River Moorhead Access — 2 min from home", category: "fishing" },
          { id: "p1-d1-t2", label: "Film intro shot: kayak on truck, Moorhead skyline, first paddle stroke", category: "media" },
          { id: "p1-d1-t3", label: "Fish for walleye and channel catfish", category: "fishing" },
          { id: "p1-d1-t4", label: "Film any catches with species, size, lure used", category: "media" },
          { id: "p1-d1-t5", label: "Film closing shot: 'Trip 1 of 124 — done'", category: "media" },
          { id: "p1-d1-t6", label: "Post Instagram reel same day", category: "media" },
        ],
      },
      {
        dayId: "p1-week1-post",
        date: "2026-04-06",
        label: "Monday, April 6 — Post-Trip 1 Content",
        isTripDay: false,
        tasks: [
          { id: "p1-w1-t1", label: "Edit and upload Trip 1 YouTube episode", category: "media" },
          { id: "p1-w1-t2", label: "Post journey map update to Facebook Group", category: "media" },
          { id: "p1-w1-t3", label: "Share GoFundMe update: 'Trip 1 complete!'", category: "fundraising" },
          { id: "p1-w1-t4", label: "Log trip details in Cast Tracker (fish caught, notes, photos)", category: "admin" },
        ],
      },
      {
        dayId: "p1-d2",
        date: "2026-04-11",
        label: "Saturday, April 11 — TRIP 2",
        isTripDay: true,
        tripNumber: 2,
        siteName: "Buffalo River State Park",
        tasks: [
          { id: "p1-d2-t1", label: "Drive 15 min to Buffalo River State Park, Glyndon", category: "fishing" },
          { id: "p1-d2-t2", label: "Film the river access and carry-in launch", category: "media" },
          { id: "p1-d2-t3", label: "Fish for smallmouth bass and northern pike", category: "fishing" },
          { id: "p1-d2-t4", label: "Film catch-and-release footage", category: "media" },
          { id: "p1-d2-t5", label: "Post Instagram story from the water", category: "media" },
        ],
      },
      {
        dayId: "p1-d3",
        date: "2026-04-18",
        label: "Saturday, April 18 — TRIP 3",
        isTripDay: true,
        tripNumber: 3,
        siteName: "Lake Lida",
        tasks: [
          { id: "p1-d3-t1", label: "Drive 45 min to Lake Lida, Pelican Rapids", category: "fishing" },
          { id: "p1-d3-t2", label: "Film the public ramp launch and lake overview", category: "media" },
          { id: "p1-d3-t3", label: "Fish for crappie, largemouth bass, and bluegill", category: "fishing" },
          { id: "p1-d3-t4", label: "Post TikTok: 'Crappie on a kayak — here's how'", category: "media" },
        ],
      },
      {
        dayId: "p1-d4",
        date: "2026-04-25",
        label: "Saturday, April 25 — TRIP 4",
        isTripDay: true,
        tripNumber: 4,
        siteName: "Detroit Lake",
        tasks: [
          { id: "p1-d4-t1", label: "Drive 50 min to Detroit Lakes public ramp", category: "fishing" },
          { id: "p1-d4-t2", label: "Film the Detroit Lakes waterfront and ramp", category: "media" },
          { id: "p1-d4-t3", label: "Fish for walleye and largemouth bass", category: "fishing" },
          { id: "p1-d4-t4", label: "Check in with any local sponsors — thank them publicly on social", category: "business" },
        ],
      },
      {
        dayId: "p1-may-milestone",
        date: "2026-05-01",
        label: "Friday, May 1 — Month 1 Check-In",
        isTripDay: false,
        milestone: "📊 1 MONTH IN — CHECK YOUR NUMBERS",
        tasks: [
          { id: "p1-may-t1", label: "Review GoFundMe progress — share update post", category: "fundraising" },
          { id: "p1-may-t2", label: "Review Patreon subscriber count — thank each patron by name", category: "fundraising" },
          { id: "p1-may-t3", label: "Check YouTube subscriber count and top-performing video", category: "media" },
          { id: "p1-may-t4", label: "Follow up with any unanswered sponsorship emails", category: "business" },
          { id: "p1-may-t5", label: "Send Snow Bros spring newsletter referencing the journey", category: "business" },
        ],
      },
      {
        dayId: "p1-d5",
        date: "2026-05-02",
        label: "Saturday, May 2 — TRIP 5",
        isTripDay: true,
        tripNumber: 5,
        siteName: "Otter Tail Lake",
        tasks: [
          { id: "p1-d5-t1", label: "Drive 55 min to Otter Tail Lake, Ottertail", category: "fishing" },
          { id: "p1-d5-t2", label: "Film the Otter Tail County lake scenery", category: "media" },
          { id: "p1-d5-t3", label: "Fish for walleye and muskie", category: "fishing" },
          { id: "p1-d5-t4", label: "Film 'Working Man's Walleye Opener' themed content", category: "media", detail: "This is a great episode theme — walleye opener on a kayak" },
        ],
      },
      {
        dayId: "p1-d6",
        date: "2026-05-09",
        label: "Saturday, May 9 — TRIP 6",
        isTripDay: true,
        tripNumber: 6,
        siteName: "Lake Christina",
        tasks: [
          { id: "p1-d6-t1", label: "Drive 58 min to Lake Christina, Ashby", category: "fishing" },
          { id: "p1-d6-t2", label: "Fish for walleye, perch, and crappie", category: "fishing" },
          { id: "p1-d6-t3", label: "Film 'local gem' style content — hidden lake nobody talks about", category: "media" },
        ],
      },
      {
        dayId: "p1-d7",
        date: "2026-05-16",
        label: "Saturday, May 16 — TRIP 7",
        isTripDay: true,
        tripNumber: 7,
        siteName: "Red Lake River - Crookston",
        tasks: [
          { id: "p1-d7-t1", label: "Drive 55 min to Red Lake River, Crookston", category: "fishing" },
          { id: "p1-d7-t2", label: "Film the river paddle — current, scenery, wildlife", category: "media" },
          { id: "p1-d7-t3", label: "Fish for northern pike and walleye", category: "fishing" },
        ],
      },
      {
        dayId: "p1-d8",
        date: "2026-05-23",
        label: "Saturday, May 23 — TRIP 8",
        isTripDay: true,
        tripNumber: 8,
        siteName: "Pelican Lake - Pelican Rapids",
        tasks: [
          { id: "p1-d8-t1", label: "Drive 45 min to Pelican Lake, Pelican Rapids", category: "fishing" },
          { id: "p1-d8-t2", label: "Fish for walleye and perch", category: "fishing" },
          { id: "p1-d8-t3", label: "Film 'Last local trip before the big journey begins' content", category: "media", detail: "Trip 9 will be the first journey trip over 1 hour away" },
        ],
      },
      {
        dayId: "p1-journey-start",
        date: "2026-05-30",
        label: "Saturday, May 30 — TRIP 9 — JOURNEY BEGINS",
        isTripDay: true,
        tripNumber: 9,
        siteName: "Thief River - Thief River Falls",
        milestone: "🗺️ FIRST JOURNEY TRIP — OVER 1 HOUR FROM HOME",
        tasks: [
          { id: "p1-j1-t1", label: "Drive 75 min to Thief River Falls — first bi-weekly journey trip", category: "fishing" },
          { id: "p1-j1-t2", label: "Film 'The journey officially begins' opening monologue in the truck", category: "media" },
          { id: "p1-j1-t3", label: "Fish the Thief River for northern pike and walleye", category: "fishing" },
          { id: "p1-j1-t4", label: "Film the journey map update — pin #9 added", category: "media" },
        ],
      },
      {
        dayId: "p1-summer-milestone",
        date: "2026-07-04",
        label: "Saturday, July 4 — Independence Day Trip",
        isTripDay: true,
        tripNumber: 15,
        siteName: "Crow Wing River - Motley",
        milestone: "🎆 JULY 4TH ON THE WATER",
        tasks: [
          { id: "p1-4th-t1", label: "Film a patriotic-themed episode — 'Freedom on the water'", category: "media", detail: "Great content for Heroes on the Water tie-in" },
          { id: "p1-4th-t2", label: "Mention Heroes on the Water mission in the video", category: "fundraising" },
          { id: "p1-4th-t3", label: "Post a donation drive push on all platforms", category: "fundraising" },
        ],
      },
      {
        dayId: "p1-halfway",
        date: "2026-08-01",
        label: "Saturday, August 1 — Season 1 Halfway Check",
        isTripDay: false,
        milestone: "📍 SEASON 1 HALFWAY POINT",
        tasks: [
          { id: "p1-half-t1", label: "Review total donations raised — share milestone update", category: "fundraising" },
          { id: "p1-half-t2", label: "Compile Season 1 highlight reel (first 17 trips)", category: "media" },
          { id: "p1-half-t3", label: "Reach out to 3 more local sponsors with updated pitch", category: "business" },
          { id: "p1-half-t4", label: "Review Snow Bros summer revenue — cross-promo working?", category: "business" },
        ],
      },
      {
        dayId: "p1-voyageurs",
        date: "2026-09-05",
        label: "Saturday, September 5 — TRIP 21 — VOYAGEURS NP",
        isTripDay: true,
        tripNumber: 21,
        siteName: "Kabetogama Lake - Voyageurs NP",
        milestone: "🏞️ VOYAGEURS NATIONAL PARK",
        tasks: [
          { id: "p1-voy-t1", label: "Drive 160 min to Kabetogama Lake — Voyageurs NP", category: "fishing" },
          { id: "p1-voy-t2", label: "Film the national park entry, wilderness scenery", category: "media" },
          { id: "p1-voy-t3", label: "Film Heroes on the Water donation check-in at Voyageurs", category: "fundraising", detail: "This is the milestone moment mentioned in the content calendar" },
          { id: "p1-voy-t4", label: "Fish for walleye and northern pike in the boundary waters area", category: "fishing" },
        ],
      },
      {
        dayId: "p1-bwca",
        date: "2026-09-19",
        label: "Saturday, September 19 — TRIP 23 — BWCA",
        isTripDay: true,
        tripNumber: 23,
        siteName: "Boundary Waters - Entry Point 4",
        milestone: "🌲 BOUNDARY WATERS CANOE AREA",
        tasks: [
          { id: "p1-bwca-t1", label: "Drive 165 min to BWCA Entry Point 4, Ely", category: "fishing" },
          { id: "p1-bwca-t2", label: "Confirm BWCA day permit (required — free at self-registration)", category: "admin" },
          { id: "p1-bwca-t3", label: "Film the wilderness paddle — no motors, pure kayak", category: "media" },
          { id: "p1-bwca-t4", label: "Fish for walleye and smallmouth bass", category: "fishing" },
          { id: "p1-bwca-t5", label: "Film 'most remote trip so far' content", category: "media" },
        ],
      },
      {
        dayId: "p1-season1-wrap",
        date: "2026-11-28",
        label: "Saturday, November 28 — TRIP 35 — SEASON 1 FINALE",
        isTripDay: true,
        tripNumber: 35,
        siteName: "Sakatah Lake - Waterville",
        milestone: "🏁 SEASON 1 COMPLETE — 35 TRIPS DONE",
        tasks: [
          { id: "p1-fin-t1", label: "Film the Season 1 finale episode — reflect on the journey so far", category: "media" },
          { id: "p1-fin-t2", label: "Film the Season 1 wrap-up documentary (compile best moments)", category: "media" },
          { id: "p1-fin-t3", label: "Post Season 1 total donation amount to all platforms", category: "fundraising" },
          { id: "p1-fin-t4", label: "Thank all Patreon supporters and sponsors by name", category: "fundraising" },
          { id: "p1-fin-t5", label: "Clean and winterize kayak and gear", category: "gear" },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────
  // PHASE 2: OFF-SEASON 1 (Dec 2026 – Mar 2027)
  // ─────────────────────────────────────────────
  {
    phaseId: "phase-2",
    title: "OFF-SEASON 1",
    subtitle: "Snow Bros winter ops + campaign content + Season 2 planning",
    dateRange: "December 2026 – March 2027",
    color: "oklch(0.55 0.12 260)",
    icon: "❄️",
    days: [
      {
        dayId: "p2-d1",
        date: "2026-12-05",
        label: "December — Snow Bros Season Kicks Off",
        isTripDay: false,
        milestone: "❄️ SNOW BROS WINTER MODE",
        tasks: [
          { id: "p2-d1-t1", label: "Film 'The Reality of the Working Man' plow truck vlog at 3 AM", category: "media", detail: "This is the off-season video that will go viral locally" },
          { id: "p2-d1-t2", label: "Post Season 1 recap video to YouTube", category: "media" },
          { id: "p2-d1-t3", label: "Run Snow Bros winter service promotion using the fishing audience", category: "business" },
          { id: "p2-d1-t4", label: "Review and update Patreon — post exclusive off-season content", category: "fundraising" },
        ],
      },
      {
        dayId: "p2-d2",
        date: "2027-01-15",
        label: "January — Mid-Winter Planning",
        isTripDay: false,
        tasks: [
          { id: "p2-d2-t1", label: "Plan Season 2 trip schedule — review next 35 sites", category: "admin" },
          { id: "p2-d2-t2", label: "Order any new gear needed for Season 2", category: "gear" },
          { id: "p2-d2-t3", label: "Film 'gear review' and 'what I learned in Season 1' YouTube video", category: "media" },
          { id: "p2-d2-t4", label: "Renew MN fishing license for 2027", category: "admin" },
          { id: "p2-d2-t5", label: "Send Season 2 sponsor pitch to 5 new businesses", category: "business" },
        ],
      },
      {
        dayId: "p2-d3",
        date: "2027-03-15",
        label: "March — Pre-Season 2 Prep",
        isTripDay: false,
        milestone: "🌱 SEASON 2 COUNTDOWN",
        tasks: [
          { id: "p2-d3-t1", label: "Inspect and service kayak after winter storage", category: "gear" },
          { id: "p2-d3-t2", label: "Film 'Season 2 is coming' announcement video", category: "media" },
          { id: "p2-d3-t3", label: "Post Season 2 trip schedule preview to social media", category: "media" },
          { id: "p2-d3-t4", label: "Confirm all Season 2 sponsors and deliverables", category: "business" },
          { id: "p2-d3-t5", label: "Update GoFundMe with Season 2 goals", category: "fundraising" },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────
  // PHASE 3: SEASON 2 (April 3 – November 27, 2027)
  // ─────────────────────────────────────────────
  {
    phaseId: "phase-3",
    title: "SEASON 2 — 2027",
    subtitle: "35 more trips — pushing deeper into Minnesota",
    dateRange: "April 3 – November 27, 2027",
    color: "oklch(0.65 0.18 200)",
    icon: "🛶",
    days: [
      {
        dayId: "p3-d1",
        date: "2027-04-03",
        label: "Saturday, April 3 — TRIP 36 — SEASON 2 OPENER",
        isTripDay: true,
        tripNumber: 36,
        siteName: "Red River - Moorhead Access",
        milestone: "🌊 SEASON 2 BEGINS — TRIP 36 OF 124",
        tasks: [
          { id: "p3-d1-t1", label: "Film 'Season 2 opener' episode — reflect on off-season", category: "media" },
          { id: "p3-d1-t2", label: "Post Season 2 launch across all platforms", category: "media" },
          { id: "p3-d1-t3", label: "Fish the Red River — back to the roots", category: "fishing" },
          { id: "p3-d1-t4", label: "Update journey map — 35 pins behind, 89 to go", category: "admin" },
        ],
      },
      {
        dayId: "p3-metro",
        date: "2027-06-05",
        label: "Saturday, June 5 — TRIP 43 — TWIN CITIES",
        isTripDay: true,
        tripNumber: 43,
        siteName: "Lake Minnetonka - Wayzata",
        milestone: "🏙️ FIRST METRO TRIP — LAKE MINNETONKA",
        tasks: [
          { id: "p3-metro-t1", label: "Drive 185 min to Lake Minnetonka — biggest drive yet", category: "fishing" },
          { id: "p3-metro-t2", label: "Film 'Working man from Moorhead hits the big city lakes'", category: "media" },
          { id: "p3-metro-t3", label: "Fish for largemouth bass and muskie", category: "fishing" },
          { id: "p3-metro-t4", label: "Film the contrast: rural work life vs. metro lake", category: "media" },
        ],
      },
      {
        dayId: "p3-trip70",
        date: "2027-09-11",
        label: "Saturday, September 11 — TRIP 70 — HALFWAY!",
        isTripDay: true,
        tripNumber: 70,
        siteName: "St. Croix River - Stillwater",
        milestone: "🎯 TRIP 70 — EXACTLY HALFWAY THROUGH THE JOURNEY",
        tasks: [
          { id: "p3-70-t1", label: "Film the 'halfway there' milestone episode", category: "media" },
          { id: "p3-70-t2", label: "Post a major GoFundMe push — 'halfway to the finish line'", category: "fundraising" },
          { id: "p3-70-t3", label: "Send a Heroes on the Water donation check", category: "fundraising" },
          { id: "p3-70-t4", label: "Film the journey map — 70 pins lit up", category: "media" },
          { id: "p3-70-t5", label: "Thank every single Patreon supporter in the video", category: "fundraising" },
        ],
      },
      {
        dayId: "p3-season2-wrap",
        date: "2027-11-27",
        label: "Saturday, November 27 — TRIP 70 — SEASON 2 FINALE",
        isTripDay: true,
        tripNumber: 70,
        siteName: "Season 2 Final Trip",
        milestone: "🏁 SEASON 2 COMPLETE — 70 TRIPS DONE",
        tasks: [
          { id: "p3-fin-t1", label: "Film Season 2 finale and year-in-review", category: "media" },
          { id: "p3-fin-t2", label: "Post cumulative donation total update", category: "fundraising" },
          { id: "p3-fin-t3", label: "Winterize all gear", category: "gear" },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────
  // PHASE 4: OFF-SEASON 2 (Dec 2027 – Mar 2028)
  // ─────────────────────────────────────────────
  {
    phaseId: "phase-4",
    title: "OFF-SEASON 2",
    subtitle: "Snow Bros winter ops + deepen the audience + Season 3 planning",
    dateRange: "December 2027 – March 2028",
    color: "oklch(0.55 0.12 260)",
    icon: "❄️",
    days: [
      {
        dayId: "p4-d1",
        date: "2027-12-01",
        label: "December 2027 — Winter Content Push",
        isTripDay: false,
        tasks: [
          { id: "p4-d1-t1", label: "Film Season 2 full recap documentary", category: "media" },
          { id: "p4-d1-t2", label: "Run Snow Bros winter promo tied to the journey audience", category: "business" },
          { id: "p4-d1-t3", label: "Renew MN fishing license for 2028", category: "admin" },
          { id: "p4-d1-t4", label: "Review gear — replace anything worn out after 70 trips", category: "gear" },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────
  // PHASE 5: SEASON 3 (April 1 – November 25, 2028)
  // ─────────────────────────────────────────────
  {
    phaseId: "phase-5",
    title: "SEASON 3 — 2028",
    subtitle: "35 more trips — southeast Minnesota and the final push",
    dateRange: "April 1 – November 25, 2028",
    color: "oklch(0.65 0.18 200)",
    icon: "🛶",
    days: [
      {
        dayId: "p5-d1",
        date: "2028-04-06",
        label: "Saturday, April 6 — TRIP 71 — SEASON 3 OPENER",
        isTripDay: true,
        tripNumber: 71,
        siteName: "Red River - Moorhead Access",
        milestone: "🌊 SEASON 3 BEGINS — TRIP 71 OF 124",
        tasks: [
          { id: "p5-d1-t1", label: "Film 'Three seasons in — still going' opener", category: "media" },
          { id: "p5-d1-t2", label: "Post Season 3 launch to all platforms", category: "media" },
          { id: "p5-d1-t3", label: "Fish the Red River — tradition maintained", category: "fishing" },
        ],
      },
      {
        dayId: "p5-trip100",
        date: "2028-07-06",
        label: "Saturday, July 6 — TRIP 100",
        isTripDay: true,
        tripNumber: 100,
        siteName: "Trip 100 Site",
        milestone: "💯 TRIP 100 — MAJOR MILESTONE",
        tasks: [
          { id: "p5-100-t1", label: "Film the 'Trip 100' celebration episode", category: "media" },
          { id: "p5-100-t2", label: "Run a major fundraising push — 'Trip 100 for the vets'", category: "fundraising" },
          { id: "p5-100-t3", label: "Invite a Heroes on the Water veteran to fish with you if possible", category: "fundraising" },
          { id: "p5-100-t4", label: "Post the journey map with 100 pins lit up", category: "media" },
        ],
      },
      {
        dayId: "p5-season3-wrap",
        date: "2028-11-25",
        label: "Saturday, November 25 — SEASON 3 FINALE",
        isTripDay: true,
        tripNumber: 105,
        siteName: "Season 3 Final Trip",
        milestone: "🏁 SEASON 3 COMPLETE — 105 TRIPS DONE",
        tasks: [
          { id: "p5-fin-t1", label: "Film Season 3 finale — 'One season left'", category: "media" },
          { id: "p5-fin-t2", label: "Post '19 trips to go' countdown update", category: "media" },
          { id: "p5-fin-t3", label: "Winterize all gear for the last time", category: "gear" },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────
  // PHASE 6: OFF-SEASON 3 (Dec 2028 – Mar 2029)
  // ─────────────────────────────────────────────
  {
    phaseId: "phase-6",
    title: "OFF-SEASON 3",
    subtitle: "Final winter — preparing for the grand finale season",
    dateRange: "December 2028 – March 2029",
    color: "oklch(0.55 0.12 260)",
    icon: "❄️",
    days: [
      {
        dayId: "p6-d1",
        date: "2028-12-01",
        label: "December 2028 — Final Winter Prep",
        isTripDay: false,
        milestone: "🏔️ LAST WINTER BEFORE THE FINISH LINE",
        tasks: [
          { id: "p6-d1-t1", label: "Film 'The final countdown' off-season vlog", category: "media" },
          { id: "p6-d1-t2", label: "Plan the Season 4 finale trip to Root River, Lanesboro", category: "admin" },
          { id: "p6-d1-t3", label: "Book lodging near Lanesboro for the finale weekend", category: "admin" },
          { id: "p6-d1-t4", label: "Renew MN fishing license for 2029", category: "admin" },
          { id: "p6-d1-t5", label: "Invite friends, family, or sponsors to the finale trip", category: "business" },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────
  // PHASE 7: SEASON 4 FINALE (April 7 – August 11, 2029)
  // ─────────────────────────────────────────────
  {
    phaseId: "phase-7",
    title: "SEASON 4 — THE FINALE",
    subtitle: "19 final trips — ending at the Root River, Lanesboro",
    dateRange: "April 7 – August 11, 2029",
    color: "oklch(0.65 0.18 50)",
    icon: "🏆",
    days: [
      {
        dayId: "p7-d1",
        date: "2029-04-07",
        label: "Saturday, April 7 — TRIP 106 — FINAL SEASON OPENER",
        isTripDay: true,
        tripNumber: 106,
        siteName: "Red River - Moorhead Access",
        milestone: "🌊 FINAL SEASON BEGINS — 19 TRIPS TO GO",
        tasks: [
          { id: "p7-d1-t1", label: "Film 'Last season opener' — emotional, reflective", category: "media" },
          { id: "p7-d1-t2", label: "Post '19 trips left' countdown to all platforms", category: "media" },
          { id: "p7-d1-t3", label: "Launch final GoFundMe push for the last season", category: "fundraising" },
        ],
      },
      {
        dayId: "p7-penultimate",
        date: "2029-08-04",
        label: "Saturday, August 4 — TRIP 123 — SECOND TO LAST",
        isTripDay: true,
        tripNumber: 123,
        siteName: "Second-to-last site",
        milestone: "⏳ ONE TRIP LEFT",
        tasks: [
          { id: "p7-pen-t1", label: "Film 'One trip left' — drive to the site in silence, then speak", category: "media" },
          { id: "p7-pen-t2", label: "Post the final countdown to social media", category: "media" },
          { id: "p7-pen-t3", label: "Confirm all logistics for the Root River finale", category: "admin" },
        ],
      },
      {
        dayId: "p7-finale",
        date: "2029-08-11",
        label: "Sunday, August 11 — TRIP 124 — THE GRAND FINALE",
        isTripDay: true,
        tripNumber: 124,
        siteName: "Root River - Lanesboro",
        milestone: "🏆 TRIP 124 — THE GRAND FINALE — ROOT RIVER, LANESBORO",
        tasks: [
          { id: "p7-fin-t1", label: "Drive 430 min to Root River, Lanesboro — the furthest point in MN", category: "fishing" },
          { id: "p7-fin-t2", label: "Film the entire drive — 7+ hours of reflection", category: "media" },
          { id: "p7-fin-t3", label: "Launch the kayak at the Root River access", category: "fishing" },
          { id: "p7-fin-t4", label: "Fish for smallmouth bass and trout", category: "fishing" },
          { id: "p7-fin-t5", label: "Film the final paddle stroke and pull the kayak out of the water", category: "media", detail: "This is the shot. Take your time. Let it be real." },
          { id: "p7-fin-t6", label: "Film the closing monologue — what this journey meant", category: "media" },
          { id: "p7-fin-t7", label: "Post the final Heroes on the Water donation total", category: "fundraising" },
          { id: "p7-fin-t8", label: "Thank every single person who supported the journey", category: "fundraising" },
          { id: "p7-fin-t9", label: "Drive home to Moorhead — 124 trips complete", category: "admin", detail: "You did it, Gabe." },
        ],
      },
    ],
  },
];

// Helper: get total task count across all phases
export function getTotalTaskCount(): number {
  return ROADMAP_PHASES.reduce(
    (sum, phase) =>
      sum + phase.days.reduce((s, day) => s + day.tasks.length, 0),
    0
  );
}

// Helper: get all task IDs
export function getAllTaskIds(): string[] {
  return ROADMAP_PHASES.flatMap(phase =>
    phase.days.flatMap(day => day.tasks.map(t => t.id))
  );
}

// Category colors
export const CATEGORY_COLORS: Record<RoadmapTask["category"], string> = {
  gear: "oklch(0.65 0.18 50)",
  media: "oklch(0.65 0.18 200)",
  fundraising: "oklch(0.55 0.18 145)",
  fishing: "oklch(0.65 0.15 240)",
  business: "oklch(0.65 0.18 300)",
  admin: "oklch(0.55 0.05 200)",
};

export const CATEGORY_LABELS: Record<RoadmapTask["category"], string> = {
  gear: "Gear",
  media: "Media",
  fundraising: "Fundraising",
  fishing: "Fishing",
  business: "Business",
  admin: "Admin",
};
