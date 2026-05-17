export interface RealStar {
  id: string;
  name: string;
  catalogName: string;
  rightAscensionHours: number;
  declinationDegrees: number;
  apparentMagnitude: number;
  colorIndex: number;
  distanceLightYears: number;
}

export const BRIGHT_STARS: RealStar[] = [
  { id: "hyg-sirius", name: "Sirius", catalogName: "Alpha Canis Majoris", rightAscensionHours: 6.7525, declinationDegrees: -16.7161, apparentMagnitude: -1.46, colorIndex: 0, distanceLightYears: 8.6 },
  { id: "hyg-canopus", name: "Canopus", catalogName: "Alpha Carinae", rightAscensionHours: 6.3992, declinationDegrees: -52.6957, apparentMagnitude: -0.74, colorIndex: 0.15, distanceLightYears: 310 },
  { id: "hyg-arcturus", name: "Arcturus", catalogName: "Alpha Bootis", rightAscensionHours: 14.261, declinationDegrees: 19.1825, apparentMagnitude: -0.05, colorIndex: 1.23, distanceLightYears: 36.7 },
  { id: "hyg-vega", name: "Vega", catalogName: "Alpha Lyrae", rightAscensionHours: 18.6156, declinationDegrees: 38.7837, apparentMagnitude: 0.03, colorIndex: 0, distanceLightYears: 25 },
  { id: "hyg-capella", name: "Capella", catalogName: "Alpha Aurigae", rightAscensionHours: 5.2782, declinationDegrees: 45.998, apparentMagnitude: 0.08, colorIndex: 0.8, distanceLightYears: 42.9 },
  { id: "hyg-rigel", name: "Rigel", catalogName: "Beta Orionis", rightAscensionHours: 5.2423, declinationDegrees: -8.2016, apparentMagnitude: 0.13, colorIndex: -0.03, distanceLightYears: 860 },
  { id: "hyg-procyon", name: "Procyon", catalogName: "Alpha Canis Minoris", rightAscensionHours: 7.655, declinationDegrees: 5.225, apparentMagnitude: 0.34, colorIndex: 0.42, distanceLightYears: 11.5 },
  { id: "hyg-betelgeuse", name: "Betelgeuse", catalogName: "Alpha Orionis", rightAscensionHours: 5.9195, declinationDegrees: 7.4071, apparentMagnitude: 0.42, colorIndex: 1.85, distanceLightYears: 548 },
  { id: "hyg-achernar", name: "Achernar", catalogName: "Alpha Eridani", rightAscensionHours: 1.6286, declinationDegrees: -57.2368, apparentMagnitude: 0.46, colorIndex: -0.16, distanceLightYears: 139 },
  { id: "hyg-hadar", name: "Hadar", catalogName: "Beta Centauri", rightAscensionHours: 14.0637, declinationDegrees: -60.373, apparentMagnitude: 0.61, colorIndex: -0.23, distanceLightYears: 390 },
  { id: "hyg-altair", name: "Altair", catalogName: "Alpha Aquilae", rightAscensionHours: 19.8464, declinationDegrees: 8.8683, apparentMagnitude: 0.76, colorIndex: 0.22, distanceLightYears: 16.7 },
  { id: "hyg-acrux", name: "Acrux", catalogName: "Alpha Crucis", rightAscensionHours: 12.4433, declinationDegrees: -63.0991, apparentMagnitude: 0.76, colorIndex: -0.24, distanceLightYears: 320 },
  { id: "hyg-aldebaran", name: "Aldebaran", catalogName: "Alpha Tauri", rightAscensionHours: 4.5987, declinationDegrees: 16.5093, apparentMagnitude: 0.86, colorIndex: 1.54, distanceLightYears: 65 },
  { id: "hyg-spica", name: "Spica", catalogName: "Alpha Virginis", rightAscensionHours: 13.4199, declinationDegrees: -11.1613, apparentMagnitude: 0.97, colorIndex: -0.23, distanceLightYears: 250 },
  { id: "hyg-antares", name: "Antares", catalogName: "Alpha Scorpii", rightAscensionHours: 16.4901, declinationDegrees: -26.432, apparentMagnitude: 1.06, colorIndex: 1.83, distanceLightYears: 550 },
  { id: "hyg-pollux", name: "Pollux", catalogName: "Beta Geminorum", rightAscensionHours: 7.7553, declinationDegrees: 28.0262, apparentMagnitude: 1.14, colorIndex: 1, distanceLightYears: 34 },
  { id: "hyg-fomalhaut", name: "Fomalhaut", catalogName: "Alpha Piscis Austrini", rightAscensionHours: 22.9608, declinationDegrees: -29.6222, apparentMagnitude: 1.16, colorIndex: 0.09, distanceLightYears: 25 },
  { id: "hyg-deneb", name: "Deneb", catalogName: "Alpha Cygni", rightAscensionHours: 20.6905, declinationDegrees: 45.2803, apparentMagnitude: 1.25, colorIndex: 0.09, distanceLightYears: 2600 },
  { id: "hyg-regulus", name: "Regulus", catalogName: "Alpha Leonis", rightAscensionHours: 10.1395, declinationDegrees: 11.9672, apparentMagnitude: 1.35, colorIndex: -0.11, distanceLightYears: 79 },
  { id: "hyg-adhara", name: "Adhara", catalogName: "Epsilon Canis Majoris", rightAscensionHours: 6.9771, declinationDegrees: -28.9721, apparentMagnitude: 1.5, colorIndex: -0.21, distanceLightYears: 430 },
  { id: "hyg-castor", name: "Castor", catalogName: "Alpha Geminorum", rightAscensionHours: 7.5767, declinationDegrees: 31.8883, apparentMagnitude: 1.58, colorIndex: 0.03, distanceLightYears: 51 },
  { id: "hyg-shaula", name: "Shaula", catalogName: "Lambda Scorpii", rightAscensionHours: 17.5601, declinationDegrees: -37.1038, apparentMagnitude: 1.62, colorIndex: -0.22, distanceLightYears: 570 },
  { id: "hyg-bellatrix", name: "Bellatrix", catalogName: "Gamma Orionis", rightAscensionHours: 5.4189, declinationDegrees: 6.3497, apparentMagnitude: 1.64, colorIndex: -0.22, distanceLightYears: 250 },
  { id: "hyg-elnath", name: "Elnath", catalogName: "Beta Tauri", rightAscensionHours: 5.4382, declinationDegrees: 28.6075, apparentMagnitude: 1.65, colorIndex: -0.13, distanceLightYears: 134 },
  { id: "hyg-miaplacidus", name: "Miaplacidus", catalogName: "Beta Carinae", rightAscensionHours: 9.22, declinationDegrees: -69.7172, apparentMagnitude: 1.67, colorIndex: -0.1, distanceLightYears: 113 },
  { id: "hyg-alnilam", name: "Alnilam", catalogName: "Epsilon Orionis", rightAscensionHours: 5.6036, declinationDegrees: -1.2019, apparentMagnitude: 1.69, colorIndex: -0.18, distanceLightYears: 2000 },
  { id: "hyg-alnair", name: "Alnair", catalogName: "Alpha Gruis", rightAscensionHours: 22.1372, declinationDegrees: -46.9609, apparentMagnitude: 1.74, colorIndex: -0.07, distanceLightYears: 101 },
  { id: "hyg-alioth", name: "Alioth", catalogName: "Epsilon Ursae Majoris", rightAscensionHours: 12.9005, declinationDegrees: 55.9598, apparentMagnitude: 1.77, colorIndex: -0.02, distanceLightYears: 82.6 },
  { id: "hyg-dubhe", name: "Dubhe", catalogName: "Alpha Ursae Majoris", rightAscensionHours: 11.0621, declinationDegrees: 61.751, apparentMagnitude: 1.79, colorIndex: 1.07, distanceLightYears: 123 },
  { id: "hyg-mirfak", name: "Mirfak", catalogName: "Alpha Persei", rightAscensionHours: 3.4054, declinationDegrees: 49.8612, apparentMagnitude: 1.79, colorIndex: 0.48, distanceLightYears: 590 },
  { id: "hyg-polaris", name: "Polaris", catalogName: "Alpha Ursae Minoris", rightAscensionHours: 2.5303, declinationDegrees: 89.2641, apparentMagnitude: 1.98, colorIndex: 0.6, distanceLightYears: 433 },
  { id: "hyg-merak", name: "Merak", catalogName: "Beta Ursae Majoris", rightAscensionHours: 11.0307, declinationDegrees: 56.3824, apparentMagnitude: 2.37, colorIndex: 0.03, distanceLightYears: 79.7 },
  { id: "hyg-phecda", name: "Phecda", catalogName: "Gamma Ursae Majoris", rightAscensionHours: 11.8972, declinationDegrees: 53.6948, apparentMagnitude: 2.44, colorIndex: 0, distanceLightYears: 83 },
  { id: "hyg-megrez", name: "Megrez", catalogName: "Delta Ursae Majoris", rightAscensionHours: 12.2571, declinationDegrees: 57.0326, apparentMagnitude: 3.31, colorIndex: 0.08, distanceLightYears: 80.5 },
  { id: "hyg-mizar", name: "Mizar", catalogName: "Zeta Ursae Majoris", rightAscensionHours: 13.3988, declinationDegrees: 54.9254, apparentMagnitude: 2.23, colorIndex: 0.03, distanceLightYears: 82.9 },
  { id: "hyg-alkaid", name: "Alkaid", catalogName: "Eta Ursae Majoris", rightAscensionHours: 13.7923, declinationDegrees: 49.3133, apparentMagnitude: 1.86, colorIndex: -0.19, distanceLightYears: 104 }
];
