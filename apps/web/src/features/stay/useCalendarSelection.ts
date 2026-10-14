import { hasBlockedNight, nightsBetween } from "@deskaway/shared";
import { useState } from "react";
import { dayLabel, formatDay } from "./calendar";
import { useStayParams } from "./useStayParams";

export function nightsText(nights: number): string {
  return nights === 1 ? "1 night" : `${String(nights)} nights`;
}

export interface DayState {
  selectable: boolean;
  label: string;
}

// The check-in/check-out picks, written to the URL once both are chosen, plus
// the status text that announces each pick.
export function useCalendarSelection(today: string, blockedList: string[]) {
  const {
    checkIn: urlCheckIn,
    checkOut: urlCheckOut,
    setDates,
  } = useStayParams();

  // A check-in picked in the calendar but no check-out yet. The URL only ever
  // holds a full range.
  const [pending, setPending] = useState<string>();
  const checkIn = pending ?? urlCheckIn;
  const checkOut = pending === undefined ? urlCheckOut : undefined;
  const [announcement, setAnnouncement] = useState("");

  const blocked = new Set(blockedList);

  function dayState(day: string): DayState {
    let selectable: boolean;
    let status: string;
    if (day < today) {
      selectable = false;
      status = "unavailable";
    } else if (checkIn && !checkOut && day > checkIn) {
      // Picking check-out: every night up to this day must be free.
      selectable = !hasBlockedNight(blockedList, checkIn, day);
      status = selectable ? "available for check-out" : "unavailable";
    } else {
      selectable = !blocked.has(day);
      status = selectable ? "available" : "unavailable";
    }

    let role = "";
    if (day === checkIn) role = "selected as check-in";
    else if (day === checkOut) role = "selected as check-out";
    else if (checkIn && checkOut && day > checkIn && day < checkOut) {
      role = "in your stay";
    }
    return {
      selectable,
      label: dayLabel(day, role ? `${status}, ${role}` : status),
    };
  }

  // Returns false when the day can't be picked, so nothing changed.
  function pick(day: string): boolean {
    if (!dayState(day).selectable) return false;
    if (checkIn && !checkOut && day > checkIn) {
      setPending(undefined);
      setDates({ checkIn, checkOut: day });
      setAnnouncement(
        `Check-out ${formatDay(day)} selected. ${nightsText(nightsBetween(checkIn, day))}.`,
      );
    } else {
      setPending(day);
      if (urlCheckIn) setDates(undefined);
      setAnnouncement(
        `Check-in ${formatDay(day)} selected. Now choose your check-out date.`,
      );
    }
    return true;
  }

  function clearDates() {
    setPending(undefined);
    setDates(undefined);
    setAnnouncement("Dates cleared.");
  }

  return { checkIn, checkOut, dayState, pick, clearDates, announcement };
}
