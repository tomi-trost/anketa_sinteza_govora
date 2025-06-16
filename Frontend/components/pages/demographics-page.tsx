import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ProgressBar } from "@/components/shared/progress-bar"
import { DemographicsData } from "@/lib/types/survey"
import { isDemographicsComplete } from "@/lib/utils/utils"
import {
IconUser
} from "@tabler/icons-react";


interface DemographicsPageProps {
  progressPercentage: number
  demographics: DemographicsData
  onDemographicsChange: (field: keyof DemographicsData, value: string) => void
  onNext: () => void
  onBack: () => void
}

export function DemographicsPage({
  progressPercentage,
  demographics,
  onDemographicsChange,
  onNext,
  onBack,
}: DemographicsPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F3E7E9] to-[#E3EEFF] flex items-center justify-center p-4">
      <Card className="w-full max-w-5xl bg-white overflow-hidden">
        <ProgressBar percentage={progressPercentage} />
        <CardContent className="p-8">
          <div className="space-y-6">
            <div className=" pl-4">
              <h1 className="text-3xl font-bold text-gray-800 flex gap-2 items-center"><IconUser size={38}/>Osnovni podatki</h1>
            </div>

            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
              {/* Device Question - Changed to dropdown */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">S katero napravo poslušate?</Label>
                <Select
                  value={demographics.device}
                  onValueChange={(value) => onDemographicsChange("device", value)}
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
                <Label className="text-sm font-medium">Ali delate na področju zvoka/avdia?</Label>
                <RadioGroup
                  value={demographics.audioWork}
                  onValueChange={(value) => onDemographicsChange("audioWork", value)}
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
                      onValueChange={(value) => onDemographicsChange("audioWorkDetails", value)}
                      className="space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="announcer" id="work-announcer" />
                        <Label htmlFor="work-announcer" className="text-sm">
                          govorec, napovedovalec, voditelj
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="journalist" id="work-journalist" />
                        <Label htmlFor="work-journalist" className="text-sm">
                          novinar, podkaster, vplivnež
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="actor" id="work-actor" />
                        <Label htmlFor="work-actor" className="text-sm">
                          igralec, pripovedovalec, animator, improvizator, stand-up komik
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
                        <RadioGroupItem value="speech-therapist" id="work-speech-therapist" />
                        <Label htmlFor="work-speech-therapist" className="text-sm">
                          logoped, foniater
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="call-center" id="work-call-center" />
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
                            onChange={(e) => onDemographicsChange("audioWorkOther", e.target.value)}
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
                <Label className="text-sm font-medium">Ali delate na področju govora/jezika?</Label>
                <RadioGroup
                  value={demographics.languageWork}
                  onValueChange={(value) => onDemographicsChange("languageWork", value)}
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
                    <Label className="text-sm font-medium">Opišite svoje delo:</Label>
                    <Textarea
                      value={demographics.languageWorkDetails}
                      onChange={(e) => onDemographicsChange("languageWorkDetails", e.target.value)}
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
                  onValueChange={(value) => onDemographicsChange("gender", value)}
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
                  onValueChange={(value) => onDemographicsChange("education", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Izberite stopnjo izobrazbe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="primary">Osnovna šola</SelectItem>
                    <SelectItem value="secondary">Srednja šola</SelectItem>
                    <SelectItem value="bachelor">Univerzitetna izobrazba (1. stopnja)</SelectItem>
                    <SelectItem value="master">Magistrska izobrazba (2. stopnja)</SelectItem>
                    <SelectItem value="phd">Doktorska izobrazba (3. stopnja)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Synthetic Speech Familiarity - Updated with specific options */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Ali ste seznanjeni s sintetiziranim govorom?</Label>
                <RadioGroup
                  value={demographics.syntheticSpeechFamiliarity}
                  onValueChange={(value) => onDemographicsChange("syntheticSpeechFamiliarity", value)}
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
                    <Label className="text-sm font-medium">Kakšne izkušnje imate s sintetiziranim govorom?</Label>
                    <RadioGroup
                      value={demographics.syntheticSpeechExperience}
                      onValueChange={(value) => onDemographicsChange("syntheticSpeechExperience", value)}
                      className="space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="used-once" id="synth-used-once" />
                        <Label htmlFor="synth-used-once" className="text-sm">
                          Pri produkciji avdio ali avdiovizualnih vsebin sem že kdaj uporabil sintetizirani govor.
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="use-regularly" id="synth-use-regularly" />
                        <Label htmlFor="synth-use-regularly" className="text-sm">
                          Pri produkciji avdio ali avdiovizualnih vsebin redno uporabljam sintetizirani govor.
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="development" id="synth-development" />
                        <Label htmlFor="synth-development" className="text-sm">
                          Sodeloval sem pri razvoju sintetizatorjev govora.
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="listen-regularly" id="synth-listen-regularly" />
                        <Label htmlFor="synth-listen-regularly" className="text-sm">
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
                            onChange={(e) => onDemographicsChange("syntheticSpeechExperienceOther", e.target.value)}
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

            {/* <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={onBack}
                className="text-black border-black hover:bg-gray-100"
              >
                NAZAJ
              </Button>

              <Button
                onClick={onNext}
                disabled={!isDemographicsComplete(demographics)}
                className="bg-black text-white hover:bg-gray-800"
              >
                NADALJUJ
              </Button>
            </div> */}
            <div className="flex justify-between pt-6 w-full">
                          <Button
                            variant="outline"
                            onClick={onBack}
                            className="text-black border-gray-200 hover:bg-gray-100 w-36"
                          >
                            NAZAJ
                          </Button>
            
                          <Button
                           onClick={onNext}
                disabled={!isDemographicsComplete(demographics)}
                            className="bg-gray-900 text-white hover:bg-gray-800 w-36"
                          >
                            NADALJUJ
                          </Button>
                        </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
