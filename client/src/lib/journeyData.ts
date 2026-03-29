// Working Man's Waters — Complete Journey Data
// 70 public kayak fishing access sites across Minnesota
// 124 trips over 4 open-water seasons (April 2026 – August 2029)
// Journey start date: Saturday, April 7, 2026

export interface JourneySite {
  id: number;
  name: string;
  location: string;
  county: string;
  region: string;
  lat: number;
  lng: number;
  driveMinutes: number;
  driveMiles: number;
  type: "local" | "journey";
  zone: 1 | 2 | 3 | 4 | 5;
  targetSpecies: string[];
  accessType: string;
}

export interface JourneyTrip {
  tripNumber: number;
  date: string;
  siteId: number;
  type: "local" | "journey";
  season: number;
  status: "completed" | "upcoming" | "planned";
}

export const JOURNEY_SITES: JourneySite[] = [
  // LOCAL SITES (Zone 1: 0-60 min)
  { id: 1, name: "Red River - Moorhead Access", location: "Moorhead, MN", county: "Clay", region: "Northwest", lat: 46.8738, lng: -96.7678, driveMinutes: 2, driveMiles: 1, type: "local", zone: 1, targetSpecies: ["Channel Catfish", "Walleye", "Carp"], accessType: "Carry-in" },
  { id: 2, name: "Buffalo River State Park", location: "Glyndon, MN", county: "Clay", region: "Northwest", lat: 46.8791, lng: -96.5543, driveMinutes: 15, driveMiles: 12, type: "local", zone: 1, targetSpecies: ["Smallmouth Bass", "Northern Pike", "Walleye"], accessType: "Carry-in" },
  { id: 3, name: "Lake Lida", location: "Pelican Rapids, MN", county: "Otter Tail", region: "Northwest", lat: 46.5724, lng: -95.9543, driveMinutes: 45, driveMiles: 42, type: "local", zone: 1, targetSpecies: ["Crappie", "Largemouth Bass", "Bluegill"], accessType: "Public Ramp" },
  { id: 4, name: "Detroit Lake", location: "Detroit Lakes, MN", county: "Becker", region: "Northwest", lat: 46.8177, lng: -95.8452, driveMinutes: 50, driveMiles: 48, type: "local", zone: 1, targetSpecies: ["Walleye", "Largemouth Bass", "Perch"], accessType: "Public Ramp" },
  { id: 5, name: "Otter Tail Lake", location: "Ottertail, MN", county: "Otter Tail", region: "Northwest", lat: 46.4188, lng: -95.6543, driveMinutes: 55, driveMiles: 52, type: "local", zone: 1, targetSpecies: ["Walleye", "Muskie", "Northern Pike"], accessType: "Public Ramp" },
  { id: 6, name: "Lake Christina", location: "Ashby, MN", county: "Grant", region: "Northwest", lat: 46.0832, lng: -95.8123, driveMinutes: 58, driveMiles: 55, type: "local", zone: 1, targetSpecies: ["Walleye", "Perch", "Crappie"], accessType: "Public Ramp" },
  { id: 7, name: "Red Lake River - Crookston", location: "Crookston, MN", county: "Polk", region: "Northwest", lat: 47.7744, lng: -96.6082, driveMinutes: 55, driveMiles: 52, type: "local", zone: 1, targetSpecies: ["Northern Pike", "Walleye", "Catfish"], accessType: "Carry-in" },
  { id: 8, name: "Pelican Lake - Pelican Rapids", location: "Pelican Rapids, MN", county: "Otter Tail", region: "Northwest", lat: 46.5724, lng: -96.0832, driveMinutes: 45, driveMiles: 43, type: "local", zone: 1, targetSpecies: ["Walleye", "Perch", "Northern Pike"], accessType: "Public Ramp" },

  // JOURNEY SITES (Zone 2: 1-2 hrs)
  { id: 9, name: "Thief River - Thief River Falls", location: "Thief River Falls, MN", county: "Pennington", region: "Northwest", lat: 48.1194, lng: -96.1793, driveMinutes: 75, driveMiles: 72, type: "journey", zone: 2, targetSpecies: ["Northern Pike", "Walleye", "Catfish"], accessType: "Carry-in" },
  { id: 10, name: "Upper Red Lake - Waskish", location: "Waskish, MN", county: "Beltrami", region: "Northwest", lat: 48.1543, lng: -94.5123, driveMinutes: 110, driveMiles: 108, type: "journey", zone: 2, targetSpecies: ["Walleye", "Northern Pike", "Perch"], accessType: "Public Ramp" },
  { id: 11, name: "Lake of the Woods - Baudette", location: "Baudette, MN", county: "Lake of the Woods", region: "Northwest", lat: 48.7143, lng: -94.6013, driveMinutes: 120, driveMiles: 118, type: "journey", zone: 2, targetSpecies: ["Walleye", "Sauger", "Muskie"], accessType: "Public Ramp" },
  { id: 12, name: "Leech Lake - Walker", location: "Walker, MN", county: "Cass", region: "Central", lat: 47.1543, lng: -94.5832, driveMinutes: 115, driveMiles: 112, type: "journey", zone: 2, targetSpecies: ["Walleye", "Muskie", "Northern Pike"], accessType: "Public Ramp" },
  { id: 13, name: "Mille Lacs Lake - Garrison", location: "Garrison, MN", county: "Mille Lacs", region: "Central", lat: 46.2943, lng: -93.8123, driveMinutes: 120, driveMiles: 118, type: "journey", zone: 2, targetSpecies: ["Walleye", "Smallmouth Bass", "Perch"], accessType: "Public Ramp" },
  { id: 14, name: "Gull Lake - Brainerd", location: "Brainerd, MN", county: "Crow Wing", region: "Central", lat: 46.4188, lng: -94.3543, driveMinutes: 105, driveMiles: 102, type: "journey", zone: 2, targetSpecies: ["Walleye", "Largemouth Bass", "Muskie"], accessType: "Public Ramp" },
  { id: 15, name: "Crow Wing River - Motley", location: "Motley, MN", county: "Morrison", region: "Central", lat: 46.3388, lng: -94.6432, driveMinutes: 100, driveMiles: 98, type: "journey", zone: 2, targetSpecies: ["Smallmouth Bass", "Northern Pike", "Walleye"], accessType: "Carry-in" },
  { id: 16, name: "Lake Winnibigoshish - Deer River", location: "Deer River, MN", county: "Itasca", region: "Northeast", lat: 47.4543, lng: -94.0832, driveMinutes: 118, driveMiles: 115, type: "journey", zone: 2, targetSpecies: ["Walleye", "Northern Pike", "Muskie"], accessType: "Public Ramp" },
  { id: 17, name: "Cass Lake", location: "Cass Lake, MN", county: "Cass", region: "Central", lat: 47.3788, lng: -94.5943, driveMinutes: 112, driveMiles: 110, type: "journey", zone: 2, targetSpecies: ["Walleye", "Northern Pike", "Bass"], accessType: "Public Ramp" },
  { id: 18, name: "Mississippi River - Brainerd", location: "Brainerd, MN", county: "Crow Wing", region: "Central", lat: 46.3588, lng: -94.2012, driveMinutes: 108, driveMiles: 105, type: "journey", zone: 2, targetSpecies: ["Walleye", "Smallmouth Bass", "Catfish"], accessType: "Carry-in" },

  // JOURNEY SITES (Zone 3: 2-3 hrs)
  { id: 19, name: "Lake Vermilion - Tower", location: "Tower, MN", county: "St. Louis", region: "Northeast", lat: 47.7943, lng: -92.2832, driveMinutes: 145, driveMiles: 142, type: "journey", zone: 3, targetSpecies: ["Walleye", "Smallmouth Bass", "Northern Pike"], accessType: "Public Ramp" },
  { id: 20, name: "Rainy Lake - International Falls", location: "International Falls, MN", county: "Koochiching", region: "Northeast", lat: 48.5943, lng: -93.4012, driveMinutes: 155, driveMiles: 152, type: "journey", zone: 3, targetSpecies: ["Walleye", "Northern Pike", "Smallmouth Bass"], accessType: "Public Ramp" },
  { id: 21, name: "Kabetogama Lake - Voyageurs NP", location: "Kabetogama, MN", county: "St. Louis", region: "Northeast", lat: 48.4543, lng: -93.0012, driveMinutes: 160, driveMiles: 158, type: "journey", zone: 3, targetSpecies: ["Walleye", "Northern Pike", "Muskie"], accessType: "Carry-in" },
  { id: 22, name: "Namakan Lake - Voyageurs NP", location: "Crane Lake, MN", county: "St. Louis", region: "Northeast", lat: 48.3788, lng: -92.4832, driveMinutes: 158, driveMiles: 155, type: "journey", zone: 3, targetSpecies: ["Walleye", "Smallmouth Bass", "Northern Pike"], accessType: "Carry-in" },
  { id: 23, name: "Boundary Waters - Entry Point 4", location: "Ely, MN", county: "Lake", region: "Northeast", lat: 47.9032, lng: -91.8543, driveMinutes: 165, driveMiles: 162, type: "journey", zone: 3, targetSpecies: ["Walleye", "Smallmouth Bass", "Northern Pike"], accessType: "Carry-in" },
  { id: 24, name: "Lake Superior - Duluth", location: "Duluth, MN", county: "St. Louis", region: "Northeast", lat: 46.7867, lng: -92.1005, driveMinutes: 150, driveMiles: 148, type: "journey", zone: 3, targetSpecies: ["Lake Trout", "Coho Salmon", "Steelhead"], accessType: "Public Ramp" },
  { id: 25, name: "St. Louis River - Duluth", location: "Duluth, MN", county: "St. Louis", region: "Northeast", lat: 46.7143, lng: -92.1832, driveMinutes: 152, driveMiles: 150, type: "journey", zone: 3, targetSpecies: ["Smallmouth Bass", "Walleye", "Muskie"], accessType: "Carry-in" },
  { id: 26, name: "Ely Area Chain - Fall Lake", location: "Ely, MN", county: "Lake", region: "Northeast", lat: 47.8788, lng: -91.8123, driveMinutes: 163, driveMiles: 160, type: "journey", zone: 3, targetSpecies: ["Walleye", "Northern Pike", "Bass"], accessType: "Public Ramp" },
  { id: 27, name: "Pelican Lake - Orr", location: "Orr, MN", county: "St. Louis", region: "Northeast", lat: 48.0543, lng: -92.8432, driveMinutes: 155, driveMiles: 153, type: "journey", zone: 3, targetSpecies: ["Walleye", "Northern Pike", "Crappie"], accessType: "Public Ramp" },
  { id: 28, name: "Big Fork River - Bigfork", location: "Bigfork, MN", county: "Itasca", region: "Northeast", lat: 47.7543, lng: -93.6543, driveMinutes: 135, driveMiles: 132, type: "journey", zone: 3, targetSpecies: ["Northern Pike", "Walleye", "Bass"], accessType: "Carry-in" },

  // JOURNEY SITES (Zone 4: 3-5 hrs)
  { id: 29, name: "Lake Minnetonka - Wayzata", location: "Wayzata, MN", county: "Hennepin", region: "Metro", lat: 44.9743, lng: -93.5012, driveMinutes: 185, driveMiles: 182, type: "journey", zone: 4, targetSpecies: ["Largemouth Bass", "Muskie", "Crappie"], accessType: "Public Ramp" },
  { id: 30, name: "St. Croix River - Stillwater", location: "Stillwater, MN", county: "Washington", region: "Metro", lat: 45.0543, lng: -92.8123, driveMinutes: 200, driveMiles: 198, type: "journey", zone: 4, targetSpecies: ["Smallmouth Bass", "Walleye", "Muskie"], accessType: "Carry-in" },
  { id: 31, name: "Mississippi River - Pool 2", location: "South St. Paul, MN", county: "Dakota", region: "Metro", lat: 44.8943, lng: -93.0432, driveMinutes: 195, driveMiles: 192, type: "journey", zone: 4, targetSpecies: ["Walleye", "Sauger", "Catfish"], accessType: "Public Ramp" },
  { id: 32, name: "Lake Pepin - Lake City", location: "Lake City, MN", county: "Wabasha", region: "Southeast", lat: 44.4488, lng: -92.2682, driveMinutes: 220, driveMiles: 218, type: "journey", zone: 4, targetSpecies: ["Walleye", "Sauger", "Bass"], accessType: "Public Ramp" },
  { id: 33, name: "Cannon River - Cannon Falls", location: "Cannon Falls, MN", county: "Goodhue", region: "Southeast", lat: 44.5088, lng: -92.9082, driveMinutes: 210, driveMiles: 208, type: "journey", zone: 4, targetSpecies: ["Smallmouth Bass", "Walleye", "Catfish"], accessType: "Carry-in" },
  { id: 34, name: "Big Stone Lake - Ortonville", location: "Ortonville, MN", county: "Big Stone", region: "Southwest", lat: 45.3043, lng: -96.4432, driveMinutes: 115, driveMiles: 112, type: "journey", zone: 2, targetSpecies: ["Walleye", "Northern Pike", "Perch"], accessType: "Public Ramp" },
  { id: 35, name: "Lake Shetek - Currie", location: "Currie, MN", county: "Murray", region: "Southwest", lat: 44.0743, lng: -95.6432, driveMinutes: 175, driveMiles: 172, type: "journey", zone: 4, targetSpecies: ["Walleye", "Northern Pike", "Bass"], accessType: "Public Ramp" },
  { id: 36, name: "Lac qui Parle Lake", location: "Watson, MN", county: "Lac qui Parle", region: "Southwest", lat: 44.9543, lng: -96.1012, driveMinutes: 130, driveMiles: 128, type: "journey", zone: 3, targetSpecies: ["Walleye", "Northern Pike", "Catfish"], accessType: "Public Ramp" },
  { id: 37, name: "Minnesota River - Montevideo", location: "Montevideo, MN", county: "Chippewa", region: "Southwest", lat: 44.9488, lng: -95.7232, driveMinutes: 140, driveMiles: 138, type: "journey", zone: 3, targetSpecies: ["Walleye", "Catfish", "Bass"], accessType: "Carry-in" },
  { id: 38, name: "Lake Oahe - Browns Valley", location: "Browns Valley, MN", county: "Traverse", region: "Southwest", lat: 45.5943, lng: -96.8432, driveMinutes: 95, driveMiles: 92, type: "journey", zone: 2, targetSpecies: ["Walleye", "Northern Pike", "Sauger"], accessType: "Public Ramp" },
  { id: 39, name: "Heron Lake", location: "Heron Lake, MN", county: "Jackson", region: "Southwest", lat: 43.7943, lng: -95.3232, driveMinutes: 195, driveMiles: 192, type: "journey", zone: 4, targetSpecies: ["Walleye", "Northern Pike", "Bass"], accessType: "Public Ramp" },
  { id: 40, name: "Lake Okabena - Worthington", location: "Worthington, MN", county: "Nobles", region: "Southwest", lat: 43.6243, lng: -95.5932, driveMinutes: 205, driveMiles: 202, type: "journey", zone: 4, targetSpecies: ["Walleye", "Bass", "Perch"], accessType: "Public Ramp" },
  { id: 41, name: "Spirit Lake - Iowa Border", location: "Okabena, MN", county: "Jackson", region: "Southwest", lat: 43.5543, lng: -95.1232, driveMinutes: 210, driveMiles: 208, type: "journey", zone: 4, targetSpecies: ["Walleye", "Bass", "Crappie"], accessType: "Public Ramp" },
  { id: 42, name: "Straight River - Faribault", location: "Faribault, MN", county: "Rice", region: "Southeast", lat: 44.2943, lng: -93.2832, driveMinutes: 215, driveMiles: 212, type: "journey", zone: 4, targetSpecies: ["Smallmouth Bass", "Walleye", "Trout"], accessType: "Carry-in" },
  { id: 43, name: "Sakatah Lake - Waterville", location: "Waterville, MN", county: "Le Sueur", region: "Southeast", lat: 44.2188, lng: -93.5632, driveMinutes: 210, driveMiles: 208, type: "journey", zone: 4, targetSpecies: ["Walleye", "Bass", "Crappie"], accessType: "Public Ramp" },
  { id: 44, name: "Lake Waconia", location: "Waconia, MN", county: "Carver", region: "Metro", lat: 44.8543, lng: -93.7832, driveMinutes: 190, driveMiles: 188, type: "journey", zone: 4, targetSpecies: ["Walleye", "Bass", "Crappie"], accessType: "Public Ramp" },
  { id: 45, name: "Rum River - Milaca", location: "Milaca, MN", county: "Mille Lacs", region: "Central", lat: 45.7543, lng: -93.6532, driveMinutes: 130, driveMiles: 128, type: "journey", zone: 3, targetSpecies: ["Smallmouth Bass", "Walleye", "Northern Pike"], accessType: "Carry-in" },
  { id: 46, name: "Long Prairie River", location: "Long Prairie, MN", county: "Todd", region: "Central", lat: 45.9743, lng: -94.8632, driveMinutes: 115, driveMiles: 112, type: "journey", zone: 2, targetSpecies: ["Smallmouth Bass", "Northern Pike", "Walleye"], accessType: "Carry-in" },
  { id: 47, name: "Clearwater River - Bagley", location: "Bagley, MN", county: "Clearwater", region: "Northwest", lat: 47.5243, lng: -95.3932, driveMinutes: 100, driveMiles: 98, type: "journey", zone: 2, targetSpecies: ["Northern Pike", "Walleye", "Bass"], accessType: "Carry-in" },
  { id: 48, name: "Crow River - Rockford", location: "Rockford, MN", county: "Wright", region: "Metro", lat: 45.0888, lng: -93.7332, driveMinutes: 175, driveMiles: 172, type: "journey", zone: 4, targetSpecies: ["Smallmouth Bass", "Walleye", "Catfish"], accessType: "Carry-in" },
  { id: 49, name: "Chippewa River - Milan", location: "Milan, MN", county: "Chippewa", region: "Southwest", lat: 45.1143, lng: -95.9132, driveMinutes: 125, driveMiles: 122, type: "journey", zone: 3, targetSpecies: ["Walleye", "Northern Pike", "Bass"], accessType: "Carry-in" },
  { id: 50, name: "Lake Minnewaska - Glenwood", location: "Glenwood, MN", county: "Pope", region: "Central", lat: 45.6488, lng: -95.3932, driveMinutes: 90, driveMiles: 88, type: "journey", zone: 2, targetSpecies: ["Walleye", "Bass", "Crappie"], accessType: "Public Ramp" },

  // JOURNEY SITES (Zone 5: 5+ hrs)
  { id: 51, name: "Boundary Waters - Moose Lake Chain", location: "Ely, MN", county: "Lake", region: "Northeast", lat: 47.9532, lng: -91.7432, driveMinutes: 168, driveMiles: 165, type: "journey", zone: 3, targetSpecies: ["Walleye", "Smallmouth Bass", "Lake Trout"], accessType: "Carry-in" },
  { id: 52, name: "Trout Lake - Grand Rapids", location: "Grand Rapids, MN", county: "Itasca", region: "Northeast", lat: 47.2343, lng: -93.5132, driveMinutes: 130, driveMiles: 128, type: "journey", zone: 3, targetSpecies: ["Walleye", "Muskie", "Northern Pike"], accessType: "Public Ramp" },
  { id: 53, name: "Sandy Lake - McGregor", location: "McGregor, MN", county: "Aitkin", region: "Central", lat: 46.6143, lng: -93.3432, driveMinutes: 125, driveMiles: 122, type: "journey", zone: 3, targetSpecies: ["Walleye", "Northern Pike", "Bass"], accessType: "Public Ramp" },
  { id: 54, name: "Lake Superior - Two Harbors", location: "Two Harbors, MN", county: "Lake", region: "Northeast", lat: 47.0243, lng: -91.6732, driveMinutes: 165, driveMiles: 162, type: "journey", zone: 3, targetSpecies: ["Lake Trout", "Coho Salmon", "Steelhead"], accessType: "Public Ramp" },
  { id: 55, name: "Gunflint Lake - Grand Marais", location: "Grand Marais, MN", county: "Cook", region: "Northeast", lat: 48.0743, lng: -90.6432, driveMinutes: 195, driveMiles: 192, type: "journey", zone: 4, targetSpecies: ["Lake Trout", "Walleye", "Northern Pike"], accessType: "Public Ramp" },
  { id: 56, name: "Lake Superior - Grand Marais", location: "Grand Marais, MN", county: "Cook", region: "Northeast", lat: 47.7488, lng: -90.3332, driveMinutes: 200, driveMiles: 198, type: "journey", zone: 4, targetSpecies: ["Lake Trout", "Coho Salmon", "Steelhead"], accessType: "Carry-in" },
  { id: 57, name: "Pigeon River - Grand Portage", location: "Grand Portage, MN", county: "Cook", region: "Northeast", lat: 47.9643, lng: -89.6832, driveMinutes: 215, driveMiles: 212, type: "journey", zone: 4, targetSpecies: ["Smallmouth Bass", "Northern Pike", "Walleye"], accessType: "Carry-in" },
  { id: 58, name: "Zumbro River - Rochester", location: "Rochester, MN", county: "Olmsted", region: "Southeast", lat: 44.0232, lng: -92.4632, driveMinutes: 245, driveMiles: 242, type: "journey", zone: 5, targetSpecies: ["Smallmouth Bass", "Walleye", "Catfish"], accessType: "Carry-in" },
  { id: 59, name: "Lake Pepin - Reads Landing", location: "Reads Landing, MN", county: "Wabasha", region: "Southeast", lat: 44.3888, lng: -92.1232, driveMinutes: 235, driveMiles: 232, type: "journey", zone: 5, targetSpecies: ["Walleye", "Sauger", "Bass"], accessType: "Public Ramp" },
  { id: 60, name: "Whitewater River - Elba", location: "Elba, MN", county: "Winona", region: "Southeast", lat: 43.9943, lng: -91.8532, driveMinutes: 265, driveMiles: 262, type: "journey", zone: 5, targetSpecies: ["Brown Trout", "Brook Trout", "Smallmouth Bass"], accessType: "Carry-in" },
  { id: 61, name: "Mississippi River - Winona", location: "Winona, MN", county: "Winona", region: "Southeast", lat: 44.0499, lng: -91.6393, driveMinutes: 270, driveMiles: 268, type: "journey", zone: 5, targetSpecies: ["Walleye", "Sauger", "Catfish"], accessType: "Public Ramp" },
  { id: 62, name: "Trout Run Creek - Chatfield", location: "Chatfield, MN", county: "Fillmore", region: "Southeast", lat: 43.8443, lng: -92.1832, driveMinutes: 275, driveMiles: 272, type: "journey", zone: 5, targetSpecies: ["Brown Trout", "Brook Trout"], accessType: "Carry-in" },
  { id: 63, name: "South Fork Root River - Preston", location: "Preston, MN", county: "Fillmore", region: "Southeast", lat: 43.6688, lng: -92.0832, driveMinutes: 385, driveMiles: 382, type: "journey", zone: 5, targetSpecies: ["Smallmouth Bass", "Walleye", "Trout"], accessType: "Carry-in" },
  { id: 64, name: "Cedar River - Austin", location: "Austin, MN", county: "Mower", region: "Southeast", lat: 43.6643, lng: -92.9732, driveMinutes: 255, driveMiles: 252, type: "journey", zone: 5, targetSpecies: ["Smallmouth Bass", "Walleye", "Catfish"], accessType: "Carry-in" },
  { id: 65, name: "Shell Rock River - Albert Lea", location: "Albert Lea, MN", county: "Freeborn", region: "Southeast", lat: 43.6488, lng: -93.3632, driveMinutes: 245, driveMiles: 242, type: "journey", zone: 5, targetSpecies: ["Walleye", "Bass", "Catfish"], accessType: "Carry-in" },
  { id: 66, name: "Blue Earth River - Mankato", location: "Mankato, MN", county: "Blue Earth", region: "Southeast", lat: 44.1643, lng: -93.9932, driveMinutes: 225, driveMiles: 222, type: "journey", zone: 4, targetSpecies: ["Walleye", "Catfish", "Bass"], accessType: "Carry-in" },
  { id: 67, name: "Lake Pepin - Wabasha", location: "Wabasha, MN", county: "Wabasha", region: "Southeast", lat: 44.3843, lng: -92.0332, driveMinutes: 240, driveMiles: 238, type: "journey", zone: 5, targetSpecies: ["Walleye", "Sauger", "Bass"], accessType: "Public Ramp" },
  { id: 68, name: "Straight River - Owatonna", location: "Owatonna, MN", county: "Steele", region: "Southeast", lat: 44.0843, lng: -93.2232, driveMinutes: 230, driveMiles: 228, type: "journey", zone: 4, targetSpecies: ["Smallmouth Bass", "Walleye", "Trout"], accessType: "Carry-in" },
  { id: 69, name: "Vermillion River - Hastings", location: "Hastings, MN", county: "Dakota", region: "Metro", lat: 44.7243, lng: -92.8532, driveMinutes: 205, driveMiles: 202, type: "journey", zone: 4, targetSpecies: ["Smallmouth Bass", "Walleye", "Catfish"], accessType: "Carry-in" },
  { id: 70, name: "Root River - Lanesboro", location: "Lanesboro, MN", county: "Fillmore", region: "Southeast", lat: 43.7188, lng: -91.9832, driveMinutes: 430, driveMiles: 428, type: "journey", zone: 5, targetSpecies: ["Smallmouth Bass", "Walleye", "Brown Trout"], accessType: "Carry-in" },
];

