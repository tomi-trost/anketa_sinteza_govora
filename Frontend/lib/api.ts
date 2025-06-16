"use server";


import { promises as fs } from 'fs';
import path from "path"
// Define the base URL for the API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

// Interface for user data
interface UserData {
  device: string
  gender: string
  education: string
  audioWork: string
  audioWorkDetails?: string
  audioWorkOther?: string
  languageWork: string
  languageWorkDetails?: string
  syntheticSpeechFamiliarity: string
  syntheticSpeechExperience?: string
  syntheticSpeechExperienceOther?: string
}

// Interface for audio file data
interface AudioFile {
  id: string
  type: string
  narrator: string
  code: string
  file_path: string
}

// Check if user already exists based on IP/MAC
export async function checkUserExists(): Promise<{ exists: boolean }> {
  try {
    // Get client IP address from the server
    const response = await fetch(`${API_BASE_URL}/check-user-exists`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error checking if user exists:", error)
    // Default to false if there's an error to allow the user to continue
    return { exists: false }
  }
}

// Save user demographic data
export async function saveUserData(userId: string, data: UserData): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        device_lable: data.device,
        device_other_input: data.audioWorkOther || "",
        gender: data.gender,
        education: data.education,
        media_experience: data.audioWork === "yes",
        media_role: data.audioWorkDetails || "",
        media_other_input: data.audioWorkOther || "",
        speach_experience: data.languageWork === "yes",
        speach_role: data.languageWorkDetails || "",
        synthetic_speach_experience: data.syntheticSpeechFamiliarity === "yes",
        synthetic_speach_role: data.syntheticSpeechExperience || "",
        synthetic_speach_other_role: data.syntheticSpeechExperienceOther || "",
      }),
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error saving user data:", error)
    throw error
  }
}

// Save user review of an audio file
export async function saveUserReview(userId: string, audioId: string, review: string): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: userId,
        audio_id: audioId,
        review: review,
      }),
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error saving review:", error)
    throw error
  }
}

// Save user recognition of a narrator
export async function saveUserNarratorRecognition(
  userId: string,
  narratorId: string,
  knowsNarrator: string,
  narratorPrediction: string,
): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/narrator-recognition`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: userId,
        narrator_id: narratorId,
        knows_narrator_lable: knowsNarrator,
        narrator_prediction: narratorPrediction,
      }),
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error saving narrator recognition:", error)
    throw error
  }
}

// Get user data
export async function getUserData(userId: string): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`)

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error getting user data:", error)
    throw error
  }
}

// Get audio files
export async function getAudioFiles(): Promise<AudioFile[]> {
  try {
    // const response = await fetch(`${API_BASE_URL}/audio-files`)
    // for now read file paths from local folder
    const audioFilesPath = "audio_files";
    const files = await fs.readdir(audioFilesPath);
    const audioFiles = files.filter(file => 
      ['.mp3', '.wav', '.ogg'].includes(path.extname(file).toLowerCase())
    );

    var paths = audioFiles.map(file => `/audio_files/${file}`);
    paths = ["https://cdn.freesound.org/previews/749/749976_11667196-lq.mp3", ]
    const result: AudioFile[] = audioFiles.map((file, index) => ({
      id: `audio-${index}`,
      type: path.extname(file).toLowerCase().replace('.', ''), // e.g., 'mp3', 'wav', 'ogg'
      narrator: "Unknown",
      code: `audio-${index}`,
      file_path: paths[0],
    }));
    return result;

    // if (!response.ok) {
    //   throw new Error(`API error: ${response.status}`)
    // }

    // return await response.json()
  } catch (error) {
    console.error("Error getting audio files:", error)
    throw error
  }
}
