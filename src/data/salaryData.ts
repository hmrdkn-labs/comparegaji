export type Band =
  | 'Benchmark'
  | 'Low Band'
  | 'Middle Band'
  | 'High Band'
  | 'Top Band';

export interface SalaryEntry {
  country: string;
  band: Band;
  junior: number;
  middle: number;
  senior: number;
  juniorRatio: number;
  seniorRatio: number;
}

export const salaryData: SalaryEntry[] = [
  { country: 'Indonesia', band: 'Benchmark', junior: 4875, middle: 8625, senior: 18750, juniorRatio: 1.0, seniorRatio: 1.0 },
  { country: 'Egypt', band: 'Low Band', junior: 6500, middle: 8500, senior: 11500, juniorRatio: 1.3, seniorRatio: 0.6 },
  { country: 'India', band: 'Low Band', junior: 6600, middle: 12000, senior: 24000, juniorRatio: 1.4, seniorRatio: 1.3 },
  { country: 'Philippines', band: 'Middle Band', junior: 7650, middle: 11700, senior: 19500, juniorRatio: 1.6, seniorRatio: 1.0 },
  { country: 'Vietnam', band: 'Middle Band', junior: 10000, middle: 16250, senior: 25000, juniorRatio: 2.1, seniorRatio: 1.3 },
  { country: 'Malaysia', band: 'Middle Band', junior: 12200, middle: 21500, senior: 30000, juniorRatio: 2.5, seniorRatio: 1.6 },
  { country: 'Argentina', band: 'Middle Band', junior: 21000, middle: 34000, senior: 51000, juniorRatio: 4.3, seniorRatio: 2.7 },
  { country: 'Japan', band: 'Middle Band', junior: 22600, middle: 52250, senior: 63900, juniorRatio: 4.6, seniorRatio: 3.4 },
  { country: 'Brazil', band: 'Middle Band', junior: 23700, middle: 34500, senior: 45450, juniorRatio: 4.9, seniorRatio: 2.4 },
  { country: 'Mexico', band: 'Middle Band', junior: 24000, middle: 42000, senior: 57000, juniorRatio: 4.9, seniorRatio: 3.0 },
  { country: 'Spain', band: 'Middle Band', junior: 30000, middle: 37500, senior: 48150, juniorRatio: 6.2, seniorRatio: 2.6 },
  { country: 'Czech Rep.', band: 'Middle Band', junior: 30000, middle: 36400, senior: 52000, juniorRatio: 6.2, seniorRatio: 2.8 },
  { country: 'Poland', band: 'Middle Band', junior: 30000, middle: 49000, senior: 58200, juniorRatio: 6.2, seniorRatio: 3.1 },
  { country: 'Taiwan', band: 'High Band', junior: 39000, middle: 56000, senior: 73000, juniorRatio: 8.0, seniorRatio: 3.9 },
  { country: 'South Korea', band: 'High Band', junior: 42900, middle: 56800, senior: 87500, juniorRatio: 8.8, seniorRatio: 4.7 },
  { country: 'Germany', band: 'High Band', junior: 52000, middle: 69500, senior: 91000, juniorRatio: 10.7, seniorRatio: 4.9 },
  { country: 'Australia', band: 'High Band', junior: 52250, middle: 71750, senior: 98000, juniorRatio: 10.7, seniorRatio: 5.2 },
  { country: 'France', band: 'High Band', junior: 54100, middle: 75200, senior: 96300, juniorRatio: 11.1, seniorRatio: 5.1 },
  { country: 'Canada', band: 'High Band', junior: 59850, middle: 64250, senior: 67150, juniorRatio: 12.3, seniorRatio: 3.6 },
  { country: 'United Kingdom', band: 'High Band', junior: 62000, middle: 67000, senior: 76000, juniorRatio: 12.7, seniorRatio: 4.1 },
  { country: 'Netherlands', band: 'High Band', junior: 62400, middle: 64200, senior: 110750, juniorRatio: 12.8, seniorRatio: 5.9 },
  { country: 'Ireland', band: 'High Band', junior: 64850, middle: 69550, senior: 115100, juniorRatio: 13.3, seniorRatio: 6.1 },
  { country: 'Singapore', band: 'Top Band', junior: 39250, middle: 83600, senior: 125400, juniorRatio: 8.0, seniorRatio: 6.7 },
  { country: 'Switzerland', band: 'Top Band', junior: 94500, middle: 97150, senior: 109800, juniorRatio: 19.4, seniorRatio: 5.9 },
  { country: 'United States', band: 'Top Band', junior: 105000, middle: 119000, senior: 127000, juniorRatio: 21.5, seniorRatio: 6.8 }
];
