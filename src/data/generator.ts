/**
 * Acuity Brands Lighting - Deterministic Synthetic Dataset Generator
 * Uses a deterministic PRNG (Linear Congruential Generator) with fixed seed
 * to produce 100% reproducible, internally reconciled enterprise BI data.
 */

import {
  Account,
  Contact,
  Opportunity,
  Quote,
  OrderLine,
  Invoice,
  Payment,
  ServiceCase,
  EngagementEvent,
  MonthlyFinancialSnapshot,
  SyntheticDataset,
  CustomerHealth,
  Recommendation,
  ProductFamily,
  ProductCategory,
  CustomerSegment,
  Channel,
  SalesRegion,
  RelationshipTier,
  OpportunityStage,
  ServiceSeverity,
  ServiceCategory,
  Agent,
  Facility
} from './types';

// Deterministic PRNG
class LCG {
  private m = 0x80000000;
  private a = 1103515245;
  private c = 12345;
  private state: number;

  constructor(seed: number = 42103) {
    this.state = seed;
  }

  next(): number {
    this.state = (this.a * this.state + this.c) % this.m;
    return this.state / (this.m - 1);
  }

  nextInt(min: number, max: number): number {
    return Math.floor(min + this.next() * (max - min + 1));
  }

  pick<T>(items: readonly T[]): T {
    return items[Math.floor(this.next() * items.length)];
  }

  pickWeighted<T>(items: readonly { item: T; weight: number }[]): T {
    const total = items.reduce((acc, curr) => acc + curr.weight, 0);
    let r = this.next() * total;
    for (const entry of items) {
      if (r < entry.weight) return entry.item;
      r -= entry.weight;
    }
    return items[items.length - 1].item;
  }
}

