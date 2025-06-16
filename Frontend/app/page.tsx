"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Volume2, Play, Pause } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import {
  saveUserData,
  saveUserReview,
  getAudioFiles,
  checkUserExists,
} from "@/lib/api";

interface DemographicsData {
  device: string;
  gender: string;
  education: string;
  audioWork: string;
  audioWorkDetails: string;
  audioWorkOther: string;
  languageWork: string;
  languageWorkDetails: string;
  syntheticSpeechFamiliarity: string;
  syntheticSpeechExperience: string;
  syntheticSpeechExperienceOther: string;
}

interface AudioQuestion {
  id: string;
  audioUrl: string;
  text: string;
  played: boolean;
  answered: boolean;
  answer: string;
  isPlaying: boolean;
  progress: number;
  narratorId: string;
  code: string;
}

interface VoiceRecognition {
  recognized: string;
  speakerName: string;
  comment: string;
}

interface AudioGroup {
  id: number;
  title: string;
  questions: AudioQuestion[];
  completed: boolean;
  voiceRecognition: VoiceRecognition;
}

export default function SyntheticSpeechSurvey() {
  const router = useRouter();
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

  const isDemographicsComplete = () => {
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
      if (currentPage === 2 && isDemographicsComplete()) {
        // Save demographics data
        await saveUserData(userId, demographics);
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

  // Calculate progress percentage based on current page and audio groups
  const getProgressPercentage = () => {
    const totalPages = 3; // Instructions, hearing test, demographics
    const totalAudioGroups = audioGroups.length;

    if (currentPage < 3) {
      return ((currentPage + 1) / (totalPages + totalAudioGroups)) * 100;
    } else if (currentPage === 3) {
      return (
        ((totalPages + currentAudioGroupIndex + 1) /
          (totalPages + totalAudioGroups)) *
        100
      );
    } else {
      return 100;
    }
  };

  // Get answer display text
  const getAnswerDisplayText = (answer: string) => {
    switch (answer) {
      case "gotovo-sintetizirano":
        return "Gotovo sintetizirano";
      case "verjetno-sintetizirano":
        return "Verjetno sintetizirano";
      case "verjetno-naravno":
        return "Verjetno naravno";
      case "gotovo-naravno":
        return "Gotovo naravno";
      case "ne-vem":
        return "Ne vem";
      default:
        return "";
    }
  };

  const ProgressBar = () => (
    <div className="w-full h-3 bg-gray-200">
      <div
        className="h-full bg-blue-400 transition-all duration-500"
        style={{ width: `${getProgressPercentage()}%` }}
      ></div>
    </div>
  );

  // Already completed survey page
  const AlreadyCompletedPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-[#F3E7E9] to-[#E3EEFF] flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl bg-white overflow-hidden">
        <ProgressBar />
        <CardContent className="p-8">
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">
              Anketa že rešena
            </h1>
            <p className="text-gray-600">
              Izgleda, da ste to anketo že rešili. Vsak udeleženec lahko anketo
              reši samo enkrat.
            </p>
            <p className="text-gray-500 text-sm">
              Hvala za vaš interes in sodelovanje v naši raziskavi o
              razpoznavanju sintetiziranega govora.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const InstructionsPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-[#F3E7E9] to-[#E3EEFF] flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl bg-white overflow-hidden">
        <ProgressBar />
        <CardContent className="p-8">
          <div className="space-y-6">
            <div className="border-l-4 border-blue-400 pl-4">
              <h1 className="text-2xl font-bold text-gray-800">
                Raziskava o Razpoznavanju Sintetiziranega Govora
              </h1>
            </div>

            <div className="space-y-4 text-gray-700">
              <p>
                Dobrodošli v anketi o razpoznavanju naravnega in sintetiziranega
                govora v slovenščini.
                <br />
                Vaši odgovori, ki jih boste delali, je lahko sintetiziran ali
                naraven.
              </p>

              <div>
                <h2 className="font-bold">Navodila:</h2>
                <ol className="list-decimal pl-5 space-y-2 mt-2">
                  <li>
                    <strong>Pozorno poslušajte</strong> vsako posnetek le
                    enkrat. Zvoki so bodisi posneti, ali je sintetiziran ali
                    naraven.
                  </li>
                  <li>
                    <strong>Odgovorite na vprašanje</strong> za vsak zvok. Zvok
                    poslušate in označite vašo presojo.
                  </li>
                </ol>
              </div>

              <p className="text-sm">
                Vsakega posnetka se bo lahko predvajalo le enkrat (razen
                testnega zvoka na začetku). Ko odgovorite na vprašanje, ne
                spreminjajte več vašega odgovora, ker je vaš odziv pomemben za
                raziskavo. Če ne slišite posnetka dovolj dobro, ne odgovorite na
                vprašanje, saj je vaš prvi vtis najpomembnejši.
              </p>

              <div className="bg-blue-50 p-4 rounded-lg flex items-start gap-3">
                <div className="text-blue-500 mt-1">
                  <Volume2 size={20} />
                </div>
                <p className="text-blue-800 text-sm">
                  Pred začetkom: Najprej boste opravili kratek preizkus
                  slišnosti, da se prepričamo, da lahko jasno slišite posnetke.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-6">
              <Button
                onClick={handleNextPage}
                className="bg-black text-white hover:bg-gray-800"
              >
                ZAČNI
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const HearingTestPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-[#F3E7E9] to-[#E3EEFF] flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl bg-white overflow-hidden">
        <ProgressBar />
        <CardContent className="p-8">
          <div className="space-y-6">
            <div className="border-l-4 border-blue-400 pl-4">
              <h1 className="text-2xl font-bold text-gray-800">
                Test Slišnosti
              </h1>
            </div>

            <p className="text-gray-600">
              Anketa govora PREIZKUS SLIŠNOSTI: Preverite, prosim, če jasno
              slišite zvok, posebno če poslušate preko slušalk.
              <br />
              Poskusite poslušati večkrat, dokler niste zadovoljni z slišnostjo.
            </p>

            <div className="flex flex-col items-center justify-center py-8">
              <Volume2 className="w-16 h-16 text-gray-400 mb-6" />
              <p className="text-gray-600 mb-6">
                Pritisnite gumb za predvajanje testnega zvoka
              </p>

              <Button
                onClick={handleAudioPlay}
                variant="outline"
                className="border-black text-black hover:bg-gray-100"
                disabled={isPlaying}
              >
                {isPlaying ? "PREDVAJAM ELEMENT..." : "PREDVAJAJ ELEMENT"}
              </Button>
            </div>

            <p className="text-xs text-gray-500 text-center">
              Če ne slišite, preverite jakost in če imate zvočnike ali slušalke
              nastavljene na primerno glasnost. Če uporabljate računalnik,
              preverite, da nimate utišanih zvočnikov.
              <br />
              <strong>POMEMBNO:</strong> Ko boste poslušali prave posnetke, jih
              boste lahko poslušali <strong>SAMO ENKRAT</strong>, zato se
              prepričajte, da dobro slišite.
            </p>

            <div className="flex items-center justify-center space-x-2 mt-4">
              <Checkbox
                id="hearing-check"
                checked={canHearWell}
                onCheckedChange={(checked) =>
                  setCanHearWell(checked as boolean)
                }
                className="border-black"
              />
              <label
                htmlFor="hearing-check"
                className="text-sm font-medium cursor-pointer"
              >
                DOBRO SLIŠIM
              </label>
            </div>

            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(0)}
                className="text-black border-black hover:bg-gray-100"
              >
                NAZAJ
              </Button>

              <Button
                onClick={handleNextPage}
                disabled={!canHearWell}
                className="bg-black text-white hover:bg-gray-800"
              >
                NADALJUJ
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const DemographicsPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-[#F3E7E9] to-[#E3EEFF] flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl bg-white overflow-hidden">
        <ProgressBar />
        <CardContent className="p-8">
          <div className="space-y-6">
            <div className="border-l-4 border-blue-400 pl-4">
              <h1 className="text-2xl font-bold text-gray-800">
                Osnovni podatki
              </h1>
            </div>

            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
              {/* Device Question - Changed to dropdown */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  S katero napravo poslušate?
                </Label>
                <Select
                  value={demographics.device}
                  onValueChange={(value) =>
                    handleDemographicsChange("device", value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Izberite napravo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="computer">Računalnik</SelectItem>
                    <SelectItem value="tablet">Tablica</SelectItem>
                    <SelectItem value="phone">Telefon</SelectItem>
                    <SelectItem value="other">Drugo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Audio Work Question - Updated with specific options */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Ali delate na področju zvoka/avdia?
                </Label>
                <RadioGroup
                  value={demographics.audioWork}
                  onValueChange={(value) =>
                    handleDemographicsChange("audioWork", value)
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="audio-yes" />
                    <Label htmlFor="audio-yes">Da</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="audio-no" />
                    <Label htmlFor="audio-no">Ne</Label>
                  </div>
                </RadioGroup>

                {demographics.audioWork === "yes" && (
                  <div className="pl-6 pt-2 space-y-3">
                    <Label className="text-sm font-medium">
                      Kateri je vaš poklic, ki vključuje govor, glas ali jezik?
                    </Label>
                    <RadioGroup
                      value={demographics.audioWorkDetails}
                      onValueChange={(value) =>
                        handleDemographicsChange("audioWorkDetails", value)
                      }
                      className="space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="announcer" id="work-announcer" />
                        <Label htmlFor="work-announcer" className="text-sm">
                          govorec, napovedovalec, voditelj
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="journalist"
                          id="work-journalist"
                        />
                        <Label htmlFor="work-journalist" className="text-sm">
                          novinar, podkaster, vplivnež
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="actor" id="work-actor" />
                        <Label htmlFor="work-actor" className="text-sm">
                          igralec, pripovedovalec, animator, improvizator,
                          stand-up komik
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="coach" id="work-coach" />
                        <Label htmlFor="work-coach" className="text-sm">
                          trener govora ali javnega nastopanja
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="linguist" id="work-linguist" />
                        <Label htmlFor="work-linguist" className="text-sm">
                          lektor, slavist, prevajalec, tolmač
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="writer" id="work-writer" />
                        <Label htmlFor="work-writer" className="text-sm">
                          pisatelj, pesnik, esejist, publicist, kritik
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="teacher" id="work-teacher" />
                        <Label htmlFor="work-teacher" className="text-sm">
                          učitelj, predavatelj
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="singer" id="work-singer" />
                        <Label htmlFor="work-singer" className="text-sm">
                          pevec, zborovodja, učitelj petja
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="speech-therapist"
                          id="work-speech-therapist"
                        />
                        <Label
                          htmlFor="work-speech-therapist"
                          className="text-sm"
                        >
                          logoped, foniater
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="call-center"
                          id="work-call-center"
                        />
                        <Label htmlFor="work-call-center" className="text-sm">
                          delam v klicnem centru
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="other" id="work-other" />
                        <Label htmlFor="work-other" className="text-sm">
                          drugo (vpiši):
                        </Label>
                      </div>
                      {demographics.audioWorkDetails === "other" && (
                        <div className="pl-6">
                          <Input
                            value={demographics.audioWorkOther}
                            onChange={(e) =>
                              handleDemographicsChange(
                                "audioWorkOther",
                                e.target.value
                              )
                            }
                            placeholder="Vpišite vaš poklic"
                            className="mt-1"
                          />
                        </div>
                      )}
                    </RadioGroup>
                  </div>
                )}
              </div>

              {/* Language Work Question */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Ali delate na področju govora/jezika?
                </Label>
                <RadioGroup
                  value={demographics.languageWork}
                  onValueChange={(value) =>
                    handleDemographicsChange("languageWork", value)
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="lang-yes" />
                    <Label htmlFor="lang-yes">Da</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="lang-no" />
                    <Label htmlFor="lang-no">Ne</Label>
                  </div>
                </RadioGroup>

                {demographics.languageWork === "yes" && (
                  <div className="pl-6 pt-2">
                    <Label className="text-sm font-medium">
                      Opišite svoje delo:
                    </Label>
                    <Textarea
                      value={demographics.languageWorkDetails}
                      onChange={(e) =>
                        handleDemographicsChange(
                          "languageWorkDetails",
                          e.target.value
                        )
                      }
                      placeholder="Npr. učitelj slovenščine, logoped..."
                      className="mt-1"
                    />
                  </div>
                )}
              </div>

              {/* Gender Question */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Spol</Label>
                <RadioGroup
                  value={demographics.gender}
                  onValueChange={(value) =>
                    handleDemographicsChange("gender", value)
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="gender-male" />
                    <Label htmlFor="gender-male">Moški</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="gender-female" />
                    <Label htmlFor="gender-female">Ženska</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="gender-other" />
                    <Label htmlFor="gender-other">Drugo</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Education Question - Changed to dropdown */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Izobrazba</Label>
                <Select
                  value={demographics.education}
                  onValueChange={(value) =>
                    handleDemographicsChange("education", value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Izberite stopnjo izobrazbe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="primary">Osnovna šola</SelectItem>
                    <SelectItem value="secondary">Srednja šola</SelectItem>
                    <SelectItem value="bachelor">
                      Univerzitetna izobrazba (1. stopnja)
                    </SelectItem>
                    <SelectItem value="master">
                      Magistrska izobrazba (2. stopnja)
                    </SelectItem>
                    <SelectItem value="phd">
                      Doktorska izobrazba (3. stopnja)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Synthetic Speech Familiarity - Updated with specific options */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Ali ste seznanjeni s sintetiziranim govorom?
                </Label>
                <RadioGroup
                  value={demographics.syntheticSpeechFamiliarity}
                  onValueChange={(value) =>
                    handleDemographicsChange(
                      "syntheticSpeechFamiliarity",
                      value
                    )
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="synth-yes" />
                    <Label htmlFor="synth-yes">Da</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="synth-no" />
                    <Label htmlFor="synth-no">Ne</Label>
                  </div>
                </RadioGroup>

                {demographics.syntheticSpeechFamiliarity === "yes" && (
                  <div className="pl-6 pt-2 space-y-3">
                    <Label className="text-sm font-medium">
                      Kakšne izkušnje imate s sintetiziranim govorom?
                    </Label>
                    <RadioGroup
                      value={demographics.syntheticSpeechExperience}
                      onValueChange={(value) =>
                        handleDemographicsChange(
                          "syntheticSpeechExperience",
                          value
                        )
                      }
                      className="space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="used-once"
                          id="synth-used-once"
                        />
                        <Label htmlFor="synth-used-once" className="text-sm">
                          Pri produkciji avdio ali avdiovizualnih vsebin sem že
                          kdaj uporabil sintetizirani govor.
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="use-regularly"
                          id="synth-use-regularly"
                        />
                        <Label
                          htmlFor="synth-use-regularly"
                          className="text-sm"
                        >
                          Pri produkciji avdio ali avdiovizualnih vsebin redno
                          uporabljam sintetizirani govor.
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="development"
                          id="synth-development"
                        />
                        <Label htmlFor="synth-development" className="text-sm">
                          Sodeloval sem pri razvoju sintetizatorjev govora.
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="listen-regularly"
                          id="synth-listen-regularly"
                        />
                        <Label
                          htmlFor="synth-listen-regularly"
                          className="text-sm"
                        >
                          Redno poslušam sintetizirani govor.
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="other" id="synth-other" />
                        <Label htmlFor="synth-other" className="text-sm">
                          drugo (vpiši):
                        </Label>
                      </div>
                      {demographics.syntheticSpeechExperience === "other" && (
                        <div className="pl-6">
                          <Input
                            value={demographics.syntheticSpeechExperienceOther}
                            onChange={(e) =>
                              handleDemographicsChange(
                                "syntheticSpeechExperienceOther",
                                e.target.value
                              )
                            }
                            placeholder="Vpišite vaše izkušnje"
                            className="mt-1"
                          />
                        </div>
                      )}
                    </RadioGroup>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(1)}
                className="text-black border-black hover:bg-gray-100"
              >
                NAZAJ
              </Button>

              <Button
                onClick={handleNextPage}
                disabled={!isDemographicsComplete()}
                className="bg-black text-white hover:bg-gray-800"
              >
                NADALJUJ
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const SurveyPage = () => {
    if (isLoading || audioGroups.length === 0) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-[#F3E7E9] to-[#E3EEFF] flex items-center justify-center p-4">
          <Card className="w-full max-w-3xl bg-white overflow-hidden">
            <ProgressBar />
            <CardContent className="p-8 flex justify-center items-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p>Nalaganje zvočnih posnetkov...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    const currentGroup = audioGroups[currentAudioGroupIndex];
    const allQuestionsAnswered = currentGroup.questions.every(
      (q) => q.answered
    );

    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F3E7E9] to-[#E3EEFF] flex items-center justify-center p-4">
        <Card className="w-full max-w-3xl bg-white overflow-hidden">
          <ProgressBar />
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="border-l-4 border-blue-400 pl-4 flex items-center">
                <Volume2 className="mr-2" size={20} />
                <h1 className="text-2xl font-bold text-gray-800">
                  {currentGroup.title}
                </h1>
              </div>

              <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                {currentGroup.questions.map((question, index) => {
                  const canPlay =
                    index === 0 || currentGroup.questions[index - 1].answered;
                  const isActive = question.played && !question.answered;

                  return (
                    <div
                      key={question.id}
                      className={`border rounded-md overflow-hidden transition-all duration-300 ${
                        question.answered
                          ? "border-green-500 bg-green-50"
                          : canPlay
                          ? "border-gray-300 hover:border-gray-400"
                          : "border-gray-200 bg-gray-50"
                      }`}
                    >
                      {/* Audio Row */}
                      <div
                        className={`relative p-4 cursor-pointer transition-all duration-300 ${
                          !canPlay && !question.played ? "opacity-50" : ""
                        }`}
                        onClick={() =>
                          canPlay &&
                          !question.played &&
                          playAudio(currentAudioGroupIndex, question.id)
                        }
                        style={{
                          background: question.isPlaying
                            ? `linear-gradient(to right, rgba(219, 234, 254, 0.5) ${question.progress}%, transparent ${question.progress}%)`
                            : undefined,
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                question.answered
                                  ? "bg-green-500 text-white"
                                  : canPlay
                                  ? "bg-blue-500 text-white"
                                  : "bg-gray-400 text-white"
                              }`}
                            >
                              {question.answered ? (
                                <span className="text-xs">✓</span>
                              ) : question.isPlaying ? (
                                <Pause className="w-4 h-4" />
                              ) : (
                                <Play className="w-4 h-4" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-sm">
                                {question.text}
                              </p>
                              <p className="text-xs text-gray-500">
                                {question.answered
                                  ? "Odgovorjeno"
                                  : question.played
                                  ? "Poslušano - odgovorite na vprašanje"
                                  : canPlay
                                  ? "Kliknite za predvajanje"
                                  : "Najprej odgovorite na prejšnje vprašanje"}
                              </p>
                            </div>
                          </div>
                          {/* Display answer on the right side when answered */}
                          {question.answered && (
                            <div className="text-green-600 font-medium text-sm">
                              {getAnswerDisplayText(question.answer)}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Answer Options - Only show after audio finishes playing */}
                      {question.played &&
                        !question.isPlaying &&
                        !question.answered && (
                          <div className="border-t bg-gray-50 p-4 animate-in slide-in-from-top-2 duration-300">
                            <p className="font-medium text-sm mb-3">
                              Kako ocenjujete ta govor?
                            </p>
                            <RadioGroup
                              value={question.answer}
                              onValueChange={(value) =>
                                answerQuestion(
                                  currentAudioGroupIndex,
                                  question.id,
                                  value
                                )
                              }
                              className="space-y-2"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem
                                  value="gotovo-sintetizirano"
                                  id={`${question.id}-definitely-synthetic`}
                                />
                                <Label
                                  htmlFor={`${question.id}-definitely-synthetic`}
                                  className="text-sm cursor-pointer"
                                >
                                  Gotovo sintetizirano
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem
                                  value="verjetno-sintetizirano"
                                  id={`${question.id}-probably-synthetic`}
                                />
                                <Label
                                  htmlFor={`${question.id}-probably-synthetic`}
                                  className="text-sm cursor-pointer"
                                >
                                  Verjetno sintetizirano
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem
                                  value="verjetno-naravno"
                                  id={`${question.id}-probably-natural`}
                                />
                                <Label
                                  htmlFor={`${question.id}-probably-natural`}
                                  className="text-sm cursor-pointer"
                                >
                                  Verjetno naravno
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem
                                  value="gotovo-naravno"
                                  id={`${question.id}-definitely-natural`}
                                />
                                <Label
                                  htmlFor={`${question.id}-definitely-natural`}
                                  className="text-sm cursor-pointer"
                                >
                                  Gotovo naravno
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem
                                  value="ne-vem"
                                  id={`${question.id}-dont-know`}
                                />
                                <Label
                                  htmlFor={`${question.id}-dont-know`}
                                  className="text-sm cursor-pointer"
                                >
                                  Ne vem
                                </Label>
                              </div>
                            </RadioGroup>
                          </div>
                        )}
                    </div>
                  );
                })}

                {/* Additional questions after all audio questions are answered */}
                {allQuestionsAnswered && (
                  <div className="space-y-6 mt-8 border-t pt-6">
                    <div className="space-y-3">
                      <Label className="font-medium">
                        Ali ste prepoznali glas govorca na posnetku?
                      </Label>
                      <RadioGroup
                        value={currentGroup.voiceRecognition.recognized}
                        onValueChange={(value) =>
                          handleVoiceRecognitionChange("recognized", value)
                        }
                        className="space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="dont-know"
                            id="voice-dont-know"
                          />
                          <Label
                            htmlFor="voice-dont-know"
                            className="text-sm cursor-pointer"
                          >
                            Glasu ne poznam.
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="know-from-media"
                            id="voice-media"
                          />
                          <Label
                            htmlFor="voice-media"
                            className="text-sm cursor-pointer"
                          >
                            Glas govorca poznam iz medijev, ne vem pa, kdo je.
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="know-who"
                            id="voice-know-who"
                          />
                          <Label
                            htmlFor="voice-know-who"
                            className="text-sm cursor-pointer"
                          >
                            Govorca ne poznam osebno, vem pa, kdo je.
                          </Label>
                        </div>
                        {currentGroup.voiceRecognition.recognized ===
                          "know-who" && (
                          <div className="pl-6">
                            <Input
                              placeholder="Vpiši ime"
                              value={currentGroup.voiceRecognition.speakerName}
                              onChange={(e) =>
                                handleVoiceRecognitionChange(
                                  "speakerName",
                                  e.target.value
                                )
                              }
                              className="mt-1 w-full"
                            />
                          </div>
                        )}
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="know-personally"
                            id="voice-know-personally"
                          />
                          <Label
                            htmlFor="voice-know-personally"
                            className="text-sm cursor-pointer"
                          >
                            Govorca osebno poznam.
                          </Label>
                        </div>
                        {currentGroup.voiceRecognition.recognized ===
                          "know-personally" && (
                          <div className="pl-6">
                            <Input
                              placeholder="Vpiši ime"
                              value={currentGroup.voiceRecognition.speakerName}
                              onChange={(e) =>
                                handleVoiceRecognitionChange(
                                  "speakerName",
                                  e.target.value
                                )
                              }
                              className="mt-1 w-full"
                            />
                          </div>
                        )}
                      </RadioGroup>
                    </div>

                    <div className="space-y-3">
                      <Label className="font-medium">
                        Morebitni komentar po poslušanju:
                      </Label>
                      <Textarea
                        placeholder="Vpišite vaš komentar..."
                        value={currentGroup.voiceRecognition.comment}
                        onChange={(e) =>
                          handleVoiceRecognitionChange(
                            "comment",
                            e.target.value
                          )
                        }
                        className="w-full"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-6">
                <Button
                  onClick={handleNextPage}
                  disabled={
                    !allQuestionsAnswered ||
                    !currentGroup.voiceRecognition.recognized
                  }
                  className="bg-black text-white hover:bg-gray-800"
                >
                  NADALJUJ
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const ThankYouPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-[#F3E7E9] to-[#E3EEFF] flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl bg-white overflow-hidden">
        <ProgressBar />
        <CardContent className="p-8">
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">
              Hvala za sodelovanje!
            </h1>
            <p className="text-gray-600">
              Vaši odgovori so bili uspešno zabeleženi. Hvala, ker ste si vzeli
              čas za sodelovanje v naši raziskavi o razpoznavanju
              sintetiziranega govora.
            </p>
            <p className="text-gray-500 text-sm">
              Vaši podatki bodo uporabljeni izključno za namene raziskave in
              bodo obravnavani zaupno.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Determine which page to show
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F3E7E9] to-[#E3EEFF] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (alreadyCompleted) {
    return <AlreadyCompletedPage />;
  }

  const pages = [
    InstructionsPage,
    HearingTestPage,
    DemographicsPage,
    SurveyPage,
    ThankYouPage,
  ];
  const CurrentPageComponent = pages[currentPage];

  return <CurrentPageComponent />;
}
