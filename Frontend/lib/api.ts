"use server";

import { promises as fs } from "fs";
import path from "path";
import {
  AudioFile,
  AudioGroup,
  AudioQuestion,
  DemographicsDataSurvey,
  NarratorAudioMap,
  UserData,
  VoiceRecognition,
} from "./types/survey";
// import axios, { AxiosError } from "axios";
// Define the base URL for the API
const API_URL = "http://localhost:8000";
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
const API_AUTH =
  process.env.NEXT_PUBLIC_API_AUTH ||
  "http://localhost:8000/api/v1/auth/device";

export async function createUser(): Promise<string> {
  // const randomIp = `192.168.${Math.floor(Math.random() * 256)}.${Math.floor(
  //   Math.random() * 256
  // )}`;
  // const randomMac = `00:0${Math.floor(Math.random() * 10)}:00:00:00:00`;

  try {
    const response = await fetch(API_AUTH, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("API returned error:", response.status, text);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    if (!data.access_token) {
      throw new Error("Missing access_token in response");
    }

    return data.access_token;
  } catch (error) {
    console.error("Error in createUser():", error);
    throw error;
  }
}

// // Check if user already exists based on IP/MAC
// export async function checkUserExists(): Promise<{ exists: boolean }> {
//   try {
//     // Get client IP address from the server
//     const response = await fetch(`${API_BASE_URL}/check-user-exists`, {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//       },
//     })

//     if (!response.ok) {
//       throw new Error(`API error: ${response.status}`)
//     }

//     return await response.json()
//   } catch (error) {
//     console.error("Error checking if user exists:", error)
//     // Default to false if there's an error to allow the user to continue
//     return { exists: false }
//   }
// }

// Save user demographic data
export async function saveUserData(
  access_token: string,
  data: DemographicsDataSurvey
): Promise<any> {
  try {
    const userData: UserData = {
      email: data.email,
      device_lable: data.device_lable,
      device_other_input:
        data.device_other_input == "" ? null : data.device_other_input,
      gender: data.gender,
      age: 0,
      education: data.education,
      media_experience: false, // Assuming media experience is always true
      media_role: data.media_role == "" ? null : data.media_role,
      media_other_input:
        data.media_other_input == "" ? null : data.media_other_input,
      speach_experience: false,
      speach_role: data.speach_role == "" ? null : data.speach_role,
      speach_other_role:
        data.speach_other_role == "" ? null : data.speach_other_role,
      synthetic_speach_experience: false,
      synthetic_speach_role:
        data.synthetic_speach_role == "" ? null : data.synthetic_speach_role,
      synthetic_speach_other_role:
        data.synthetic_speach_other_role == ""
          ? null
          : data.synthetic_speach_other_role,
    };

    // let user = {
    //   email: "string",
    //   device_lable: "namizni_računalnik_z ločenimi zvočniki",
    //   device_other_input: "string",
    //   gender: "moški",
    //   age: 0,
    //   education: "string",
    //   media_experience: true,
    //   media_role: "govorec, napovedovalec, voditelj, igralec",
    //   media_other_input: "string",
    //   speach_experience: true,
    //   speach_role: "novinar podkaster vplivnež",
    //   speach_other_role: "string",
    //   synthetic_speach_experience: true,
    //   synthetic_speach_role:
    //     "Pri produkciji avdio ali avdiovizualnih vsebin sem že kdaj uporabil sintetizirani govor",
    //   synthetic_speach_other_role: "string",
    // };

    console.log("Saving user data:", userData);
    // console.log("acces token", access_token)
    const response = await fetch(
      `${API_BASE_URL}/questions/register-question`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify(userData),
      }
    );

    if (!response.ok) {
      if (response.status === 403) {
        console.log("403 error: ", response.statusText);
      }
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error saving user data:", error);
    throw error;
  }
}

// Save user review of an audio file
export async function saveUserReview(
  userId: string,
  audioId: string,
  review: string
): Promise<any> {
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
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error saving review:", error);
    throw error;
  }
}