// Generate the full 124-trip seasonal schedule
function generateSchedule(): JourneyTrip[] {
  const trips: JourneyTrip[] = [];
  const localSites = JOURNEY_SITES.filter(s => s.type === "local");
  const journeySites = JOURNEY_SITES.filter(s => s.type === "journey");

  const openMonths = [4, 5, 6, 7, 8, 9, 10, 11]; // April-November

  let currentDate = new Date(2026, 3, 7); // April 7, 2026 (Saturday) — official journey start date
  let localIndex = 0;
  let journeyIndex = 0;
  let tripNumber = 0;
  let weekCounter = 0;

  while (tripNumber < 124) {
    const month = currentDate.getMonth() + 1;
    if (openMonths.includes(month)) {
      tripNumber++;
      weekCounter++;
      const isJourneyWeek = weekCounter % 2 === 0;
      let site: JourneySite;
      let type: "local" | "journey";

      if (isJourneyWeek && journeyIndex < journeySites.length) {
        site = journeySites[journeyIndex++];
        type = "journey";
      } else {
        site = localSites[localIndex % localSites.length];
        localIndex++;
        type = "local";
      }

      const season = currentDate.getFullYear() - 2025;
      const now = new Date();
      const status: "completed" | "upcoming" | "planned" =
        currentDate < now ? "completed" :
        currentDate.getTime() - now.getTime() < 14 * 24 * 60 * 60 * 1000 ? "upcoming" : "planned";

      trips.push({
        tripNumber,
        date: currentDate.toISOString().split("T")[0],
        siteId: site.id,
        type,
        season,
        status,
      });
    }
    // Advance one week
    currentDate = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000);
  }
  return trips;
}

