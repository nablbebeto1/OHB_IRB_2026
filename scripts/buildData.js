// Build script for Oromia Administrative Hierarchy & Health Facilities

import fs from 'fs';
import path from 'path';

// All 22 Zones in Oromia
const ZONES_DEF = [
  { id: 1, name: 'Arsi', code: 'ARS' },
  { id: 2, name: 'Bale', code: 'BAL' },
  { id: 3, name: 'Borena', code: 'BOR' },
  { id: 4, name: 'Buno Bedele', code: 'BBD' },
  { id: 5, name: 'East Bale', code: 'EBL' },
  { id: 6, name: 'East Borena', code: 'EBR' },
  { id: 7, name: 'East Hararge', code: 'EHR' },
  { id: 8, name: 'East Shewa', code: 'ESH' },
  { id: 9, name: 'East Wellega', code: 'EWL' },
  { id: 10, name: 'Guji', code: 'GUJ' },
  { id: 11, name: 'Horo Gudru Wellega', code: 'HGW' },
  { id: 12, name: 'Ilu Aba Bora', code: 'IAB' },
  { id: 13, name: 'Jimma', code: 'JIM' },
  { id: 14, name: 'Kelem Wellega', code: 'KWL' },
  { id: 15, name: 'North Shewa (OR)', code: 'NSH' },
  { id: 16, name: 'Shager City', code: 'SGC' },
  { id: 17, name: 'South West Shewa', code: 'SWS' },
  { id: 18, name: 'West Arsi', code: 'WAR' },
  { id: 19, name: 'West Guji', code: 'WGJ' },
  { id: 20, name: 'West Hararge', code: 'WHR' },
  { id: 21, name: 'West Shewa', code: 'WSH' },
  { id: 22, name: 'West Wellega', code: 'WWL' },
];

console.log('Zone definitions ready:', ZONES_DEF.length);
