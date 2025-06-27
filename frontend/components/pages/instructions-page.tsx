import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Volume2 } from "lucide-react";
import { ProgressBar } from "@/components/shared/progress-bar";
import { IconHeadphones, IconInfoCircle } from "@tabler/icons-react";

import { useRef, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { useSurvey } from "@/hooks/use-survey";

interface InstructionsPageProps {
  progressPercentage: number;
  onNext: () => void;
}

export function InstructionsPage({
  progressPercentage,
  onNext,
}: InstructionsPageProps) {
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [verified, setVerified] = useState(false);
  const { submitCaptcha } = useSurvey();

  const handleRecaptcha = async () => {
    const token = await recaptchaRef.current?.executeAsync();
    recaptchaRef.current?.reset();

    const verificationResult = await submitCaptcha(token!);
    if (verificationResult === true) {
      setVerified(true);
      onNext(); // Proceed to the next step after successful verification
    } else {
      console.error("Captcha verification failed");
    }
    // onNext()
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F3E7E9] to-[#E3EEFF] flex items-center justify-center p-4">
      <Card className="sm:max-w-5xl 2xl:max-w-6xl bg-white overflow-hidden w-full">
        <ProgressBar percentage={progressPercentage} />
        <CardContent className="sm:p-8 p-4 pt-6">
          <div className="space-y-6">
            <div className="sm:border-l-4 sm:border-blue-400 sm:pl-4">
              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">
                Razločevanje med naravnim in sintetiziranim govorom
              </h1>
            </div>

            <div className="space-y-4 text-gray-700 text-sm sm:text-base">
              <p>
                Dobrodošli v anketi o prepoznavanju naravnega in sintetiziranega
                govora v slovenščini.
                <br />
                <br />
                Vsak posnetek, ki ga boste slišali, je lahko sintetiziran ali
                naraven.{" "}
                <strong>Posamezen posnetek lahko poslušate le enkrat</strong>.
                Zatem se boste opredelili, ali je sintetiziran ali naraven.{" "}
                <strong>Opredelitev ni moč spreminjati za nazaj</strong>, zato
                poslušajte in klikajte zelo pozorno.
              </p>
              <p className="text-xs sm:text-sm">
                Vsebina besedil se bo tudi ponavljala. Naj to čimmanj vpliva na
                vašo presojo, ne obremenjujte se s tem, kar ste že slišali,
                presojajte le trenutni posnetek. To, da isto vsebino slišite
                dvakrat, ne pomeni nujno, da je en posnetek sintetiziran, drugi
                pa naraven, lahko sta oba sintetizirana, lahko sta oba naravna,
                pravila ni.
              </p>

              <div className="bg-blue-50 p-4 rounded-lg flex gap-3 items-center border-blue-400 border-l-4">
                <div className="text-blue-500 mt-1">
                  <IconHeadphones size={38} />
                </div>
                <p className="text-blue-800 sm:text-sm text-xs">
                  Najprej boste opravili kratek preizkus slišnosti, da se
                  prepričamo, da lahko jasno slišite zvočne posnetke.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:pt-6 w-full items-end gap-2">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6LfOgW8rAAAAAF3nGfmtJJILSWn1yMnNcLIsoVCn"} 
                size="invisible" // or use size="normal" for the checkbox
                onChange={() => setVerified(true)}
              />

              <Button
                onClick={handleRecaptcha}
                className="bg-gray-900 text-white hover:bg-gray-800 w-36"
              >
                ZAČNI
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
