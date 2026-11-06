/** 1234567 -> "1.234.567" */
export function fmtNum(n: number): string {
  return Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/** 1234567 -> "1.234.567 ₫" */
export function fmtVnd(n: number): string {
  return `${fmtNum(n)} ₫`;
}

/** 2_500_000_000 -> "2,5 tỷ" ; 45_000_000 -> "45 tr" */
export function fmtShort(n: number): string {
  const a = Math.abs(n);
  const trim = (v: number) => (Math.round(v * 10) / 10).toString().replace('.', ',');
  if (a >= 1e9) return `${trim(n / 1e9)} tỷ`;
  if (a >= 1e6) return `${trim(n / 1e6)} tr`;
  if (a >= 1e3) return `${trim(n / 1e3)} k`;
  return String(Math.round(n));
}