export const JOURNEY_TRIPS = generateSchedule();

export const CAUSES = [
  {
    id: 1,
    name: "Heroes on the Water",
    description: "Uses kayak fishing to help veterans and first responders heal from PTSD.",
    website: "https://heroesonthewater.org",
    pledgePct: 15,
    category: "Veterans",
  },
  {
    id: 2,
    name: "MN-FISH Sportfishing Foundation",
    description: "Protects public fishing access and habitat across Minnesota.",
    website: "https://mn-fish.com/foundation",
    pledgePct: 0,
    category: "Conservation",
  },
  {
    id: 3,
    name: "Minnesota Lakes & Rivers Advocates",
    description: "Fights to keep Minnesota's public waters clean and accessible.",
    website: "https://mnlakesandrivers.org",
    pledgePct: 0,
    category: "Conservation",
  },
];

export const SPONSORS = [
  { id: 1, name: "Moorhead Tourism Board", status: "negotiating", type: "Video", value: 750, contact: "Dave Johnson", email: "dave@moorheadtourism.com", dateRange: "Apr 1 – Jun 30, 2026", deliverables: "2 YouTube videos showcasing Red River fishing in Moorhead area" },
  { id: 2, name: "St. Croix Rods", status: "active", type: "Ambassador", value: 200, contact: "Lisa Chen", email: "lisa@stcroixrods.com", dateRange: "Jan 1 – Dec 31, 2026", deliverables: "Monthly content featuring St. Croix rods, logo on boat" },
  { id: 3, name: "Rapala", status: "active", type: "Product Review", value: 500, contact: "John Smith", email: "john@rapala.com", dateRange: "Mar 1 – Apr 30, 2026", deliverables: "3 Instagram posts, 1 YouTube video reviewing new Shad Rap colors" },
];

