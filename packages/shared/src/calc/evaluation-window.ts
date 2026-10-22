const isoDate = /^(\d{4})-(\d{2})-(\d{2})$/;

/** End of a program window. The month count comes from the program row, not from a fixed rule. */
export function evaluationWindowEnd(
  preEvaluationDate: string | null,
  windowMonths: number,
): string | null {
  if (preEvaluationDate === null || !Number.isInteger(windowMonths) || windowMonths < 0) {
    return null;
  }
  const match = isoDate.exec(preEvaluationDate);
  const year = Number(match?.[1]);
  const month = Number(match?.[2]);
  const day = Number(match?.[3]);
  if (!match || !Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return null;
  }

  const end = new Date(Date.UTC(year, month - 1 + windowMonths, day));
  return end.toISOString().slice(0, 10);
}
