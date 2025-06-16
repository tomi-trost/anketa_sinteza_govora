"use client";

import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  saveUserData,
  saveUserReview,
  getAudioFiles,
  checkUserExists,
} from "@/lib/api";
import {
  AudioGroup,
  DemographicsData,
  AudioQuestion,
  VoiceRecognition,
} from "@/lib/types/survey";

export function useSurvey() {
  const [userId, setUserId] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(0);
  const [canHearWell, setCanHearWell] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [audioGroups, setAudioGroups] = useState<AudioGroup[]>([]);
  const [currentAudioGroupIndex, setCurrentAudioGroupIndex] = useState(0);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);

  const [demographics, setDemographics] = useState<DemographicsData>({
    device: "",
    gender: "",
    education: "",
    audioWork: "",
    audioWorkDetails: "",
    audioWorkOther: "",
    languageWork: "",
    languageWorkDetails: "",
    syntheticSpeechFamiliarity: "",
    syntheticSpeechExperience: "",
    syntheticSpeechExperienceOther: "",
  });

  // Initialize user session and load data
  useEffect(() => {
    const initializeSession = async () => {
      setIsLoading(true);

      try {
        // Check if user has already completed the survey based on IP/MAC
        const userExistsCheck = await checkUserExists();

        if (userExistsCheck.exists) {
          // User has already completed the survey
          setAlreadyCompleted(true);
          setIsLoading(false);
          return;
        }

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

        // Load audio files from API
        try {
          const audioFiles = await getAudioFiles();

          // Group audio files by narrator
          const groupedAudio: { [key: string]: AudioQuestion[] } = {};

          audioFiles.forEach((file) => {
            if (!groupedAudio[file.narrator]) {
              groupedAudio[file.narrator] = [];
            }

            groupedAudio[file.narrator].push({
              id: file.id,
              audioUrl: file.file_path,
              text: `Posnetek ${groupedAudio[file.narrator].length + 1}`,
              played: false,
              answered: false,
              answer: "",
              isPlaying: false,
              progress: 0,
              narratorId: file.narrator,
              code: file.code,
            });
          });

          // Convert to array of audio groups
          const groups: AudioGroup[] = Object.keys(groupedAudio).map(
            (narratorId, index) => ({
              id: index + 1,
              title: `Glas ${index + 1}`,
              questions: groupedAudio[narratorId],
              completed: false,
              voiceRecognition: {
                recognized: "",
                speakerName: "",
                comment: "",
              },
            })
          );

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

  const handleAudioPlay = () => {
    setIsPlaying(!isPlaying);
    setTimeout(() => setIsPlaying(false), 3000);
  };

  const handleDemographicsChange = (
    field: keyof DemographicsData,
    value: string
  ) => {
    setDemographics((prev) => ({ ...prev, [field]: value }));
  };

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
    setAudioGroups((prev) => {
      const newGroups = [...prev];
      newGroups[groupIndex].questions = newGroups[groupIndex].questions.map(
        (q) => (q.id === questionId ? { ...q, answer, answered: true } : q)
      );
      return newGroups;
    });

    // Save the answer to the API
    try {
      const question = audioGroups[groupIndex].questions.find(
        (q) => q.id === questionId
      );
      if (question) {
        await saveUserReview(userId, questionId, answer);
      }
    } catch (error) {
      console.error("Failed to save answer:", error);
    }
  };

  const handleNextPage = async () => {
    // Save data based on current page
    try {
      if (currentPage === 2 && isDemographicsComplete(demographics)) {
        // Save demographics data
        //await saveUserData(userId, demographics);
      }

      if (currentPage === 3) {
        // Save voice recognition data
        const currentGroup = audioGroups[currentAudioGroupIndex];
        if (currentGroup.completed) {
          await saveUserReview(
            userId,
            currentGroup.questions[0].narratorId,
            JSON.stringify(currentGroup.voiceRecognition)
          );
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

    // Actions
    setCurrentPage,
    setCanHearWell,
    handleAudioPlay,
    handleDemographicsChange,
    handleVoiceRecognitionChange,
    playAudio,
    answerQuestion,
    handleNextPage,
  };
}

function isDemographicsComplete(demographics: DemographicsData) {
  const required = [
    "device",
    "gender",
    "education",
    "audioWork",
    "languageWork",
    "syntheticSpeechFamiliarity",
  ];
  return required.every(
    (field) => demographics[field as keyof DemographicsData]
  );
}