export const SOCIAL_POSTS = [
  { id: 1, content: "Gear review: My top 5 walleye lures for early spring.", tags: ["#gearreview", "#walleyelures", "#fishingtackle"], status: "draft", platforms: ["tiktok"], date: null },
  { id: 2, content: "Spring crappie run is ON at Lake Lida! Caught our limit in just 2 hours.", tags: ["#crappie", "#lakelida", "#springrun", "#panfishing", "#minnesota"], status: "scheduled", platforms: ["instagram", "youtube", "facebook"], date: "2026-03-30T16:00:00" },
  { id: 3, content: "Dawn patrol on the Red River — nothing beats first light on the water. #redriver #catfishing #dawnpatrol #moorheadmn", tags: ["#redriver", "#catfishing", "#dawnpatrol", "#moorheadmn"], status: "published", platforms: ["tiktok"], date: "2026-03-22" },
  { id: 4, content: "Monster walleye on Detroit Lake! 28\" beauty that put up an incredible fight on light tackle. 🎣", tags: ["#walleye", "#detroitlake", "#minnesotafishing", "#springfishing", "#catchandrelease"], status: "published", platforms: ["instagram"], date: "2026-03-15" },
];

export const ANALYTICS = {
  totalFollowers: 12847,
  engagement: 34521,
  totalViews: 287400,
  postsPublished: 156,
  followerGrowth: 8.3,
  engagementGrowth: 4.7,
  viewsGrowth: 12.1,
  postsGrowth: 7.0,
  platforms: [
    { name: "Instagram", followers: 5240, color: "#E1306C" },
    { name: "YouTube", followers: 3180, color: "#FF0000" },
    { name: "TikTok", followers: 2890, color: "#69C9D0" },
    { name: "Facebook", followers: 1120, color: "#1877F2" },
    { name: "X/Twitter", followers: 417, color: "#1DA1F2" },
  ],
  weeklyEngagement: [
    { day: "Mon", instagram: 180, youtube: 120, tiktok: 95 },
    { day: "Tue", instagram: 220, youtube: 145, tiktok: 110 },
    { day: "Wed", instagram: 310, youtube: 200, tiktok: 180 },
    { day: "Thu", instagram: 280, youtube: 175, tiktok: 160 },
    { day: "Fri", instagram: 520, youtube: 310, tiktok: 290 },
    { day: "Sat", instagram: 610, youtube: 420, tiktok: 380 },
    { day: "Sun", instagram: 450, youtube: 280, tiktok: 240 },
  ],
};

export const FUNDRAISING = {
  goFundMeGoal: 8500,
  goFundMeRaised: 1240,
  patreonMonthly: 87,
  patreonGoal: 500,
  patreonPatrons: 12,
  patreonPatronGoal: 50,
  heroesOnWaterDonated: 186,
};