export function generateSyntheticDataset(): SyntheticDataset {
  const rng = new LCG(99401);

  const productFamilies: ProductFamily[] = [
    'Lithonia Lighting®',
    'Holophane®',
    'Gotham®',
    'Mark Architectural Lighting™',
    'Juno®',
    'Peerless®',
    'nLight® Controls',
    'Atrius® IoT & Buildings',
    'SensorSwitch™',
    'Aculux®',
  ];

  const productFamilyToCategory: Record<ProductFamily, ProductCategory> = {
    'Lithonia Lighting®': 'Indoor Ambient & Troffers',
    'Holophane®': 'Outdoor & Infrastructure',
    'Gotham®': 'Architectural Downlighting',
    'Mark Architectural Lighting™': 'Indoor Ambient & Troffers',
    'Juno®': 'Architectural Downlighting',
    'Peerless®': 'Indoor Ambient & Troffers',
    'nLight® Controls': 'Distributed Lighting Controls',
    'Atrius® IoT & Buildings': 'Building IoT & Software',
    'SensorSwitch™': 'Distributed Lighting Controls',
    'Aculux®': 'Architectural Downlighting',
  };

  const salesOwners = [
    'Marcus Vance (VP Strategic Accounts)',
    'Elena Rostova (Commercial Director - East)',
    'David Chen (Regional Mgr - South)',
    'Sarah Jenkins (Distributor Channel Lead)',
    'Michael Thorne (Controls & IoT Specialist)',
    'Rachel Alpert (Key Account Exec - Midwest)',
    'Carlos Mendez (Industrial & Spec Lead - West)',
    'Bradford Cole (Director - Canada Sales)',
  ];

  const parentCorporations = [
    { name: 'Sonepar USA Holdings', segment: 'Electrical Distributor' as CustomerSegment, channel: 'C&I Electrical Distribution' as Channel },
    { name: 'Graybar Electric Company', segment: 'Electrical Distributor' as CustomerSegment, channel: 'C&I Electrical Distribution' as Channel },
    { name: 'WESCO Distribution / Anixter', segment: 'Electrical Distributor' as CustomerSegment, channel: 'C&I Electrical Distribution' as Channel },
    { name: 'Rexel North America', segment: 'Electrical Distributor' as CustomerSegment, channel: 'C&I Electrical Distribution' as Channel },
    { name: 'Consolidated Electrical Distributors (CED)', segment: 'Electrical Distributor' as CustomerSegment, channel: 'C&I Electrical Distribution' as Channel },
    { name: 'Rosendin Electric Inc.', segment: 'Electrical Contractor' as CustomerSegment, channel: 'Contractor Direct' as Channel },
    { name: 'Cupertino Electric & Tech', segment: 'Electrical Contractor' as CustomerSegment, channel: 'Contractor Direct' as Channel },
    { name: 'Helix Electric Enterprise', segment: 'Electrical Contractor' as CustomerSegment, channel: 'Contractor Direct' as Channel },
    { name: 'HLB Lighting Design Studio', segment: 'Specifier & Lighting Designer' as CustomerSegment, channel: 'Specifier Influenced' as Channel },
    { name: 'Arup Lighting & Engineering', segment: 'Specifier & Lighting Designer' as CustomerSegment, channel: 'Specifier Influenced' as Channel },
    { name: 'Prologis Global Logistics', segment: 'Direct Enterprise Account' as CustomerSegment, channel: 'Government & Institutional' as Channel },
    { name: 'Ameresco Energy Infrastructure', segment: 'ESCO & Energy Solutions' as CustomerSegment, channel: 'Government & Institutional' as Channel },
  ];

  const citiesByRegion: Record<SalesRegion, { city: string; state: string; zip: string }[]> = {
    East: [
      { city: 'Atlanta', state: 'GA', zip: '30303' },
      { city: 'Boston', state: 'MA', zip: '02108' },
      { city: 'Charlotte', state: 'NC', zip: '28202' },
      { city: 'New York', state: 'NY', zip: '10001' },
      { city: 'Philadelphia', state: 'PA', zip: '19104' },
    ],
    South: [
      { city: 'Dallas', state: 'TX', zip: '75201' },
      { city: 'Houston', state: 'TX', zip: '77002' },
      { city: 'Orlando', state: 'FL', zip: '32801' },
      { city: 'Nashville', state: 'TN', zip: '37203' },
      { city: 'Austin', state: 'TX', zip: '78701' },
    ],
    Midwest: [
      { city: 'Chicago', state: 'IL', zip: '60601' },
      { city: 'Columbus', state: 'OH', zip: '43215' },
      { city: 'Minneapolis', state: 'MN', zip: '55401' },
      { city: 'Indianapolis', state: 'IN', zip: '46204' },
      { city: 'Detroit', state: 'MI', zip: '48226' },
    ],
    West: [
      { city: 'Los Angeles', state: 'CA', zip: '90012' },
      { city: 'San Francisco', state: 'CA', zip: '94105' },
      { city: 'Seattle', state: 'WA', zip: '98101' },
      { city: 'Phoenix', state: 'AZ', zip: '85001' },
      { city: 'Denver', state: 'CO', zip: '80202' },
    ],
    Canada: [
      { city: 'Toronto', state: 'ON', zip: 'M5H 2N2' },
      { city: 'Montreal', state: 'QC', zip: 'H3B 2Y5' },
      { city: 'Calgary', state: 'AB', zip: 'T2P 1J9' },
      { city: 'Vancouver', state: 'BC', zip: 'V6C 2T8' },
    ],
  };

  const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
    // East
    'Atlanta, GA': { lat: 33.7490, lng: -84.3880 },
    'Boston, MA': { lat: 42.3601, lng: -71.0589 },
    'Charlotte, NC': { lat: 35.2271, lng: -80.8431 },
    'New York, NY': { lat: 40.7128, lng: -74.0060 },
    'Philadelphia, PA': { lat: 39.9526, lng: -75.1652 },
    // South
    'Dallas, TX': { lat: 32.7767, lng: -96.7970 },
    'Houston, TX': { lat: 29.7604, lng: -95.3698 },
    'Orlando, FL': { lat: 28.5383, lng: -81.3792 },
    'Nashville, TN': { lat: 36.1627, lng: -86.7816 },
    'Austin, TX': { lat: 30.2672, lng: -97.7431 },
    // Midwest
    'Chicago, IL': { lat: 41.8781, lng: -87.6298 },
    'Columbus, OH': { lat: 39.9612, lng: -82.9988 },
    'Minneapolis, MN': { lat: 44.9778, lng: -93.2650 },
    'Indianapolis, IN': { lat: 39.7684, lng: -86.1581 },
    'Detroit, MI': { lat: 42.3314, lng: -83.0458 },
    // West
    'Los Angeles, CA': { lat: 34.0522, lng: -118.2437 },
    'San Francisco, CA': { lat: 37.7749, lng: -122.4194 },
    'Seattle, WA': { lat: 47.6062, lng: -122.3321 },
    'Phoenix, AZ': { lat: 33.4484, lng: -112.0740 },
    'Denver, CO': { lat: 39.7392, lng: -104.9903 },
    // Canada
    'Toronto, ON': { lat: 43.6532, lng: -79.3832 },
    'Montreal, QC': { lat: 45.5017, lng: -73.5673 },
    'Calgary, AB': { lat: 51.0447, lng: -114.0719 },
    'Vancouver, BC': { lat: 49.2827, lng: -123.1207 },
    // Additional Facility Hubs
    'Conyers, GA': { lat: 33.6676, lng: -84.0177 },
    'Crawfordsville, IN': { lat: 40.0417, lng: -86.8997 },
    'Des Plaines, IL': { lat: 42.0334, lng: -87.8834 },
    'Winona, MN': { lat: 44.0499, lng: -91.6393 },
    'Monterrey, NL': { lat: 25.6866, lng: -100.3161 },
  };

  const agents: Agent[] = [
    {
      id: 'AGT-101',
      name: 'Marcus Vance (VP Strategic Accounts)',
      role: 'Vice President, Strategic Accounts',
      agencyName: 'Acuity Corporate Accounts Division',
      region: 'East',
      territory: 'East Metro Core',
      email: 'm.vance@acuitybrands.com',
      phone: '+1 (404) 555-0142',
      status: 'Active',
    },
    {
      id: 'AGT-102',
      name: 'Elena Rostova (Commercial Director - East)',
      role: 'Commercial Sales Director',
      agencyName: 'Metro East Lighting Agency',
      region: 'East',
      territory: 'East - Atlanta District',
      email: 'e.rostova@acuitybrands.com',
      phone: '+1 (404) 555-0178',
      status: 'Active',
    },
    {
      id: 'AGT-103',
      name: 'David Chen (Regional Mgr - South)',
      role: 'Regional Commercial Manager',
      agencyName: 'Lone Star & Gulf Lighting Agency',
      region: 'South',
      territory: 'South - Dallas District',
      email: 'd.chen@acuitybrands.com',
      phone: '+1 (214) 555-0193',
      status: 'Active',
    },
    {
      id: 'AGT-104',
      name: 'Sarah Jenkins (Distributor Channel Lead)',
      role: 'Distributor Channel Lead',
      agencyName: 'Mid-Atlantic Agency Partners',
      region: 'East',
      territory: 'East - Charlotte District',
      email: 's.jenkins@acuitybrands.com',
      phone: '+1 (704) 555-0125',
      status: 'Active',
    },
    {
      id: 'AGT-105',
      name: 'Michael Thorne (Controls & IoT Specialist)',
      role: 'Controls & Systems Agency Director',
      agencyName: 'Thorne Digital Building Agency',
      region: 'South',
      territory: 'South - Orlando District',
      email: 'm.thorne@acuitybrands.com',
      phone: '+1 (407) 555-0161',
      status: 'Active',
    },
    {
      id: 'AGT-106',
      name: 'Rachel Alpert (Key Account Exec - Midwest)',
      role: 'Key Account Executive',
      agencyName: 'Great Lakes Lighting Agency Network',
      region: 'Midwest',
      territory: 'Midwest - Chicago District',
      email: 'r.alpert@acuitybrands.com',
      phone: '+1 (312) 555-0184',
      status: 'Active',
    },
    {
      id: 'AGT-107',
      name: 'Carlos Mendez (Industrial & Spec Lead - West)',
      role: 'Industrial & Spec Agency Principal',
      agencyName: 'Pacific Lighting & Controls Associates',
      region: 'West',
      territory: 'West - Los Angeles District',
      email: 'c.mendez@acuitybrands.com',
      phone: '+1 (213) 555-0137',
      status: 'Active',
    },
    {
      id: 'AGT-108',
      name: 'Bradford Cole (Director - Canada Sales)',
      role: 'Managing Director, Canadian Agency Sales',
      agencyName: 'Maple Leaf Commercial Lighting Agency',
      region: 'Canada',
      territory: 'Canada - Toronto District',
      email: 'b.cole@acuitybrands.ca',
      phone: '+1 (416) 555-0198',
      status: 'Active',
    },
  ];

  const facilities: Facility[] = [
    {
      id: 'FAC-01',
      name: 'Conyers Global Operations & Assembly Center',
      facilityType: 'Global Manufacturing HQ',
      location: 'One Lithonia Way, Conyers, GA',
      city: 'Conyers',
      state: 'GA',
      country: 'USA',
      latitude: 33.6676,
      longitude: -84.0177,
      productFamilies: ['Lithonia Lighting®', 'nLight® Controls', 'SensorSwitch™'],
      annualCapacityUnits: 4200000,
      operatingStatus: 'Operational',
      certifications: ['ISO 9001:2015', 'ISO 14001', 'UL Certified Test Lab', 'LEED Silver'],
    },
    {
      id: 'FAC-02',
      name: 'Monterrey High-Bay & Industrial Facility',
      facilityType: 'High-Bay Assembly Plant',
      location: 'Parque Industrial Monterrey, Apodaca, NL',
      city: 'Monterrey',
      state: 'NL',
      country: 'Mexico',
      latitude: 25.6866,
      longitude: -100.3161,
      productFamilies: ['Lithonia Lighting®'],
      annualCapacityUnits: 2800000,
      operatingStatus: 'Operational',
      certifications: ['ISO 9001:2015', 'CTPAT Certified', 'RoHS Compliance'],
    },
    {
      id: 'FAC-03',
      name: 'Crawfordsville Optical Glass & Infrastructure Foundry',
      facilityType: 'Infrastructure Optical Foundry',
      location: '214 Oak St, Crawfordsville, IN',
      city: 'Crawfordsville',
      state: 'IN',
      country: 'USA',
      latitude: 40.0417,
      longitude: -86.8997,
      productFamilies: ['Holophane®'],
      annualCapacityUnits: 650000,
      operatingStatus: 'Operational',
      certifications: ['ISO 9001:2015', 'ANSI C136 Roadway Standard', 'Prismatic Glass Patent Authority'],
    },
    {
      id: 'FAC-04',
      name: 'Des Plaines Architectural Lighting Center',
      facilityType: 'Architectural Downlighting Center',
      location: '1300 S Wolf Rd, Des Plaines, IL',
      city: 'Des Plaines',
      state: 'IL',
      country: 'USA',
      latitude: 42.0334,
      longitude: -87.8834,
      productFamilies: ['Gotham®', 'Juno®', 'Aculux®'],
      annualCapacityUnits: 950000,
      operatingStatus: 'Operational',
      certifications: ['ISO 9001:2015', 'Title 24 JA8 Certified', 'AIA Specification Standard'],
    },
    {
      id: 'FAC-05',
      name: 'Winona Architectural Linear & Custom Plant',
      facilityType: 'Linear & Custom Facility',
      location: '1410 E 8th St, Winona, MN',
      city: 'Winona',
      state: 'MN',
      country: 'USA',
      latitude: 44.0499,
      longitude: -91.6393,
      productFamilies: ['Mark Architectural Lighting™', 'Peerless®'],
      annualCapacityUnits: 480000,
      operatingStatus: 'Operational',
      certifications: ['ISO 9001:2015', 'Acoustic Integration Certified', 'Well Building Standard'],
    },
    {
      id: 'FAC-06',
      name: 'Atlanta Digital Buildings & IoT Software Hub',
      facilityType: 'IoT Technology Hub',
      location: '1170 Peachtree St NE, Atlanta, GA',
      city: 'Atlanta',
      state: 'GA',
      country: 'USA',
      latitude: 33.7865,
      longitude: -84.3831,
      productFamilies: ['Atrius® IoT & Buildings', 'nLight® Controls'],
      annualCapacityUnits: 1200000,
      operatingStatus: 'Operational',
      certifications: ['SOC 2 Type II', 'ISO 27001', 'ASHRAE 90.1 Compliance', 'BACnet Testing Labs'],
    },
  ];

  const productFamilyToFacilityId: Record<ProductFamily, string> = {
    'Lithonia Lighting®': 'FAC-01',
    'Holophane®': 'FAC-03',
    'Gotham®': 'FAC-04',
    'Mark Architectural Lighting™': 'FAC-05',
    'Juno®': 'FAC-04',
    'Peerless®': 'FAC-05',
    'nLight® Controls': 'FAC-01',
    'Atrius® IoT & Buildings': 'FAC-06',
    'SensorSwitch™': 'FAC-01',
    'Aculux®': 'FAC-04',
  };

  const agentNameToId: Record<string, string> = {};
  agents.forEach(a => {
    agentNameToId[a.name] = a.id;
  });

  const accounts: Account[] = [];
  const parentMap: Record<string, Account> = {};

  // 1. Generate Parent Accounts (12 large enterprise groups)
  parentCorporations.forEach((p, index) => {
    const pId = `ABL-CORP-${100 + index}`;
    const region = (['East', 'South', 'Midwest', 'West'][index % 4]) as SalesRegion;
    const location = citiesByRegion[region][0];
    const cityKey = `${location.city}, ${location.state}`;
    const coords = CITY_COORDINATES[cityKey] || { lat: 33.6676, lng: -84.0177 };
    const parentAccount: Account = {
      id: pId,
      name: p.name,
      segment: p.segment,
      channel: p.channel,
      region,
      territory: `${region} Metro Core`,
      accountOwner: salesOwners[index % salesOwners.length],
      tier: 'Strategic Platinum',
      address: `100 Corporate Plaza, Suite ${500 + index * 10}`,
      city: location.city,
      state: location.state,
      zip: location.zip,
      latitude: coords.lat,
      longitude: coords.lng,
      activeSince: 2005 + (index % 12),
      creditLimit: 5000000 + (index * 750000),
      creditHold: false,
      paymentTerms: '2% 10 Net 30',
      annualTargetSales: 12000000 + (index * 1500000),
      installedControlsFlag: index % 2 === 0,
      childLocationsCount: 0,
      website: `https://www.${p.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
    };
    parentMap[pId] = parentAccount;
    accounts.push(parentAccount);
  });

  // 2. Generate Operating Operating Accounts & Branch Locations (total ~170 accounts)
  const childBranches = [
    'Northeast Distribution Hub', 'Mid-Atlantic Branch', 'Southeast Commercial Ops',
    'Gulf Coast Regional Center', 'Texas Metro Distribution', 'Great Lakes Branch',
    'Midwest Logistics Facility', 'Pacific Northwest Center', 'Northern California Ops',
    'Southern California Hub', 'Rocky Mountain Branch', 'Ontario Regional Center',
    'Quebec Industrial Hub', 'Central Alberta Supply', 'Southwest Project Division'
  ];

  const independentNames = [
    'Apex Lighting Solutions', 'Vanguard Electric Supply', 'Beacon Lighting Distributors',
    'Tri-State Power & Light', 'Metropolitan Electrical Contractors', 'Pinnacle Architectural Specifiers',
    'Summit Energy Management', 'Horizon Commercial Lighting', 'Alliance Fixture Works',
    'Titan High-Bay Engineering', 'Modernist Specifiers Group', 'Sterling Power Distribution',
    'Frontier Industrial Supply', 'Paramount Lighting Design', 'Zenith Building Technologies',
    'Eagle Mountain Electric', 'Crossroads Logistics Infrastructure', 'Heritage Lighting Works',
    'Olympus Controls Integration', 'Kestrel Engineering Partners'
  ];

  const regionsList: SalesRegion[] = ['East', 'South', 'Midwest', 'West', 'Canada'];

  let custIdCounter = 1001;

  // Add child branches to parents
  Object.keys(parentMap).forEach((parentId, pIdx) => {
    const parent = parentMap[parentId];
    const numChildren = pIdx < 5 ? 8 : 4; // Top distributors have more branches
    parent.childLocationsCount = numChildren;

    for (let c = 0; c < numChildren; c++) {
      const cId = `ABL-CUST-${custIdCounter++}`;
      const branchName = childBranches[c % childBranches.length];
      const region = regionsList[(pIdx + c) % regionsList.length];
      const locList = citiesByRegion[region];
      const loc = locList[c % locList.length];
      const tier: RelationshipTier = c === 0 ? 'Premier Gold' : (c < 4 ? 'Core Silver' : 'Emerging Bronze');

      // Specific crafted accounts for the POC narrative
      const isDecliningSpecial = cId === 'ABL-CUST-1008'; // Crescent/Apex declining account
      const isControlsCrossSellSpecial = cId === 'ABL-CUST-1014'; // Rosendin nLight candidate
      const isCreditOverdueSpecial = cId === 'ABL-CUST-1025'; // Credit limit issue

      const baseTarget = tier === 'Premier Gold' ? 2400000 : (tier === 'Core Silver' ? 1200000 : 550000);
      const childCityKey = `${loc.city}, ${loc.state}`;
      const childCoords = CITY_COORDINATES[childCityKey] || { lat: 33.6676, lng: -84.0177 };

      accounts.push({
        id: cId,
        name: `${parent.name} - ${branchName}`,
        parentId: parent.id,
        parentName: parent.name,
        segment: parent.segment,
        channel: parent.channel,
        region,
        territory: `${region} - ${loc.city} District`,
        accountOwner: salesOwners[(pIdx + c) % salesOwners.length],
        tier,
        address: `${200 + c * 25} Industrial Way`,
        city: loc.city,
        state: loc.state,
        zip: loc.zip,
        latitude: childCoords.lat,
        longitude: childCoords.lng,
        activeSince: 2012 + (c % 8),
        creditLimit: isCreditOverdueSpecial ? 400000 : (tier === 'Premier Gold' ? 1500000 : 600000),
        creditHold: isCreditOverdueSpecial ? true : false,
        paymentTerms: '1% 10 Net 30',
        annualTargetSales: isDecliningSpecial ? 1800000 : baseTarget,
        installedControlsFlag: isControlsCrossSellSpecial ? false : (c % 2 === 0),
        childLocationsCount: 0,
        website: parent.website,
      });
    }
  });

  // Add Independent Regional Accounts
  independentNames.forEach((indName, idx) => {
    const cId = `ABL-CUST-${custIdCounter++}`;
    const region = regionsList[idx % regionsList.length];
    const locList = citiesByRegion[region];
    const loc = locList[idx % locList.length];
    const indCityKey = `${loc.city}, ${loc.state}`;
    const indCoords = CITY_COORDINATES[indCityKey] || { lat: 33.6676, lng: -84.0177 };
    const segment = (['Electrical Distributor', 'Electrical Contractor', 'Specifier & Lighting Designer', 'OEM Fixture Manufacturer', 'ESCO & Energy Solutions'][idx % 5]) as CustomerSegment;
    const channel = (['C&I Electrical Distribution', 'Contractor Direct', 'Specifier Influenced', 'OEM Sales', 'Government & Institutional'][idx % 5]) as Channel;
    const tier = (['Premier Gold', 'Core Silver', 'Emerging Bronze'][idx % 3]) as RelationshipTier;

    accounts.push({
      id: cId,
      name: indName,
      segment,
      channel,
      region,
      territory: `${region} - ${loc.city} Commercial`,
      accountOwner: salesOwners[idx % salesOwners.length],
      tier,
      address: `${700 + idx * 15} Commerce Blvd`,
      city: loc.city,
      state: loc.state,
      zip: loc.zip,
      latitude: indCoords.lat,
      longitude: indCoords.lng,
      activeSince: 2015 + (idx % 8),
      creditLimit: tier === 'Premier Gold' ? 1000000 : 450000,
      creditHold: false,
      paymentTerms: 'Net 30',
      annualTargetSales: tier === 'Premier Gold' ? 1600000 : 700000,
      installedControlsFlag: idx % 3 === 0,
      childLocationsCount: 0,
      website: `https://www.${indName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
    });
  });

  // 3. Generate Contacts (350+ realistic personas)
  const contacts: Contact[] = [];
  const contactFirstNames = ['James', 'Robert', 'Patricia', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'Richard', 'Barbara', 'Joseph', 'Susan', 'Thomas', 'Jessica', 'Charles', 'Sarah', 'Christopher', 'Karen', 'Daniel', 'Nancy', 'Matthew', 'Lisa', 'Anthony', 'Betty', 'Mark', 'Margaret'];
  const contactLastNames = ['Miller', 'Davis', 'Wilson', 'Anderson', 'Taylor', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson', 'Garcia', 'Martinez', 'Robinson', 'Clark', 'Rodriguez', 'Lewis', 'Lee', 'Walker', 'Hall', 'Allen', 'Young', 'Hernandez', 'King', 'Wright', 'Lopez'];

  const contactRoles = [
    { title: 'Chief Procurement Officer', role: 'Economic Buyer' as const, decisionPower: 'High' as const },
    { title: 'VP Electrical Operations', role: 'Economic Buyer' as const, decisionPower: 'High' as const },
    { title: 'Principal Lighting Designer', role: 'Technical Specifier' as const, decisionPower: 'High' as const },
    { title: 'Senior Controls Engineer', role: 'Technical Specifier' as const, decisionPower: 'Medium' as const },
    { title: 'Senior Purchasing Agent', role: 'Purchasing Agent' as const, decisionPower: 'Medium' as const },
    { title: 'Senior Project Manager', role: 'Project PM' as const, decisionPower: 'Medium' as const },
    { title: 'Master Certified Electrician', role: 'Master Electrician' as const, decisionPower: 'Low' as const },
    { title: 'Director of Accounting / Controller', role: 'CFO / Controller' as const, decisionPower: 'Medium' as const },
  ];

  accounts.forEach((acc, aIdx) => {
    const contactCount = acc.tier === 'Strategic Platinum' ? 5 : (acc.tier === 'Premier Gold' ? 4 : (acc.tier === 'Core Silver' ? 3 : 2));
    for (let i = 0; i < contactCount; i++) {
      const fName = contactFirstNames[(aIdx * 3 + i) % contactFirstNames.length];
      const lName = contactLastNames[(aIdx * 7 + i) % contactLastNames.length];
      const cRole = contactRoles[(aIdx + i) % contactRoles.length];
      contacts.push({
        id: `CNT-${acc.id}-${i + 1}`,
        accountId: acc.id,
        accountName: acc.name,
        name: `${fName} ${lName}`,
        title: cRole.title,
        role: cRole.role,
        email: `${fName.toLowerCase()}.${lName.toLowerCase()}@${acc.name.split(' ')[0].toLowerCase().replace(/[^a-z]/g, '')}.com`,
        phone: `+1 (${rng.nextInt(200, 999)}) ${rng.nextInt(200, 899)}-${rng.nextInt(1000, 9999)}`,
        decisionPower: cRole.decisionPower,
        nLightCertified: rng.next() > 0.65,
        lastContactDate: `2026-10-${String(rng.nextInt(1, 21)).padStart(2, '0')}`,
      });
    }
  });

  // 4. Monthly Snapshots (24 Months: Nov 2024 to Oct 2026)
  // Calendar: FY2025 (Nov 2024 - Oct 2025), FY2026 (Nov 2025 - Oct 2026)
  const monthlySnapshots: MonthlyFinancialSnapshot[] = [];
  const monthKeys: { key: string; label: string; fy: number; fq: string }[] = [];

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  // 24 months starting 2024-11
  let curYear = 2024;
  let curMonth = 11; // 1-indexed Nov
  for (let m = 0; m < 24; m++) {
    const mStr = String(curMonth).padStart(2, '0');
    const key = `${curYear}-${mStr}`;
    const label = `${monthNames[curMonth - 1]} ${curYear}`;
    // Fiscal year at Acuity starts Nov 1 or Sep 1; let's treat Nov-Oct as standard ABL Fiscal Year
    const fy = curMonth >= 11 ? curYear + 1 : curYear;
    let fq = 'Q1';
    if (curMonth >= 11 || curMonth === 1) fq = 'Q1';
    else if (curMonth >= 2 && curMonth <= 4) fq = 'Q2';
    else if (curMonth >= 5 && curMonth <= 7) fq = 'Q3';
    else fq = 'Q4';

    monthKeys.push({ key, label, fy, fq });

    curMonth++;
    if (curMonth > 12) {
      curMonth = 1;
      curYear++;
    }
  }

  // Generate monthly actuals and targets for accounts
  accounts.forEach((acc, aIdx) => {
    const monthlyBase = (acc.annualTargetSales / 12);
    // Determine account trajectory
    let trajectory = 1.0;
    if (acc.id === 'ABL-CUST-1008') trajectory = 0.76; // Marked decline
    else if (acc.id === 'ABL-CUST-1014') trajectory = 1.28; // Rapid growth
    else trajectory = 0.92 + (rng.next() * 0.22); // Typical variance

    monthKeys.forEach((mInfo, mIdx) => {
      // seasonality (lighting projects peak in spring/summer Q2-Q3)
      const seasonality = 1 + Math.sin((mIdx / 12) * Math.PI * 2) * 0.12;
      const noise = 0.95 + rng.next() * 0.1;
      const actualSales = Math.round(monthlyBase * trajectory * seasonality * noise);
      // Cost of goods sold: standard gross margin in commercial lighting is ~38% - 44%
      const marginPct = 0.38 + (aIdx % 7) * 0.01 + (rng.next() * 0.04 - 0.02);
      const cogs = Math.round(actualSales * (1 - marginPct));
      const grossMargin = actualSales - cogs;
      const targetSales = Math.round(monthlyBase * seasonality);
      const savedForecastBase = Math.round(targetSales * (0.98 + (rng.next() * 0.06)));
      const savedForecastUpside = Math.round(savedForecastBase * 1.08);
      const savedForecastDownside = Math.round(savedForecastBase * 0.91);
      const orderBookings = Math.round(actualSales * (0.94 + rng.next() * 0.15));

      monthlySnapshots.push({
        monthKey: mInfo.key,
        monthLabel: mInfo.label,
        fiscalYear: mInfo.fy,
        fiscalQuarter: mInfo.fq,
        accountId: acc.id,
        netSales: actualSales,
        cogs,
        grossMargin,
        grossMarginPct: Math.round((grossMargin / (actualSales || 1)) * 1000) / 10,
        targetSales,
        savedForecastBase,
        savedForecastUpside,
        savedForecastDownside,
        orderBookings,
      });
    });
  });

  // 5. Opportunities (280+ opportunities across sales pipeline)
  const opportunities: Opportunity[] = [];
  const projectTypes = [
    'Commercial Office' as const,
    'High-Bay Logistics' as const,
    'Healthcare Facility' as const,
    'Higher Education' as const,
    'Municipal Infrastructure' as const,
    'Retail & Hospitality' as const,
  ];

  const stages: { stage: OpportunityStage; winProb: number; defaultRisk: Opportunity['riskFactor'] }[] = [
    { stage: 'Prospecting & Lead Gen', winProb: 0.15, defaultRisk: 'Project Schedule Slip' },
    { stage: 'Technical Qualification', winProb: 0.35, defaultRisk: 'None - On Track' },
    { stage: 'Spec Lock & Value Engineering', winProb: 0.60, defaultRisk: 'None - On Track' },
    { stage: 'Proposal & BAFO', winProb: 0.75, defaultRisk: 'Competitor Price Concession' },
    { stage: 'Negotiation & Contract', winProb: 0.90, defaultRisk: 'None - On Track' },
    { stage: 'Closed Won', winProb: 1.0, defaultRisk: 'None - On Track' },
    { stage: 'Closed Lost', winProb: 0.0, defaultRisk: 'Competitor Price Concession' },
  ];

  const projectNouns = [
    'Campus LED Modernization', 'Distribution Center High-Bay Retrofit', 'Medical Pavilion Architectural Downlights',
    'Smart Logistics nLight Network', 'Corporate Headquarters Luminaire Upgrade', 'Municipal Expressway High-Mast Conversion',
    'University Science Center Ambient Grid', 'Life Sciences Cleanroom Lighting', 'Terminal Expansion Egress & Troffers',
    'Multi-Story Parking Structure Holophane Vandal-Resistant', 'Atrium Skylight Continuous Linear Fixtures'
  ];

  let oppIdCounter = 4001;
  accounts.forEach((acc, aIdx) => {
    // Top accounts have 3-5 open opps, smaller have 1-3
    const numOpps = acc.tier === 'Strategic Platinum' ? 4 : (acc.tier === 'Premier Gold' ? 3 : 2);
    for (let o = 0; o < numOpps; o++) {
      const oppId = `OPP-${oppIdCounter++}`;
      const stageInfo = stages[(aIdx + o) % stages.length];
      const pFamily = productFamilies[(aIdx * 2 + o) % productFamilies.length];
      const pType = projectTypes[(aIdx + o) % projectTypes.length];
      const pNoun = projectNouns[(aIdx * 3 + o) % projectNouns.length];
      const baseVal = acc.tier === 'Strategic Platinum' ? rng.nextInt(150000, 680000) : rng.nextInt(45000, 220000);
      const stageAge = rng.nextInt(12, 110);
      
      let risk = stageInfo.defaultRisk;
      let recAction = 'Schedule technical alignment with project specifier.';
      if (stageAge > 60 && stageInfo.stage === 'Proposal & BAFO') {
        risk = 'Stalled in Proposal';
        recAction = 'Executive sponsor follow-up with purchasing director; review value engineering concessions.';
      } else if (pFamily === 'nLight® Controls') {
        recAction = 'Offer Acuity onsite commissioning assistance to de-risk contractor adoption.';
      } else if (stageInfo.stage === 'Spec Lock & Value Engineering') {
        recAction = 'Deliver photometric layout study to protect spec against substitute brand bids.';
      }

      opportunities.push({
        id: oppId,
        accountId: acc.id,
        accountName: acc.name,
        projectName: `${acc.name.split(' - ')[0]} - ${pNoun}`,
        projectType: pType,
        stage: stageInfo.stage,
        value: baseVal,
        winProbability: stageInfo.winProb,
        weightedValue: Math.round(baseVal * stageInfo.winProb),
        expectedCloseDate: `2026-${String(rng.nextInt(10, 12)).padStart(2, '0')}-${String(rng.nextInt(10, 28)).padStart(2, '0')}`,
        productFamily: pFamily,
        stageAgeDays: stageAge,
        lastActivityDate: `2026-10-${String(rng.nextInt(1, 21)).padStart(2, '0')}`,
        winProbabilitySource: 'Historical Win Rate + Stage Multiplier',
        riskFactor: risk,
        recommendedAction: recAction,
      });
    }
  });

  // 6. Quotes (500+ quotes)
  const quotes: Quote[] = [];
  let quoteIdCounter = 8001;
  opportunities.forEach((opp, idx) => {
    const qCount = idx % 2 === 0 ? 2 : 1;
    for (let q = 0; q < qCount; q++) {
      const qNum = `QTE-2026-${quoteIdCounter++}`;
      const discount = 0.05 + rng.next() * 0.12;
      const grossVal = Math.round(opp.value * (1 + discount));
      const discVal = opp.value;
      const margin = 0.38 + rng.next() * 0.08;
      const qStatus = opp.stage === 'Closed Won' ? 'Won' : (opp.stage === 'Closed Lost' ? 'Lost' : (q === 0 ? 'Open' : 'Revised'));
      
      quotes.push({
        id: `QT-${quoteIdCounter}`,
        quoteNumber: qNum,
        accountId: opp.accountId,
        accountName: opp.accountName,
        opportunityId: opp.id,
        dateIssued: `2026-0${rng.nextInt(7, 9)}-${String(rng.nextInt(1, 28)).padStart(2, '0')}`,
        expirationDate: `2026-11-${String(rng.nextInt(1, 30)).padStart(2, '0')}`,
        status: qStatus,
        grossValue: grossVal,
        discountedValue: discVal,
        marginPct: Math.round(margin * 1000) / 10,
        productFamilies: [opp.productFamily],
        revisionNumber: q + 1,
        competitorPressure: (['High', 'Medium', 'Low'][idx % 3]) as 'High' | 'Medium' | 'Low',
      });
    }
  });

  // 7. Orders & Backlog (1,600+ order lines)
  const orderLines: OrderLine[] = [];
  let orderLineCounter = 10001;

  const sampleSkus: Record<ProductFamily, { sku: string; price: number; margin: number }[]> = {
    'Lithonia Lighting®': [
      { sku: 'BLT4-4000LM-40K-0-10V', price: 89, margin: 0.39 },
      { sku: 'CPX-2X4-ALO-SWW7', price: 68, margin: 0.37 },
      { sku: 'IBG-18000LM-MVOLT-50K', price: 145, margin: 0.42 },
    ],
    'Holophane®': [
      { sku: 'PHX-HIGH-MAST-100K-LM', price: 1250, margin: 0.46 },
      { sku: 'TEAR-DROP-LED-ROADWAY', price: 820, margin: 0.44 },
      { sku: 'PREDATOR-FLOOD-HE-50K', price: 460, margin: 0.43 },
    ],
    'Gotham®': [
      { sku: 'EVO-6IN-ROUND-DOWNLIGHT', price: 210, margin: 0.48 },
      { sku: 'INCITO-4IN-ADJUSTABLE', price: 245, margin: 0.51 },
    ],
    'Mark Architectural Lighting™': [
      { sku: 'SLOT-4-RECESSED-LINEAR', price: 340, margin: 0.47 },
      { sku: 'WHISPER-ACOUSTIC-LED', price: 520, margin: 0.49 },
    ],
    'Juno®': [
      { sku: 'PODZ-CANLESS-4IN-CCT', price: 42, margin: 0.36 },
      { sku: 'TRAC-MASTER-LED-CYLINDER', price: 95, margin: 0.41 },
    ],
    'Peerless®': [
      { sku: 'BRUNO-INDIRECT-PENDANT', price: 380, margin: 0.49 },
      { sku: 'OPEN-WIDE-SUSPENDED-LUM', price: 410, margin: 0.50 },
    ],
    'nLight® Controls': [
      { sku: 'NIO-BT-COMMISSIONING-PACK', price: 310, margin: 0.54 },
      { sku: 'NPOD-TOUCH-WALLSTATION', price: 195, margin: 0.56 },
      { sku: 'NPP16-D-POWER-PACK-DIM', price: 78, margin: 0.52 },
    ],
    'Atrius® IoT & Buildings': [
      { sku: 'ATRIUS-SPATIAL-GATEWAY-V3', price: 850, margin: 0.62 },
      { sku: 'ATRIUS-ENERGY-SUB-YEAR', price: 1400, margin: 0.74 },
    ],
    'SensorSwitch™': [
      { sku: 'CMR-9-OCCUPANCY-SENSOR', price: 54, margin: 0.48 },
      { sku: 'WSX-DIM-PULL-SWITCH', price: 62, margin: 0.50 },
    ],
    'Aculux®': [
      { sku: 'AX3-PRECISION-PINHOLE-LED', price: 285, margin: 0.53 },
      { sku: 'INITIATIVE-WARMDIM-ACCENT', price: 320, margin: 0.55 },
    ],
  };

  accounts.forEach((acc, aIdx) => {
    // 8 to 14 orders per account across recent months
    const orderCount = acc.tier === 'Strategic Platinum' ? 14 : (acc.tier === 'Premier Gold' ? 10 : 7);
    for (let o = 0; o < orderCount; o++) {
      const orderNum = `ORD-2026-${1000 + (aIdx * 15 + o)}`;
      const pFamily = productFamilies[(aIdx + o) % productFamilies.length];
      const skuList = sampleSkus[pFamily];
      const skuEntry = skuList[o % skuList.length];
      const qty = acc.tier === 'Strategic Platinum' ? rng.nextInt(50, 400) : rng.nextInt(15, 120);
      const total = qty * skuEntry.price;
      const cogs = Math.round(total * (1 - skuEntry.margin));
      const mPct = Math.round(((total - cogs) / total) * 1000) / 10;

      // Status: recent orders (o >= 8) might be in backlog / in production
      let status: OrderLine['status'] = 'Delivered';
      let onTime: OrderLine['onTimeStatus'] = 'On-Time';
      let shipDate: string | undefined = `2026-0${rng.nextInt(5, 9)}-${String(rng.nextInt(1, 28)).padStart(2, '0')}`;

      if (o === orderCount - 1) {
        status = 'Backlog Scheduled';
        onTime = 'Pending';
        shipDate = undefined;
      } else if (o === orderCount - 2) {
        status = rng.next() > 0.3 ? 'In Production' : 'Backlog At Risk';
        onTime = status === 'Backlog At Risk' ? 'Supplier Delay' : 'Pending';
        shipDate = undefined;
      } else if (rng.next() < 0.08) {
        onTime = 'Logistics Delay';
      }

      orderLines.push({
        id: `OL-${orderLineCounter++}`,
        orderNumber: orderNum,
        accountId: acc.id,
        accountName: acc.name,
        agentId: agentNameToId[acc.accountOwner] || 'AGT-101',
        facilityId: productFamilyToFacilityId[pFamily] || 'FAC-01',
        orderDate: `2026-0${rng.nextInt(3, 9)}-${String(rng.nextInt(1, 28)).padStart(2, '0')}`,
        requiredShipDate: `2026-10-${String(rng.nextInt(10, 30)).padStart(2, '0')}`,
        actualShipDate: shipDate,
        productSku: skuEntry.sku,
        productFamily: pFamily,
        category: productFamilyToCategory[pFamily],
        quantity: qty,
        unitPrice: skuEntry.price,
        lineTotal: total,
        cogs,
        grossMarginPct: mPct,
        status,
        onTimeStatus: onTime,
      });
    }
  });

  // 8. Invoices and Payments (Reconciled Ledger)
  const invoices: Invoice[] = [];
  const payments: Payment[] = [];
  let invoiceCounter = 20001;
  let paymentCounter = 30001;

  // Create invoices for shipped/delivered orders
  const shippedOrders = orderLines.filter(ol => ol.status === 'Delivered' || ol.status === 'Shipped');
  shippedOrders.forEach((ol, idx) => {
    const invId = `INV-2026-${invoiceCounter++}`;
    const totalAmount = ol.lineTotal;
    
    // Explicit credit test account ABL-CUST-1025
    const isSpecialOverdue = ol.accountId === 'ABL-CUST-1025';

    let outstanding = 0;
    let paid = totalAmount;
    let overdueDays = 0;
    let invStatus: Invoice['status'] = 'Paid';
    let disputedAmt = 0;
    let disputeReason: Invoice['disputeReason'] | undefined = undefined;

    if (isSpecialOverdue && idx % 2 === 0) {
      outstanding = totalAmount;
      paid = 0;
      overdueDays = rng.nextInt(62, 95);
      invStatus = overdueDays > 90 ? 'Overdue 90+' : 'Overdue 60';
    } else if (idx % 9 === 0) {
      // General overdue invoices in portfolio
      outstanding = Math.round(totalAmount * 0.7);
      paid = totalAmount - outstanding;
      overdueDays = rng.nextInt(31, 75);
      invStatus = overdueDays > 60 ? 'Overdue 60' : 'Overdue 30';
    } else if (idx % 19 === 0) {
      // Disputed invoice
      outstanding = totalAmount;
      paid = 0;
      disputedAmt = totalAmount;
      invStatus = 'Disputed';
      disputeReason = 'Price Discrepancy';
    } else if (idx % 7 === 0) {
      // Current open invoice
      outstanding = totalAmount;
      paid = 0;
      overdueDays = 0;
      invStatus = 'Open Current';
    }

    invoices.push({
      id: invId,
      invoiceNumber: invId,
      accountId: ol.accountId,
      accountName: ol.accountName,
      orderNumber: ol.orderNumber,
      invoiceDate: ol.orderDate,
      dueDate: `2026-10-${String(rng.nextInt(1, 28)).padStart(2, '0')}`,
      totalAmount,
      paidAmount: paid,
      outstandingBalance: outstanding,
      overdueDays,
      status: invStatus,
      disputedAmount: disputedAmt,
      disputeReason,
    });

    if (paid > 0) {
      payments.push({
        id: `PMT-${paymentCounter++}`,
        paymentNumber: `ACH-REC-${paymentCounter}`,
        accountId: ol.accountId,
        invoiceId: invId,
        paymentDate: `2026-09-${String(rng.nextInt(1, 28)).padStart(2, '0')}`,
        amount: paid,
        method: rng.pick(['ACH Transfer', 'Wire Settlement', 'Lockbox Check']),
      });
    }
  });

  // 9. Service Cases (300+ records)
  const serviceCases: ServiceCase[] = [];
  const serviceCategories: { cat: ServiceCategory; pFam: ProductFamily; commonSubject: string }[] = [
    { cat: 'LED Driver Failure (eldoLED)', pFam: 'Lithonia Lighting®', commonSubject: 'eldoLED SOLOdrive driver flashing or intermittent power loss' },
    { cat: 'nLight Network Commissioning', pFam: 'nLight® Controls', commonSubject: 'nLight AIR gateway fails to discover wallpods on 3rd floor zone' },
    { cat: 'Firmware Incompatibility', pFam: 'nLight® Controls', commonSubject: 'SensorSwitch v2.4 firmware conflict with nLight bridge unit' },
    { cat: 'Optics / Lens Blemish', pFam: 'Gotham®', commonSubject: 'Reflector cone finish scuffs discovered on architectural downlights' },
    { cat: 'Transit / Packaging Damage', pFam: 'Holophane®', commonSubject: 'High-mast roadway glass refractor cracked during flatbed transport' },
    { cat: 'Incorrect Specification / BOM', pFam: 'Mark Architectural Lighting™', commonSubject: 'Continuous slot fixture supplied with 3500K instead of 4000K' },
  ];

  const engineers = ['Tyler Scott (Lead Systems Tech)', 'Jessica Morales (Field Applications)', 'Aaron Patel (eldoLED Specialist)', 'Derek Hughes (nLight Field Eng)'];

  let caseCounter = 5001;
  accounts.forEach((acc, aIdx) => {
    // 1 to 4 cases per account
    const caseCount = acc.tier === 'Strategic Platinum' ? 3 : (acc.tier === 'Premier Gold' ? 2 : 1);
    for (let c = 0; c < caseCount; c++) {
      const caseId = `CAS-${caseCounter++}`;
      const template = serviceCategories[(aIdx + c) % serviceCategories.length];
      const severity: ServiceSeverity = (c === 0 && aIdx % 6 === 0) ? 'Critical' : (c === 1 ? 'High' : (c === 2 ? 'Medium' : 'Low'));
      const isOpen = rng.next() > 0.45;
      const slaDeadline = severity === 'Critical' ? 4 : (severity === 'High' ? 24 : (severity === 'Medium' ? 48 : 96));
      const actualHours = isOpen ? undefined : rng.nextInt(2, slaDeadline + 15);
      const slaBreached = isOpen ? (rng.next() > 0.7) : ((actualHours || 0) > slaDeadline);
      const isRepeat = (template.cat === 'LED Driver Failure (eldoLED)' && aIdx % 4 === 0) || (template.cat === 'nLight Network Commissioning' && aIdx % 3 === 0);

      let status: ServiceCase['status'] = isOpen ? (slaBreached ? 'Escalated' : 'In Progress') : 'Closed';
      if (isOpen && c === 0 && rng.next() > 0.6) status = 'Waiting Customer';

      serviceCases.push({
        id: caseId,
        caseNumber: caseId,
        accountId: acc.id,
        accountName: acc.name,
        dateOpened: `2026-10-${String(rng.nextInt(1, 18)).padStart(2, '0')}`,
        dateResolved: isOpen ? undefined : `2026-10-${String(rng.nextInt(19, 21)).padStart(2, '0')}`,
        status,
        severity,
        category: template.cat,
        productFamily: template.pFam,
        subject: `${template.commonSubject} - ${acc.city} Site`,
        slaDeadlineHours: slaDeadline,
        actualResolutionHours: actualHours,
        slaBreached,
        repeatIssue: isRepeat,
        reopened: rng.next() > 0.85,
        csatScore: isOpen ? undefined : rng.pick([4, 5, 5, 3, 4]),
        warrantyEligible: true,
        warrantyApproved: !isOpen,
        assignedEngineer: engineers[(aIdx + c) % engineers.length],
        recommendedAction: isRepeat
          ? 'Dispatch regional field engineer with replacement eldoLED batch and perform on-site harness check.'
          : 'Review network topology map and verify BACnet/IP integration settings.',
      });
    }
  });

  // 10. Engagement & Certifications
  const engagementEvents: EngagementEvent[] = [];
  let engCounter = 6001;
  accounts.forEach((acc, aIdx) => {
    const evCount = acc.tier === 'Strategic Platinum' ? 3 : (acc.tier === 'Premier Gold' ? 2 : 1);
    for (let e = 0; e < evCount; e++) {
      const types = [
        'Acuity Academy Course' as const,
        'nLight Hands-On Lab' as const,
        'Factory Tour (Conyers/Monterrey)' as const,
        'AIA Specifier Seminar' as const,
        'Annual Distributor Business Review' as const,
      ];
      const evType = types[(aIdx + e) % types.length];
      engagementEvents.push({
        id: `ENG-${engCounter++}`,
        accountId: acc.id,
        eventDate: `2026-0${rng.nextInt(3, 9)}-${String(rng.nextInt(1, 28)).padStart(2, '0')}`,
        type: evType,
        title: `${evType} - ${acc.name.split(' - ')[0]} Delegation`,
        attendeeCount: rng.nextInt(3, 16),
        ratingScore: rng.pick([4.5, 4.8, 5.0, 4.2]),
      });
    }
  });

  // 11. Customer Health Calculation & Recommendations Generation
  const healthMap: Record<string, CustomerHealth> = {};
  const recommendations: Recommendation[] = [];
  let recCounter = 7001;

  accounts.forEach((acc) => {
    // Aggregate key signals for this account
    const accInvoices = invoices.filter(i => i.accountId === acc.id);
    const totalAR = accInvoices.reduce((sum, i) => sum + i.outstandingBalance, 0);
    const overdueAR = accInvoices.filter(i => i.overdueDays > 0).reduce((sum, i) => sum + i.outstandingBalance, 0);
    const overdueRatio = totalAR > 0 ? overdueAR / totalAR : 0;
    const creditUtil = acc.creditLimit > 0 ? (totalAR / acc.creditLimit) : 0;

    const accCases = serviceCases.filter(c => c.accountId === acc.id);
    const criticalOpenCases = accCases.filter(c => c.status !== 'Closed' && (c.severity === 'Critical' || c.slaBreached)).length;
    const repeatIssues = accCases.filter(c => c.repeatIssue).length;

    const accOrders = orderLines.filter(ol => ol.accountId === acc.id);
    const hasControls = accOrders.some(ol => ol.productFamily === 'nLight® Controls' || ol.productFamily === 'Atrius® IoT & Buildings');

    // Recent sales trend
    const recentSnaps = monthlySnapshots.filter(s => s.accountId === acc.id && s.fiscalYear === 2026);
    const ytdSales = recentSnaps.reduce((sum, s) => sum + s.netSales, 0);
    const ytdTarget = recentSnaps.reduce((sum, s) => sum + s.targetSales, 0);
    const salesTargetRatio = ytdTarget > 0 ? ytdSales / ytdTarget : 1;

    // Component Scores (0-100)
    let commercialScore = Math.min(100, Math.round(salesTargetRatio * 85));
    let serviceScore = 95 - (criticalOpenCases * 25) - (repeatIssues * 15);
    serviceScore = Math.max(10, Math.min(100, serviceScore));

    let financialScore = 95 - Math.round(overdueRatio * 50) - (creditUtil > 0.85 ? 30 : 0);
    financialScore = Math.max(10, Math.min(100, financialScore));

    let engagementScore = (hasControls ? 90 : 50) + (acc.tier === 'Strategic Platinum' ? 10 : 0);
    engagementScore = Math.min(100, engagementScore);

    // Weighted Overall: 35% Comm, 25% Service, 25% Finance, 15% Eng
    const overall = Math.round(
      commercialScore * 0.35 +
      serviceScore * 0.25 +
      financialScore * 0.25 +
      engagementScore * 0.15
    );

    let band: CustomerHealth['band'] = 'Healthy';
    if (overall < 50) band = 'Critical';
    else if (overall < 70) band = 'At Risk';
    else if (overall < 85) band = 'Stable';

    const drivers: string[] = [];
    if (salesTargetRatio < 0.85) drivers.push(`Sales pacing ${Math.round((1 - salesTargetRatio) * 100)}% below approved target.`);
    if (criticalOpenCases > 0) drivers.push(`${criticalOpenCases} open critical service case(s) with SLA impact.`);
    if (repeatIssues > 0) drivers.push(`Repeat driver/control commissioning issues detected.`);
    if (overdueAR > 100000 || overdueRatio > 0.3) drivers.push(`Overdue AR ratio at ${(overdueRatio * 100).toFixed(0)}% ($${Math.round(overdueAR / 1000)}k overdue).`);
    if (creditUtil > 0.85) drivers.push(`Credit line utilization at ${(creditUtil * 100).toFixed(0)}% (approaching ceiling).`);
    if (drivers.length === 0) drivers.push('Strong multi-brand adoption, high order cadence, healthy receivables.');

    const crossSell: string[] = [];
    if (!hasControls) crossSell.push('nLight® Controls retrofit for existing Lithonia Troffer installations.');
    if (!accOrders.some(ol => ol.productFamily === 'Holophane®')) crossSell.push('Holophane® outdoor high-mast and site lighting expansion.');
    if (!accOrders.some(ol => ol.productFamily === 'Gotham®')) crossSell.push('Gotham® architectural downlighting for premium tenant fit-outs.');

    healthMap[acc.id] = {
      accountId: acc.id,
      overallScore: overall,
      band,
      components: {
        commercialMomentum: commercialScore,
        serviceQuality: serviceScore,
        financialRisk: financialScore,
        strategicEngagement: engagementScore,
      },
      keyDrivers: drivers,
      crossSellOpportunities: crossSell,
    };

    // Generate Actionable Recommendations for notable accounts
    if (band === 'Critical' || band === 'At Risk') {
      if (criticalOpenCases > 0) {
        recommendations.push({
          id: `REC-${recCounter++}`,
          accountId: acc.id,
          accountName: acc.name,
          persona: 'Service',
          signal: 'Multiple SLA Breaches on eldoLED Driver Failures',
          evidence: `${criticalOpenCases} active critical case(s) open >48 hrs across ${acc.name}.`,
          businessSignificance: 'Project handover delay risks liquidated damages and account dissatisfaction.',
          recommendedAction: 'Dispatch senior field applications engineer and authorize expedited replacement driver shipment.',
          potentialImpactUsd: 140000,
          confidence: 'High',
          suggestedOwner: 'Tyler Scott (Lead Systems Tech)',
          priority: 'Urgent',
          category: 'Service Resolution',
        });
      }

      if (overdueAR > 75000 || creditUtil > 0.85) {
        recommendations.push({
          id: `REC-${recCounter++}`,
          accountId: acc.id,
          accountName: acc.name,
          persona: 'Finance',
          signal: 'High Credit Utilization & Aging Overdue AR',
          evidence: `Credit utilization ${(creditUtil * 100).toFixed(0)}% with $${Math.round(overdueAR / 1000)}k past 60 days.`,
          businessSignificance: 'Capital lockup and default exposure during high-volume shipment release.',
          recommendedAction: 'Initiate finance review with controller; offer partial settlement plan before order release hold.',
          potentialImpactUsd: Math.round(overdueAR),
          confidence: 'High',
          suggestedOwner: acc.accountOwner,
          priority: overdueRatio > 0.4 ? 'Urgent' : 'High',
          category: 'Credit & Cash Collection',
        });
      }

      if (salesTargetRatio < 0.80) {
        recommendations.push({
          id: `REC-${recCounter++}`,
          accountId: acc.id,
          accountName: acc.name,
          persona: 'Sales',
          signal: 'Significant Pacing Shortfall vs Illustrative Target',
          evidence: `YTD sales $${Math.round(ytdSales / 1000)}k vs target $${Math.round(ytdTarget / 1000)}k (-${Math.round((1 - salesTargetRatio) * 100)}%).`,
          businessSignificance: 'Distributor branch volume leak to regional competitor.',
          recommendedAction: 'Conduct joint business review with distributor principal; introduce competitive contractor stock package.',
          potentialImpactUsd: Math.round(ytdTarget - ytdSales),
          confidence: 'High',
          suggestedOwner: acc.accountOwner,
          priority: 'High',
          category: 'Revenue Retention',
        });
      }
    }

    // High potential cross-sell recommendation for healthy accounts without controls
    if (!hasControls && acc.tier !== 'Emerging Bronze' && overall >= 70 && recommendations.length < 25) {
      recommendations.push({
        id: `REC-${recCounter++}`,
        accountId: acc.id,
        accountName: acc.name,
        persona: 'Sales',
        signal: 'Unrealized nLight® Networked Controls Cross-Sell',
        evidence: `Consistent high-volume Lithonia fixture purchases with 0% nLight controls attach rate.`,
        businessSignificance: 'Estimated 25%-35% project margin expansion when bundling smart controls.',
        recommendedAction: 'Introduce contractor to nLight AIR starter kit rebate and schedule Acuity Academy certification lab.',
        potentialImpactUsd: 85000,
        confidence: 'Medium',
        suggestedOwner: acc.accountOwner,
        priority: 'Medium',
        category: 'Cross-Sell Signal',
      });
    }
  });

  return {
    accounts,
    contacts,
    opportunities,
    quotes,
    orderLines,
    invoices,
    payments,
    serviceCases,
    engagementEvents,
    monthlySnapshots,
    healthMap,
    recommendations,
    agents,
    facilities,
  };
}

// Singleton cache so all pages and views access the exact same dataset instance
let cachedDataset: SyntheticDataset | null = null;

export function getSyntheticDataset(): SyntheticDataset {
  if (!cachedDataset) {
    cachedDataset = generateSyntheticDataset();
  }
  return cachedDataset;
}
