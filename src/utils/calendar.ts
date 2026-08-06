/**
 * Calendar Utility for Ethiopian (E.C.) and Gregorian (G.C.) Calendar conversion & formatting
 */

export const ETHIOPIAN_MONTHS_EN = [
  'Meskerem', 'Tikimt', 'Hidar', 'Tahsas', 'Tir', 'Yakatit',
  'Megabit', 'Miyazya', 'Ginbot', 'Sene', 'Hamle', 'Nehase', 'Pagume'
];

export const ETHIOPIAN_MONTHS_OM = [
  'Fuulbaana', 'Onkololeessa', 'Sadaasa', 'Muddee', 'Amajjii', 'Gurraandhala',
  'Bitootessa', 'Eebila', 'Caamsaa', 'Waxabajjii', 'Adoolessa', 'Hagayya', 'Qaqumee'
];

export const ETHIOPIAN_MONTHS_AM = [
  'መስከረም', 'ጥቅምት', 'ኅዳር', 'ታኅሣሥ', 'ጥር', 'የካቲት',
  'መጋቢት', 'ሚያዝያ', 'ግንቦት', 'ሰኔ', 'ሐምሌ', 'ነሐሴ', 'ጳጉሜ'
];

/**
 * Approximate conversion from G.C. Date to E.C. representation string
 */
export function formatEthiopianDate(gcDateString: string, lang: 'en' | 'om' | 'am' = 'en'): string {
  try {
    const date = new Date(gcDateString);
    if (isNaN(date.getTime())) return gcDateString;

    const gcYear = date.getFullYear();
    const gcMonth = date.getMonth(); // 0-indexed
    const gcDay = date.getDate();

    // Ethiopian New Year starts Sept 11 (or Sept 12 in leap year)
    let ecYear = gcYear - 8;
    let ecMonthIndex = 0;
    let ecDay = 1;

    // Approximate calculation suitable for display
    const newYearDay = ((gcYear % 4 === 3) ? 12 : 11);
    
    if (gcMonth > 8 || (gcMonth === 8 && gcDay >= newYearDay)) {
      ecYear = gcYear - 7;
      if (gcMonth === 8) {
        ecMonthIndex = 0;
        ecDay = gcDay - newYearDay + 1;
      } else {
        const daysSinceSept11 = Math.floor((date.getTime() - new Date(gcYear, 8, newYearDay).getTime()) / (1000 * 60 * 60 * 24));
        ecMonthIndex = Math.floor(daysSinceSept11 / 30);
        ecDay = (daysSinceSept11 % 30) + 1;
      }
    } else {
      ecYear = gcYear - 8;
      const prevNewYear = (gcYear - 1 % 4 === 3) ? 12 : 11;
      const daysSincePrevNewYear = Math.floor((date.getTime() - new Date(gcYear - 1, 8, prevNewYear).getTime()) / (1000 * 60 * 60 * 24));
      ecMonthIndex = Math.min(12, Math.floor(daysSincePrevNewYear / 30));
      ecDay = (daysSincePrevNewYear % 30) + 1;
    }

    if (ecMonthIndex > 12) ecMonthIndex = 12;
    if (ecDay > 30 && ecMonthIndex !== 12) ecDay = 30;
    if (ecMonthIndex === 12 && ecDay > 6) ecDay = 5;

    let monthName = ETHIOPIAN_MONTHS_EN[ecMonthIndex] || 'Meskerem';
    if (lang === 'om') monthName = ETHIOPIAN_MONTHS_OM[ecMonthIndex] || monthName;
    if (lang === 'am') monthName = ETHIOPIAN_MONTHS_AM[ecMonthIndex] || monthName;

    return `${monthName} ${ecDay}, ${ecYear} E.C.`;
  } catch {
    return gcDateString;
  }
}

export function formatDateWithCalendar(gcDateString: string, calendar: 'GC' | 'EC', lang: 'en' | 'om' | 'am' = 'en'): string {
  if (calendar === 'EC') {
    return formatEthiopianDate(gcDateString, lang);
  }
  const date = new Date(gcDateString);
  if (isNaN(date.getTime())) return gcDateString;
  return date.toLocaleDateString(lang === 'am' ? 'am-ET' : lang === 'om' ? 'om-ET' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }) + ' G.C.';
}
