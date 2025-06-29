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

  // Check if all basic required fields are filled
  const basicFieldsComplete = required.every((field) => {
    const value = demographics[field];
    return value !== undefined && value !== null && value !== "";
  });

  if (!basicFieldsComplete) {
    return false;
  }

  // Check conditional required fields
  const conditionalFields = [
    {
      condition: "media_experience",
      role: "media_role",
      otherField: "media_other_input",
    },
    {
      condition: "speach_experience",
      role: "speach_role",
      otherField: "speach_other_role",
    },
    {
      condition: "synthetic_speach_experience",
      role: "synthetic_speach_role",
      otherField: "synthetic_speach_other_role",
    },
  ];

  const conditionalFieldsComplete = conditionalFields.every(
    ({ condition, role, otherField }) => {
      const experienceValue =
        demographics[condition as keyof DemographicsDataSurvey];

      // If the experience field is "yes", then the corresponding role field must be filled
      if (experienceValue === "yes") {
        const roleValue = demographics[role as keyof DemographicsDataSurvey];

        // Role field must be selected
        if (!roleValue || roleValue === "") {
          return false;
        }

        // If role is "drugo" (other), the corresponding other input field must be filled
        if (roleValue === "drugo") {
          const otherValue =
            demographics[otherField as keyof DemographicsDataSurvey];
          return (
            otherValue !== undefined &&
            otherValue !== null &&
            otherValue !== "" &&
            String(otherValue).trim() !== ""
          );
        }

        return true;
      }

      // If experience is not "yes", role field is not required
      return true;
    }
  );

  return conditionalFieldsComplete;
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
