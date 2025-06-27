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
  onAudioPlay: () => Promise<void>;
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
      <Card className="sm:max-w-5xl 2xl:max-w-6xl bg-white overflow-hidden w-full">
        <ProgressBar percentage={progressPercentage} />
        <CardContent className="sm:p-8 p-4 pt-6 items-center">
          <div className="space-y-6 flex flex-col sm:pt-5 items-center">
            <div className="sm:border-l-4 sm:border-blue-400 sm:pl-4 w-full">
              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 flex items-center gap-2 text-start w-full">
                Test Slišnosti
              </h1>
            </div>

            <p className="text-gray-600 text-start w-full">
              Kliknite PREIZKUS SLIŠNOSTI. Posnetek govora morate slišati jasno,
              razločno in primerno naglas. Če ne slišite, preverite jakost in
              druge zvočne nastavitve. Če posnetek prekinja, preverite spletno
              povezavo.
              <br />
            </p>
            <Card className="w-full max-w-xl overflow-hidden items-center bg-blue-50 border-none">
              <div className="flex flex-col items-center justify-center py-8">
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
                <div className="flex items-center justify-center space-x-2 mt-4 w-full">
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
                <p className="text-gray-600 text-base mt-6 mb-0 p-2">
                  Testni zvok lahko predvajate večkrat
                </p>
              </div>
            </Card>
            <p className=" text-gray-600 text-start w-full sm:pt-2">
              Ko ste prepričani, da dobro slišite,{" "}
              <strong>odkljukajte DOBRO SLIŠIM ter kliknite NADALJUJ</strong>
            </p>

            <div className="flex justify-between sm:pt-6 w-full">
              <Button
                variant="outline"
                onClick={onBack}
                className="text-black border-gray-200 hover:bg-gray-100 sm:w-36"
              >
                NAZAJ
              </Button>

              <Button
                onClick={onNext}
                disabled={!canHearWell}
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
