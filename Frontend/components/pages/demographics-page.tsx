import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProgressBar } from "@/components/shared/progress-bar";
import { DemographicsDataSurvey } from "@/lib/types/survey";
import { isDemographicsComplete } from "@/lib/utils/utils";
import { IconUser } from "@tabler/icons-react";

interface DemographicsPageProps {
  progressPercentage: number;
  demographics: DemographicsDataSurvey;
  onDemographicsChange: (
    field: keyof DemographicsDataSurvey,
    value: string
  ) => void;
  onNext: () => void;
  onBack: () => void;
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
      <Card className="sm:max-w-5xl 2xl:max-w-6xl bg-white overflow-hidden w-full">
        <ProgressBar percentage={progressPercentage} />
        <CardContent className="p-4 pt-6 sm:p-8">
          <div className="space-y-6">
            <div className="sm:border-l-4 sm:border-blue-400 sm:pl-4 w-full">
              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 flex gap-2 items-center">
                {/* <IconUser size={38} /> */}
                Osnovni podatki
              </h1>
            </div>

            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
              {/* Device Question - Changed to dropdown */}
              <div className="space-y-3 px-3">
                <Label className="text-sm font-medium">
                  S katero napravo poslušate?
                </Label>
                <Select
                  value={demographics.device_lable}
                  onValueChange={(value) =>
                    onDemographicsChange("device_lable", value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Izberite napravo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="namizni računalnik z ločenimi zvočniki">
                      namizni računalnik z ločenimi zvočniki
                    </SelectItem>
                    <SelectItem value="prenosni računalnik z vgrajenimi zvočniki">
                      prenosni računalnik z vgrajenimi zvočniki
                    </SelectItem>
                    <SelectItem value="tablica">tablica</SelectItem>
                    <SelectItem value="telefon">telefon</SelectItem>

                    <SelectItem value="prenosni bluetooth zvočnik">
                      prenosni bluetooth zvočnik
                    </SelectItem>
                    <SelectItem value="slušalke">slušalke</SelectItem>
                    <SelectItem value="visokokakovosten zvočni sistem">
                      visokokakovosten zvočni
                    </SelectItem>
                    <SelectItem value="drugo">drugo (vpiši):</SelectItem>
                  </SelectContent>
                </Select>
                {demographics.device_lable === "drugo" && (
                  <div className="pl-6 pt-2">
                    <Label className="text-sm font-medium">
                      Vpišite napravo:
                    </Label>
                    <Input
                      value={demographics.device_other_input}
                      onChange={(e) =>
                        onDemographicsChange(
                          "device_other_input",
                          e.target.value
                        )
                      }
                      placeholder=""
                      className="mt-1"
                    />
                  </div>
                )}
              </div>

              {/* Gender Question */}
              <div className="space-y-3 px-3">
                <Label className="text-sm font-medium">Spol</Label>
                <RadioGroup
                  value={demographics.gender}
                  onValueChange={(value) =>
                    onDemographicsChange("gender", value)
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="moški" id="gender-male" />
                    <Label htmlFor="gender-male">Moški</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ženski" id="gender-female" />
                    <Label htmlFor="gender-female">Ženska</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="ne želim se opredeliti"
                      id="gender-other"
                    />
                    <Label htmlFor="gender-other">Ne želim se opredeliti</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Education Question - Changed to dropdown */}
              <div className="space-y-3 px-3">
                <Label className="text-sm font-medium">Izobrazba</Label>
                <Select
                  value={demographics.education}
                  onValueChange={(value) =>
                    onDemographicsChange("education", value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Izberite stopnjo izobrazbe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="osnovnošolska">Osnovna šola</SelectItem>
                    <SelectItem value="srednješolska">Srednja šola</SelectItem>
                    <SelectItem value="višješolska">
                      Višješolska izobrazba
                    </SelectItem>
                    <SelectItem value="visokošolska (1. bolonjska stopnja)">
                      Visokošolska (1. bolonjska stopnja)
                    </SelectItem>
                    <SelectItem value="univerzitetna (2. bolonjska stopnja)">
                      Univerzitetna izobrazba (1. stopnja)
                    </SelectItem>
                    <SelectItem value="magisterij znanosti">
                      Magisterij znanosti
                    </SelectItem>
                    <SelectItem value="doktorat znanosti">
                      Doktorat znanosti
                    </SelectItem>
                    <SelectItem value="drugo">Drugo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Audio Work Question - Updated with specific options */}
              <div className="space-y-3 px-3">
                <Label className="text-sm font-medium">
                  Ali se poklicno ukvarjate z elektronskimi mediji, z avdio ali
                  avdiovizualno produkcijo?
                </Label>
                <RadioGroup
                  value={demographics.media_experience}
                  onValueChange={(value) =>
                    onDemographicsChange("media_experience", value)
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

                {demographics.media_experience === "yes" && (
                  <div className="pl-6 pt-2 space-y-3 px-3">
                    <Label className="text-sm font-medium">
                      Kakšna je vaša vloga v elektronskih medijih?
                    </Label>
                    <RadioGroup
                      value={demographics.media_role}
                      onValueChange={(value) =>
                        onDemographicsChange("media_role", value)
                      }
                      className="space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="govorec, napovedovalec, voditelj, igralec"
                          id="work-announcer"
                        />
                        <Label htmlFor="work-announcer" className="text-sm">
                          govorec, napovedovalec, voditelj, igralec
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="novinar, urednik, scenarist"
                          id="work-journalist"
                        />
                        <Label htmlFor="work-journalist" className="text-sm">
                          novinar, urednik, scenarist
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="podkaster, vplivnež, snovalec digitalni vsebin, digitalni marketingar"
                          id="work-actor"
                        />
                        <Label htmlFor="work-actor" className="text-sm">
                          podkaster, vplivnež, snovalec digitalnih vsebin,
                          digitalni marketingar
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="tonski mojster, snemalec zvoka"
                          id="work-coach"
                        />
                        <Label htmlFor="work-coach" className="text-sm">
                          tonski mojster, snemalec zvoka
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="snemalec slike, direktor fotografije, montažer"
                          id="work-linguist"
                        />
                        <Label htmlFor="work-linguist" className="text-sm">
                          snemalec slike, direktor fotografije, montažer
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="režiser, realizator, producent"
                          id="work-writer"
                        />
                        <Label htmlFor="work-writer" className="text-sm">
                          režiser, realizator, producent
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="glasbenik, glasbeni producent"
                          id="work-teacher"
                        />
                        <Label htmlFor="work-teacher" className="text-sm">
                          glasbenik, glasbeni producent
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="drugo" id="work-other" />
                        <Label htmlFor="drugo" className="text-sm">
                          drugo (vpiši):
                        </Label>
                      </div>
                      {demographics.media_role === "drugo" && (
                        <div className="pl-6">
                          <Input
                            value={demographics.media_other_input}
                            onChange={(e) =>
                              onDemographicsChange("media_other_input", e.target.value)
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
              <div className="space-y-3 px-3">
                <Label className="text-sm font-medium">
                  Ali se poklicno ukvarjate z govorom, z glasom ali z jezikom
                  oziroma jih pri delu izrazito uporabljate?
                </Label>
                <RadioGroup
                  value={demographics.speach_experience}
                  onValueChange={(value) =>
                    onDemographicsChange("speach_experience", value)
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

                {demographics.speach_experience === "yes" && (
                  <div className="pl-6 pt-2 space-y-3 px-3">
                    <Label className="text-sm font-medium">
                      Kateri je vaš poklic, ki vključuje govor, glas ali jezik?
                    </Label>
                    <RadioGroup
                      value={demographics.speach_role}
                      onValueChange={(value) =>
                        onDemographicsChange("speach_role", value)
                      }
                      className="space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="govorec, napovedovalec, voditelj"
                          id="work-announcer"
                        />
                        <Label htmlFor="work-announcer" className="text-sm">
                          govorec, napovedovalec, voditelj
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="novinar podkaster vplivnež"
                          id="work-journalist"
                        />
                        <Label htmlFor="work-journalist" className="text-sm">
                          novinar, podkaster, vplivnež
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="igralec, pripovedovalec, animator, improvizator, standup komik"
                          id="work-actor"
                        />
                        <Label htmlFor="work-actor" className="text-sm">
                          igralec, pripovedovalec, animator, improvizator,
                          stand-up komik
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="trener govora ali javnega nastopanja"
                          id="work-coach"
                        />
                        <Label htmlFor="work-coach" className="text-sm">
                          trener govora ali javnega nastopanja
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="lektor, slavist, prevajalec, tolmač"
                          id="work-linguist"
                        />
                        <Label htmlFor="work-linguist" className="text-sm">
                          lektor, slavist, prevajalec, tolmač
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="pisatelj, pesnik, esejist, publicist, kritik"
                          id="work-writer"
                        />
                        <Label htmlFor="work-writer" className="text-sm">
                          pisatelj, pesnik, esejist, publicist, kritik
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="učitelj, predavatelj"
                          id="work-teacher"
                        />
                        <Label htmlFor="work-teacher" className="text-sm">
                          učitelj, predavatelj
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="pevec, zborovodja, učitelj petja"
                          id="work-singer"
                        />
                        <Label htmlFor="work-singer" className="text-sm">
                          pevec, zborovodja, učitelj petja
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="logoped, foniater"
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
                          value="delam v klicnem centru"
                          id="work-call-center"
                        />
                        <Label htmlFor="work-call-center" className="text-sm">
                          delam v klicnem centru
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="drugo" id="work-other" />
                        <Label htmlFor="work-other" className="text-sm">
                          drugo (vpiši):
                        </Label>
                      </div>
                      {demographics.speach_role === "drugo" && (
                        <div className="pl-6">
                          <Input
                            value={demographics.speach_other_role}
                            onChange={(e) =>
                              onDemographicsChange(
                                "speach_other_role",
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
              {/* Synthetic Speech Familiarity - Updated with specific options */}
              <div className="space-y-3 px-3">
                <Label className="text-sm font-medium">
                  Ali imate izkušnje na področju sintetiziranega govora?
                </Label>
                <RadioGroup
                  value={demographics.synthetic_speach_experience}
                  onValueChange={(value) =>
                    onDemographicsChange("synthetic_speach_experience", value)
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

                {demographics.synthetic_speach_experience === "yes" && (
                  <div className="pl-6 pt-2 space-y-3 px-3">
                    <Label className="text-sm font-medium">
                      Kakšne izkušnje imate s sintetiziranim govorom?
                    </Label>
                    <RadioGroup
                      value={demographics.synthetic_speach_role}
                      onValueChange={(value) =>
                        onDemographicsChange("synthetic_speach_role", value)
                      }
                      className="space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="Pri produkciji avdio ali avdiovizualnih vsebin sem že kdaj uporabil sintetizirani govor"
                          id="synth-used-once"
                        />
                        <Label htmlFor="synth-used-once" className="text-sm">
                          Pri produkciji avdio ali avdiovizualnih vsebin sem že
                          kdaj uporabil sintetizirani govor.
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="Pri produkciji avdio ali avdiovizualnih vsebin redno uporabljam sintetizirani govor"
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
                          value="Sodeloval sem pri razvoju sintetizatorjev govora"
                          id="synth-development"
                        />
                        <Label htmlFor="synth-development" className="text-sm">
                          Sodeloval sem pri razvoju sintetizatorjev govora.
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="Redno poslušam sintetizirani govor"
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
                        <RadioGroupItem value="drugo" id="synth-other" />
                        <Label htmlFor="synth-other" className="text-sm">
                          drugo (vpiši):
                        </Label>
                      </div>
                      {demographics.synthetic_speach_role === "drugo" && (
                        <div className="pl-6 pb-6">
                          <Input
                            value={demographics.synthetic_speach_other_role}
                            onChange={(e) =>
                              onDemographicsChange(
                                "synthetic_speach_other_role",
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
            <div className="flex justify-between pt-2 w-full">
              <Button
                variant="outline"
                onClick={onBack}
                className="text-black border-gray-200 hover:bg-gray-100 sm:w-36"
              >
                NAZAJ
              </Button>

              <Button
                onClick={onNext}
                disabled={!isDemographicsComplete(demographics)}
                className="bg-gray-900 text-white hover:bg-gray-800 sm:w-36"
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
