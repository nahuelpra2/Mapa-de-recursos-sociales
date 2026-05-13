import type { Resource } from "../types/resource";

type ResourceMaintenance = Resource["maintenance"];

export type ResourceMaintenanceReviewDisplay = {
  label: string;
  detail: string;
  requiresReview: boolean;
};

export function getResourceMaintenanceReviewDisplay(
  maintenance: ResourceMaintenance,
  today = new Date()
): ResourceMaintenanceReviewDisplay {
  const reviewDate = parseIsoCalendarDate(maintenance.reviewBy);

  if (!reviewDate) {
    return {
      label: "Revisar datos",
      detail: "Fecha de revision invalida. La informacion puede estar desactualizada.",
      requiresReview: true
    };
  }

  const todayDate = toLocalCalendarDate(today);
  const requiresReview = compareCalendarDates(reviewDate, todayDate) < 0;

  if (requiresReview) {
    return {
      label: "Revisar datos",
      detail: `Revision vencida el ${maintenance.reviewBy}. La informacion puede estar desactualizada.`,
      requiresReview: true
    };
  }

  return {
    label: "Revision vigente",
    detail: `Revisar antes de ${maintenance.reviewBy}`,
    requiresReview: false
  };
}

type CalendarDate = {
  year: number;
  month: number;
  day: number;
};

function parseIsoCalendarDate(value: string): CalendarDate | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const [, yearValue, monthValue, dayValue] = match;
  const year = Number(yearValue);
  const month = Number(monthValue);
  const day = Number(dayValue);
  const parsedDate = new Date(year, month - 1, day);

  if (
    parsedDate.getFullYear() !== year ||
    parsedDate.getMonth() !== month - 1 ||
    parsedDate.getDate() !== day
  ) {
    return null;
  }

  return { year, month, day };
}

function toLocalCalendarDate(date: Date): CalendarDate {
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate()
  };
}

function compareCalendarDates(left: CalendarDate, right: CalendarDate): number {
  if (left.year !== right.year) return left.year - right.year;
  if (left.month !== right.month) return left.month - right.month;

  return left.day - right.day;
}
