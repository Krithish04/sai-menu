/**
 * Time utility for Asia/Kolkata (IST) availability checks
 */

export interface AvailabilityStatus {
  hasRestriction: boolean;
  isAvailable: boolean;
  badgeTextEn: string;
  badgeTextGu: string;
}

export function checkAvailability(
  availability?: { from: string; to: string }
): AvailabilityStatus {
  if (!availability) {
    return {
      hasRestriction: false,
      isAvailable: true,
      badgeTextEn: "",
      badgeTextGu: "",
    };
  }

  try {
    // Current time in Asia/Kolkata
    const formatter = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const parts = formatter.formatToParts(new Date());
    const hourPart = parts.find((p) => p.type === "hour")?.value ?? "00";
    const minutePart = parts.find((p) => p.type === "minute")?.value ?? "00";

    const currentMinutes = parseInt(hourPart, 10) * 60 + parseInt(minutePart, 10);

    const [fromH, fromM] = availability.from.split(":").map(Number);
    const [toH, toM] = availability.to.split(":").map(Number);

    const fromMinutes = fromH * 60 + (fromM || 0);
    const toMinutes = toH * 60 + (toM || 0);

    const isAvailable = currentMinutes >= fromMinutes && currentMinutes <= toMinutes;

    if (isAvailable) {
      return {
        hasRestriction: true,
        isAvailable: true,
        badgeTextEn: "1:00 pm – 11:00 pm",
        badgeTextGu: "બપોરે ૧:૦૦ થી રાત્રે ૧૧:૦૦",
      };
    } else {
      return {
        hasRestriction: true,
        isAvailable: false,
        badgeTextEn: "Available from 1:00 pm",
        badgeTextGu: "બપોરે ૧:૦૦ થી ઉપલબ્ધ",
      };
    }
  } catch (err) {
    // Graceful fallback
    return {
      hasRestriction: true,
      isAvailable: true,
      badgeTextEn: "1:00 pm – 11:00 pm",
      badgeTextGu: "બપોરે ૧:૦૦ થી રાત્રે ૧૧:૦૦",
    };
  }
}