// Save user recognition of a narrator
export async function saveUserNarratorRecognition(
  access_token: string,
  narratorId: string,
  voiceRecognition: VoiceRecognition
): Promise<any> {
  try {
    const req = JSON.stringify({
      knows_narrator_lable: voiceRecognition.recognized,
      narrator_prediction:
        voiceRecognition.speakerName == ""
          ? null
          : voiceRecognition.speakerName,
      comment: voiceRecognition.comment == "" ? null : voiceRecognition.comment,
    });
    console.log(
      "Saving narrator recognition:",
      req,
      "for narratorId:",
      narratorId
    );
    const response = await fetch(
      `${API_BASE_URL}/questions/narrator-knowledge/${narratorId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify({
          knows_narrator_lable: voiceRecognition.recognized,
          narrator_prediction:
            voiceRecognition.speakerName == ""
              ? null
              : voiceRecognition.speakerName,
          comment:
            voiceRecognition.comment == "" ? null : voiceRecognition.comment,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error saving narrator recognition:", error);
    throw error;
  }
}

// Get user data
export async function getUserData(userId: string): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error getting user data:", error);
    throw error;
  }
}

// Get audio files
export async function getAudioFiles(): Promise<AudioGroup[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/audio`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const audioFiles: NarratorAudioMap = await response.json();

    const groupedAudio: { [key: string]: AudioQuestion[] } = {};

    for (const [narratorId, files] of Object.entries(audioFiles)) {
      groupedAudio[narratorId] = files.map((file, index) => ({
        id: file.id,
        audioUrl: API_URL + file.file_path,
        text: `Posnetek ${index + 1}`,
        played: false,
        answered: false,
        answer: "",
        isPlaying: false,
        progress: 0,
        narratorId: file.narrator_id,
        code: file.code,
      }));
    }
    // console.log("Grouped audio files:", groupedAudio);
    // Convert to array of audio groups
    const groups: AudioGroup[] = Object.keys(groupedAudio).map(
      (narratorId, index) => ({
        id: groupedAudio[narratorId][0].id,
        title: `Glas ${index + 1} od 4`,
        questions: groupedAudio[narratorId],
        completed: false,
        voiceRecognition: {
          recognized: "",
          speakerName: "",
          comment: "",
        },
      })
    );

    console.log("Audio groups:", groups);
    return groups;

    // if (!response.ok) {
    //   throw new Error(`API error: ${response.status}`)
    // }

    // return await response.json()
  } catch (error) {
    console.error("Error getting audio files:", error);
    throw error;
  }
}

export const getTestAudioFile = async () => {
  const response = await fetch(`${API_BASE_URL}/audio/test-filepath`);

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();

  const audioFilePath = data.file_path;
  return `${API_URL}${audioFilePath}`;
};

export const submitAudioReview = async (
  access_token: string,
  audio_id: string,
  review: string
): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/audio/review/${audio_id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
      body: JSON.stringify({
        review: review,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Request failed: ${response.status} - ${errorData.message}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error submitting audio review:", error);
    throw error;
  }
};

export const verifyCaptcha = async (token: string): Promise<boolean> => {
  const secretKey = "6LfiomsrAAAAAM3NejMevW9-ep9IO2N6snqTYv6x"; //process.env.RECAPTCHA_SECRET_KEY
  console.log("secretKey", secretKey);

  if (!secretKey) {
    throw new Error("RECAPTCHA_SECRET_KEY is not defined in env");
  }
  if (!token) {
    throw new Error("Captcha token is required");
  }

  try {
    const response = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `secret=${secretKey}&response=${token}`,
      }
    );

    const data = await response.json();

    if (!data.success) {
      console.error("Captcha verification failed:", data["error-codes"]);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error verifying captcha:", error);
    throw error;
  }
};
