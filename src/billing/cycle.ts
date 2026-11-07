export function remainingDays(dayOfCycle: number, cycleDays: number): number {
  if (!Number.isInteger(dayOfCycle) || !Number.isInteger(cycleDays) || cycleDays < 1) {
    throw new Error("cycle days must be a positive integer");
  }
  if (dayOfCycle < 1 || dayOfCycle > cycleDays) {
    throw new Error(`day ${dayOfCycle} is outside a ${cycleDays}-day cycle`);
  }
  return dayOfCycle;
}
