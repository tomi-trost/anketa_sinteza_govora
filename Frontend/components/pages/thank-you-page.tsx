import { Card, CardContent } from "@/components/ui/card";
import { ProgressBar } from "@/components/shared/progress-bar";
import { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Check, Share2 } from "lucide-react";
import { useSurvey } from "@/hooks/use-survey";

interface ThankYouPageProps {
  progressPercentage: number;
}

export function ThankYouPage({ progressPercentage }: ThankYouPageProps) {
  const [email, setEmail] = useState("");
  // const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const { submitMail, debouncedHandleChange, mailSubmitted } = useSurvey();

  const handleEmailSubmit = () => {
    if (email.trim()) {
      submitMail(email).then(() => {
      
        console.log("Email submitted:", email);
      }).catch((error) => {
        console.error("Error submitting email:", error);
        // Handle error (e.g., show a notification)
      });
      
    }
  };

  const handleShareSurvey = async () => {
    try {
      const currentUrl = window.location.href;
      await navigator.clipboard.writeText(currentUrl);
      setIsCopied(true);
      // Reset the copied state after 2 seconds
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F3E7E9] to-[#E3EEFF] flex items-center justify-center p-4">
      <Card className="w-full sm:max-w-5xl 2xl:max-w-6xl bg-white overflow-hidden">
        <ProgressBar percentage={progressPercentage} />
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
              Zahvaljujemo se vam za vaš čas!
            </h1>
            {/* <p className="text-gray-600">
              Vaši odgovori so bili uspešno zabeleženi. Hvala, ker ste si vzeli
              čas za sodelovanje v naši raziskavi o razpoznavanju
              sintetiziranega govora.
            </p> */}
            <p className="text-gray-500 text-sm">
              Če želite, lahko vpišete svoj e-naslov in poslali vam bomo
              rezultate raziskave.
            </p>

            {!mailSubmitted ? (
              <div className="mt-8 max-w-md mx-auto w-full">
                <div className="space-y-4 flex justify-center items-center gap-2 w-full">
                  <Input
                    type="email"
                    placeholder="Vpiši email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full mt-4"
                  />

                  <Button
                    onClick={handleEmailSubmit}
                    className="bg-black text-white hover:bg-gray-800 "
                  >
                    Pošlji
                  </Button>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Neobvezno - če želite prejeti povzetek rezultatov raziskave
                </p>
              </div>
            ) : (
              <div className="mt-8 p-4 bg-green-50 rounded-lg">
                <p className="text-green-700 font-medium">
                  Email uspešno poslan!
                </p>
                <p className="text-green-600 text-sm mt-1">
                  O rezultatih raziskave vas bomo obvestili na vaš email naslov.
                </p>
              </div>
            )}
            <div>
              <h3 className="mt-8">
                <strong>
                  Anketo lahko delite z drugimi, zelo dobrodošlo bo.
                </strong>
              </h3>
              <div className="mt-6">
                <Button
                  onClick={handleShareSurvey}
                  variant="outline"
                  className="inline-flex items-center gap-2 px-4 py-2"
                >
                  {isCopied ? (
                    <>
                      <Check className="h-4 w-4 text-green-600" />
                      Kopirano!
                    </>
                  ) : (
                    <>
                      <Share2 className="h-4 w-4" />
                      Deli anketo
                    </>
                  )}
                </Button>
              </div>
              <div className="flex items-center justify-center mt-6">
                <p className="text-gray-500 text-sm my-6 max-w-3xl">
                  Na eni napravi je anketo moč izpolnjevati le enkrat, drugi jo
                  bodo morali izpolniti na svojih.
                  <br />
                  <br />
                  Rezultate bomo predstavili simpoziju{" "}
                  <strong>
                    <a href="https://www.agrft.uni-lj.si/blog/2025/01/26/govor-glas-identiteta/" className=" text-blue-600 hover:text-blue-800 visited:text-purple-600 duration-300 ease-in-out">
                      GOVOR. GLAS. IDENTITETA.
                    </a>
                  </strong>{" "}
                  na Akademiji za gledališče, radio, film in televizijo Univerze
                  v Ljubljani 29. in 30. 9. 2025.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
