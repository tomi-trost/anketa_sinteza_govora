import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Volume2 } from "lucide-react";
import { ProgressBar } from "@/components/shared/progress-bar";
import {
  IconHeadphones,
  IconVolume,
  IconPlayerPlay,
  IconPlayerPause,
} from "@tabler/icons-react";

interface HearingTestPageProps {
  progressPercentage: number;
  canHearWell: boolean;
  isPlaying: boolean;
  onHearingChange: (checked: boolean) => void;
  onAudioPlay: () => void;
  onNext: () => void;
  onBack: () => void;
}

export function HearingTestPage({
  progressPercentage,
  canHearWell,
  isPlaying,
  onHearingChange,
  onAudioPlay,
  onNext,
  onBack,
}: HearingTestPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F3E7E9] to-[#E3EEFF] flex items-center justify-center p-4">
      <Card className="w-full max-w-5xl bg-white overflow-hidden">
        <ProgressBar percentage={progressPercentage} />
        <CardContent className="p-8 items-center">
          <div className="space-y-6 flex flex-col items-center pt-5">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-2">
                <IconHeadphones size={38} />
                Test Slišnosti
              </h1>
            </div>

            <p className="text-gray-600 text-center max-w-4xl">
              Kliknite gumb PREIZKUS SLIŠNOSTI. Posnetek govora morate slišati
              jasno, razločno in primerno naglas.
              <br />
              Posnetek poslušajte večkrat, dokler niste zadovoljni s slišnostjo.
            </p>
            <Card className="w-full max-w-xl overflow-hidden bg-blue-50 border-none">
              <div className="flex flex-col items-center justify-center py-8">
                <IconVolume className="w-16 h-16 text-gray-500 mb-6" />
                <p className="text-gray-600 mb-6 text-base">
                  Pritisnite gumb za predvajanje testnega zvoka
                </p>

                <Button
                  onClick={onAudioPlay}
                  className="bg-gray-900 text-white w-50"
                  disabled={isPlaying}
                >
                  {isPlaying ? (
                    <>
                      <IconPlayerPause size={24} />
                      <span>PREDVAJANJE</span>
                    </>
                  ) : (
                    <>
                      <IconPlayerPlay size={24} />
                      <span>PREIZKUS SLIŠNOSTI</span>
                    </>
                  )}
                </Button>
                <p className="text-gray-600 text-base mt-6 mb-0">
                  Testni zvok lahko predvajate večkrat
                </p>
              </div>
            </Card>
            <p className="text-sm text-gray-600 text-center">
              Če ne slišite, preverite jakost in druge zvočne nastavitve. Če
              posnetek prekinja, preverite spletno povezavo. Ko ste prepričani,
              da dobro slišite,{" "}
              <strong>odkljukajte kvadratek ob napisu DOBRO SLIŠIM</strong> ter
              kliknite gumb NADALJUJ.
            </p>

            <div className="flex items-center justify-end space-x-2 mt-4 w-full">
              <Checkbox
                id="hearing-check"
                checked={canHearWell}
                onCheckedChange={onHearingChange}
                className="border-black"
              />
              <label
                htmlFor="hearing-check"
                className=" font-medium cursor-pointer"
              >
                <strong> DOBRO SLIŠIM </strong>
              </label>
            </div>

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
                disabled={!canHearWell}
                className="bg-gray-900 text-white hover:bg-gray-800 w-36"
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
