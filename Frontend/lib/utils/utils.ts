
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export const getAnswerDisplayText = (answer: string) => {
  switch (answer) {
    case "gotovo-sintetizirano":
      return "Gotovo sintetizirano"
    case "verjetno-sintetizirano":
      return "Verjetno sintetizirano"
    case "verjetno-naravno":
      return "Verjetno naravno"
    case "gotovo-naravno":
      return "Gotovo naravno"
    case "ne-vem":
      return "Ne vem"
    default:
      return ""
  }
}

export const isDemographicsComplete = (demographics: any) => {
  const required = ["device", "gender", "education", "audioWork", "languageWork", "syntheticSpeechFamiliarity"]
  return required.every((field) => demographics[field])
}

export const getProgressPercentage = (currentPage: number, currentAudioGroupIndex: number, audioGroupsLength: number) => {
  const totalPages = 3 // Instructions, hearing test, demographics
  const totalAudioGroups = audioGroupsLength

  if (currentPage < 3) {
    return ((currentPage + 1) / (totalPages + totalAudioGroups)) * 100
  } else if (currentPage === 3) {
    return ((totalPages + currentAudioGroupIndex + 1) / (totalPages + totalAudioGroups)) * 100
  } else {
    return 100
  }
}



export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
