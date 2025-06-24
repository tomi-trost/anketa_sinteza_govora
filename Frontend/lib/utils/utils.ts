import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { DemographicsDataSurvey } from "../types/survey";

export const getAnswerDisplayText = (answer: string) => {
  switch (answer) {
    case "gotovo sintetizirano":
      return "Gotovo sintetizirano";
    case "verjetno sintetizirano":
      return "Verjetno sintetizirano";
    case "verjetno naravno":
      return "Verjetno naravno";
    case "gotovo naravno":
      return "Gotovo naravno";
    case "ne vem":
      return "Ne vem";
    default:
      return "";
  }
};

export const isDemographicsComplete = (
  demographics: DemographicsDataSurvey
) => {
  const required: (keyof DemographicsDataSurvey)[] = [
    "device_lable",
    "gender",
    "education",
    "media_experience",
    "speach_experience",
    "synthetic_speach_experience",
  ];
  return required.every((field) => demographics[field]);
};

export const getProgressPercentage = (
  currentPage: number,
  currentAudioGroupIndex: number,
  audioGroupsLength: number
) => {
  const totalPages = 4; // Instructions, hearing test, demographics
  const totalAudioGroups = audioGroupsLength;

  if (currentPage === 0) {
    return 0;
  } else if (currentPage < 3) {
    return Math.round((currentPage / (totalPages + totalAudioGroups)) * 100);
  } else if (currentPage === 3) {
    return Math.round(
      ((totalPages + currentAudioGroupIndex) /
        (totalPages + totalAudioGroups)) *
        100
    );
  } else {
    return 100;
  }
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
