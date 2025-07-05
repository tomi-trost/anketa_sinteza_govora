"use client";

import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  saveUserData,
  getAudioFiles,
  createUser,
  submitAudioReview,
  saveUserNarratorRecognition,
  verifyCaptcha,
  getTestAudioFile,
  submitEmail,
} from "@/lib/api";
import {
  AudioGroup,
  DemographicsDataSurvey,
  VoiceRecognition,
} from "@/lib/types/survey";
import { isDemographicsComplete } from "@/lib/utils/utils";
import debounce from "lodash/debounce";
import { useMemo } from "react";

export function useSurvey() {
  const [userId, setUserId] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(0);
  const [canHearWell, setCanHearWell] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [audioGroups, setAudioGroups] = useState<AudioGroup[]>([]);
  const [testAudio, setTestAudio] = useState<string | null>(null);
  const [currentAudioGroupIndex, setCurrentAudioGroupIndex] = useState(0);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);
  const [mailSubmitted, setMailIsSubmitted] = useState(false);

  const [demographics, setDemographics] = useState<DemographicsDataSurvey>({
    device_lable: "",
    device_other_input: "",
    gender: "",
    education: "",
    media_experience: "",
    media_role: "",
    media_other_input: "",
    speach_experience: "",
    speach_role: "",
    speach_other_role: "",
    synthetic_speach_experience: "",
    synthetic_speach_role: "",
    synthetic_speach_other_role: "",
    email: "",
    age: 0,
  });

  // Initialize user session and load data
  useEffect(() => {
    const initializeSession = async () => {
      setIsLoading(true);

      try {
        // Check for existing user ID in localStorage
        let userIdFromStorage = localStorage.getItem("survey_user_id");

        if (!userIdFromStorage) {
          // Create new user ID if none exists
          userIdFromStorage = uuidv4();
          localStorage.setItem("survey_user_id", userIdFromStorage);
        }

        setUserId(userIdFromStorage);

        // Try to load saved state
        const savedState = localStorage.getItem("survey_state");
        if (savedState) {
          const state = JSON.parse(savedState);
          setCurrentPage(state.currentPage);
          setCanHearWell(state.canHearWell);
          setDemographics(state.demographics);

          if (state.currentPage >= 3) {
            // If user was already in the survey, prevent going back
            if (state.currentAudioGroupIndex !== undefined) {
              setCurrentAudioGroupIndex(state.currentAudioGroupIndex);
            }
          }
        }

        // check if mail was already submitted
        const savedEmail = localStorage.getItem("survey_email");
        if (savedEmail) {
          setMailIsSubmitted(true);
          // setDemographics((prev) => ({ ...prev, email: savedEmail }));
        }

        // Load audio files from API
        try {
          const groups: AudioGroup[] = await getAudioFiles();
          const testAudio = await getTestAudioFile();
          setTestAudio(testAudio);
          // Group audio files by narrator

          setAudioGroups(groups);

          // If we have saved audio state, restore it
          if (savedState) {
            const parsedState = JSON.parse(savedState);
            if (parsedState.audioGroups) {
              const savedGroups = parsedState.audioGroups;

              // Merge saved state with loaded audio files
              const mergedGroups = groups.map((group, index) => {
                if (savedGroups[index]) {
                  const savedGroup = savedGroups[index];

                  return {
                    ...group,
                    completed: savedGroup.completed,
                    voiceRecognition: savedGroup.voiceRecognition,
                    questions: group.questions.map((q, qIndex) => {
                      if (
                        savedGroup.questions[qIndex] &&
                        q.id === savedGroup.questions[qIndex].id
                      ) {
                        return {
                          ...q,
                          played: savedGroup.questions[qIndex].played,
                          answered: savedGroup.questions[qIndex].answered,
                          answer: savedGroup.questions[qIndex].answer,
                        };
                      }
                      return q;
                    }),
                  };
                }
                return group;
              });

              setAudioGroups(mergedGroups);

              let found = false;
              for (let i = 0; i < mergedGroups.length; i++) {
                const group = mergedGroups[i];
                for (let j = 0; j < group.questions.length; j++) {
                  const question = group.questions[j];
                  if (!question.answered) {
                    found = true;
                    break;
                  }
                }
                if (found) break;
              }
            }
          }
        } catch (error) {
          console.error("Failed to load audio files:", error);
        }
      } catch (error) {
        console.error("Error during initialization:", error);
      }

      setIsLoading(false);
    };

    initializeSession();
  }, []);

  const getCookie = (name: string): string | null => {
    const match = document.cookie.match(
      new RegExp("(^| )" + name + "=([^;]+)")
    );
    return match ? match[2] : null;
  };

  const checkUser = async () => {
    let savedToken = getCookie("access_token");

    if (!savedToken) {
      // If no access token, create a new user
      const accessToken = await createUser();
      if (accessToken) {
        savedToken = accessToken;
        // Set user ID from access token
        let user = accessToken.split(".")[0];
        setUserId(user); // TODO: change
        localStorage.setItem("survey_user_id", user);
        document.cookie = `access_token=${accessToken}; path=/; max-age=${
          60 * 60 * 24 * 60 // 2 months
        }; samesite=lax`;
      } else {
        console.error("Failed to create user");
      }
    } else {
      // If access token exists, extract user ID
      let user = savedToken.split(".")[0];
      setUserId(user); // TODO: change
      localStorage.setItem("survey_user_id", user);
    }

    return userId;
  };

  const saveUserDemographics = async () => {
    let savedToken = getCookie("access_token");

    if (!savedToken) {
      console.error("No access token found, cannot save demographics");
      return;
    }

    try {
      await saveUserData(savedToken, demographics);
      console.log("Demographics saved successfully");
    } catch (error) {
      console.error("Failed to save demographics:", error);
    }
  };

  const saveAudioReview = async (audio_id: string, review: string) => {
    let savedToken = getCookie("access_token");

    if (!savedToken) {
      console.error("No access token found, cannot save demographics");
      return;
    }

    try {
      await submitAudioReview(savedToken, audio_id, review);
    } catch (error) {
      console.error("Failed to save audio review:", error);
    }
  };

  const saveNarratorKnowledge = async (
    narratorId: string,
    voiceRecognition: VoiceRecognition
  ) => {
    let savedToken = getCookie("access_token");

    if (!savedToken) {
      console.error("No access token found, cannot save narrator knowledge");
      return;
    }

    try {
      await saveUserNarratorRecognition(
        savedToken,
        narratorId,
        voiceRecognition
      );
      console.log("Narrator knowledge saved successfully");
    } catch (error) {
      console.error("Failed to save narrator knowledge:", error);
    }
  };

  const submitMail = async (email: string) => {
    let savedToken = getCookie("access_token");

    if (!savedToken) {
      console.error("No access token found, cannot submit email");
      return;
    }

    try {
      await submitEmail(savedToken, email);
      setMailIsSubmitted(true);
      debouncedHandleChange("email", email);
      localStorage.setItem("survey_email", email);
      console.log("Email submitted successfully");
    } catch (error) {
      console.error("Failed to submit email:", error);
    }
  };

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (userId) {
      const stateToSave = {
        currentPage,
        canHearWell,
        demographics,
        audioGroups,
        currentAudioGroupIndex,
      };

      localStorage.setItem("survey_state", JSON.stringify(stateToSave));
    }
  }, [
    userId,
    currentPage,
    canHearWell,
    demographics,
    audioGroups,
    currentAudioGroupIndex,
  ]);

  const handleTestAudioPlay = async () => {
    if (isPlaying) {
      return;
    }
    if (!testAudio) {
      const testAudio = await getTestAudioFile();
      setTestAudio(testAudio);
    }
    setIsPlaying(true);
    console.log("Playing test audio:", testAudio);
    const audioElement = new Audio(testAudio || "");
    audioElement.play().catch((error) => {
      console.error("Audio playback failed:", error);
      setIsPlaying(false);
    });
    audioElement.addEventListener("ended", () => {
      setIsPlaying(false);
    });
  };

  const handleDemographicsChange = (
    field: keyof DemographicsDataSurvey,
    value: string
  ) => {
    setDemographics((prev) => {
      const updated = { ...prev, [field]: value };

      // Clear the other input field if not selecting "drugo"
      if (value !== "drugo") {
        if (field === "media_role") {
          delete (updated as any).media_other_input;
        } else if (field === "speach_role") {
          delete (updated as any).speach_other_role;
        } else if (field === "synthetic_speach_role") {
          delete (updated as any).synthetic_speach_other_role;
        }
      }

      return updated;
    });
  };

  const debouncedHandleChange = useMemo(
    () =>
      debounce(
        (field: keyof DemographicsDataSurvey, value: string) =>
          handleDemographicsChange(field, value),
        200 // debounce delay in ms
      ),
    []
  );

  const handleVoiceRecognitionChange = (
    field: keyof VoiceRecognition,
    value: string
  ) => {
    setAudioGroups((prev) => {
      const newGroups = [...prev];
      newGroups[currentAudioGroupIndex] = {
        ...newGroups[currentAudioGroupIndex],
        voiceRecognition: {
          ...newGroups[currentAudioGroupIndex].voiceRecognition,
          [field]: value,
        },
      };
      return newGroups;
    });
  };

  const playAudio = (groupIndex: number, questionId: string) => {
    const questions = audioGroups[groupIndex].questions;
    const currentIndex = questions.findIndex((q) => q.id === questionId);
    const previousQuestionsAnswered = questions
      .slice(0, currentIndex)
      .every((q) => q.answered);

    if (!previousQuestionsAnswered) return;

    // Create audio element and play
    const audioElement = new Audio(
      questions.find((q) => q.id === questionId)?.audioUrl
    );

    // Update state to show playing
    setAudioGroups((prev) => {
      const newGroups = [...prev];
      newGroups[groupIndex].questions = questions.map((q) =>
        q.id === questionId
          ? { ...q, isPlaying: true, played: true }
          : { ...q, isPlaying: false }
      );
      return newGroups;
    });

    // Set up audio events
    audioElement.addEventListener("timeupdate", () => {
      const progress = (audioElement.currentTime / audioElement.duration) * 100;

      setAudioGroups((prev) => {
        const newGroups = [...prev];
        newGroups[groupIndex].questions = newGroups[groupIndex].questions.map(
          (q) => (q.id === questionId ? { ...q, progress } : q)
        );
        return newGroups;
      });
    });

    audioElement.addEventListener("ended", () => {
      setAudioGroups((prev) => {
        const newGroups = [...prev];
        newGroups[groupIndex].questions = newGroups[groupIndex].questions.map(
          (q) =>
            q.id === questionId ? { ...q, isPlaying: false, progress: 100 } : q
        );
        return newGroups;
      });
    });

    // Start playback
    audioElement.play().catch((error) => {
      console.error("Audio playback failed:", error);

      // Reset state if playback fails
      setAudioGroups((prev) => {
        const newGroups = [...prev];
        newGroups[groupIndex].questions = newGroups[groupIndex].questions.map(
          (q) =>
            q.id === questionId
              ? { ...q, isPlaying: false, played: false, progress: 0 }
              : q
        );
        return newGroups;
      });
    });
  };

  const answerQuestion = async (
    groupIndex: number,
    questionId: string,
    answer: string
  ) => {
    saveAudioReview(questionId, answer).then(() => {
      setAudioGroups((prev) => {
        const newGroups = [...prev];
        newGroups[groupIndex].questions = newGroups[groupIndex].questions.map(
          (q) => (q.id === questionId ? { ...q, answer, answered: true } : q)
        );
        return newGroups;
      });
    });
  };

  const handleNextPageSurvey = async (
    narratorId: string,
    voiceRecognition: VoiceRecognition
  ) => {
    saveNarratorKnowledge(narratorId, voiceRecognition).then(() => {
      handleNextPage();
    });
  };

  const handleNextPage = async () => {
    // Save data based on current page
    try {
      if (currentPage === 2 && isDemographicsComplete(demographics)) {
        // Save demographics data
        await saveUserDemographics();
      }

      if (currentPage === 3) {
        // Save voice recognition data
        const currentGroup = audioGroups[currentAudioGroupIndex];
        if (currentGroup.completed) {
          // await saveUserReview(
          //   userId,
          //   currentGroup.questions[0].narratorId,
          //   JSON.stringify(currentGroup.voiceRecognition)
          // );
        }
      }
    } catch (error) {
      console.error("Failed to save data:", error);
    }

    // Handle navigation
    if (currentPage === 3) {
      // Mark current audio group as completed
      setAudioGroups((prev) => {
        const newGroups = [...prev];
        newGroups[currentAudioGroupIndex] = {
          ...newGroups[currentAudioGroupIndex],
          completed: true,
        };
        return newGroups;
      });

      // Check if there are more audio groups
      if (currentAudioGroupIndex < audioGroups.length - 1) {
        setCurrentAudioGroupIndex(currentAudioGroupIndex + 1);
      } else {
        // Survey completed
        setCurrentPage(4); // Thank you page
      }
    } else {
      setCurrentPage(currentPage + 1);
    }
  };

  const submitCaptcha = async (token: string) => {
    return await verifyCaptcha(token);
  };

  return {
    // State
    userId,
    currentPage,
    canHearWell,
    isPlaying,
    isLoading,
    audioGroups,
    currentAudioGroupIndex,
    alreadyCompleted,
    demographics,
    mailSubmitted,

    // Actions
    checkUser,
    saveAudioReview,
    setCurrentPage,
    setCanHearWell,
    handleTestAudioPlay,
    debouncedHandleChange,
    handleVoiceRecognitionChange,
    playAudio,
    answerQuestion,
    handleNextPage,
    handleNextPageSurvey,
    submitCaptcha,
    submitMail,
  };
}
