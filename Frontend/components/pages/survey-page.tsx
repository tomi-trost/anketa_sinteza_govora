import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Volume2, Play, Pause } from "lucide-react";
import { ProgressBar } from "@/components/shared/progress-bar";
import { getAnswerDisplayText } from "@/lib/utils/utils";
import { AudioGroup, VoiceRecognition } from "@/lib/types/survey";

interface SurveyPageProps {
  progressPercentage: number;
  isLoading: boolean;
  audioGroups: AudioGroup[];
  currentAudioGroupIndex: number;
  onPlayAudio: (groupIndex: number, questionId: string) => void;
  onAnswerQuestion: (
    groupIndex: number,
    questionId: string,
    answer: string
  ) => void;
  onVoiceRecognitionChange: (
    field: keyof VoiceRecognition,
    value: string
  ) => void;
  onNext: (narratorId: string, voiceRecognition: VoiceRecognition) => void;
}

export function SurveyPage({
  progressPercentage,
  isLoading,
  audioGroups,
  currentAudioGroupIndex,
  onPlayAudio,
  onAnswerQuestion,
  onVoiceRecognitionChange,
  onNext,
}: SurveyPageProps) {
  if (isLoading || audioGroups.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F3E7E9] to-[#E3EEFF] flex items-center justify-center p-4">
        <Card className="w-full max-w-3xl bg-white overflow-hidden">
          <ProgressBar percentage={progressPercentage} />
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
  const allQuestionsAnswered = currentGroup.questions.every((q) => q.answered);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F3E7E9] to-[#E3EEFF] flex items-center justify-center p-4">
      <Card className="sm:max-w-5xl 2xl:max-w-6xl bg-white overflow-hidden w-full">
        <ProgressBar percentage={progressPercentage} />
        <CardContent className="p-4 sm:p-8">
          <div className="space-y-6">
            <div className="border-l-4 border-blue-400 pl-4 flex items-center">
              {/* <Volume2 className="mr-2" size={20} /> */}
              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">
                {currentGroup.title}
              </h1>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 pb-2">
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
                        onPlayAudio(currentAudioGroupIndex, question.id)
                      }
                      style={{
                        background: question.isPlaying
                          ? `linear-gradient(to right, rgba(219, 234, 254, 0.5) ${question.progress}%, transparent ${question.progress}%)`
                          : undefined,
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 w-100">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
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
                          <div className="w-full">
                            <p className="font-medium">{question.text}</p>
                            <p className="text-sm text-gray-500">
                              {question.answered
                                ? ""
                                : question.played && !question.isPlaying
                                ? "Poslušano - odgovorite na vprašanje"
                                : question.isPlaying
                                ? "Predvajanje..."
                                : canPlay
                                ? "Kliknite za predvajanje"
                                : "Najprej odgovorite na prejšnje vprašanje"}
                            </p>
                          </div>
                        </div>
                        {/* Display answer on the right side when answered */}
                        {question.answered && (
                          <div className="text-green-600 font-medium text-sm text-right w-20 sm:w-40">
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
                          {/* <p className="font-medium text-sm mb-3">Kako ocenjujete ta govor?</p> */}
                          <RadioGroup
                            value={question.answer}
                            onValueChange={(value) =>
                              onAnswerQuestion(
                                currentAudioGroupIndex,
                                question.id,
                                value
                              )
                            }
                            // WRONG ID BEING PASED (question.id) -> should be audio id TODO
                            className="space-y-2"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem
                                value="gotovo sintetizirano"
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
                                value="verjetno sintetizirano"
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
                                value="verjetno naravno"
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
                                value="gotovo naravno"
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
                                value="ne vem"
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
              {
                // allQuestionsAnswered && (
                <div className="space-y-6 mt-8 border-t pt-6">
                  <div className="space-y-3">
                    <Label className="font-medium">
                      Ali ste prepoznali glas govorca na posnetku?
                    </Label>
                    <RadioGroup
                      value={currentGroup.voiceRecognition.recognized}
                      onValueChange={(value) =>
                        onVoiceRecognitionChange("recognized", value)
                      }
                      className="space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="Glasu ne poznam"
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
                          value="Glas govorca poznam iz medijev ne vem pa kdo je"
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
                          value="Govorca ne poznam osebno vem pa kdo je"
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
                        "Govorca ne poznam osebno vem pa kdo je" && (
                        <div className="pl-6">
                          <Input
                            placeholder="Vpiši ime"
                            value={currentGroup.voiceRecognition.speakerName}
                            onChange={(e) =>
                              onVoiceRecognitionChange(
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
                          value="Govorca osebno poznam"
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
                        "Govorca osebno poznam" && (
                        <div className="pl-6">
                          <Input
                            placeholder="Vpiši ime"
                            value={currentGroup.voiceRecognition.speakerName}
                            onChange={(e) =>
                              onVoiceRecognitionChange(
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

                  <div className="space-y-3 pl-1">
                    <Label className="font-medium">
                      Morebitni komentar po poslušanju:
                    </Label>
                    <Textarea
                      placeholder="Vpišite vaš komentar..."
                      value={currentGroup.voiceRecognition.comment}
                      onChange={(e) =>
                        onVoiceRecognitionChange("comment", e.target.value)
                      }
                      className="w-full"
                    />
                  </div>
                </div>
              }
            </div>

            <div className="flex justify-end pt-2">
              <Button
                onClick={() => onNext(currentGroup.questions[0].narratorId, currentGroup.voiceRecognition)}
                disabled={false} // !allQuestionsAnswered || !currentGroup.voiceRecognition.recognized}
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
}
