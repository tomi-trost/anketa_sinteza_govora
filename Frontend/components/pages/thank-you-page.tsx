import { Card, CardContent } from "@/components/ui/card"
import { ProgressBar } from "@/components/shared/progress-bar"

interface ThankYouPageProps {
  progressPercentage: number
}

export function ThankYouPage({ progressPercentage }: ThankYouPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F3E7E9] to-[#E3EEFF] flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl bg-white overflow-hidden">
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Hvala za sodelovanje!</h1>
            <p className="text-gray-600">
              Vaši odgovori so bili uspešno zabeleženi. Hvala, ker ste si vzeli čas za sodelovanje v naši raziskavi o
              razpoznavanju sintetiziranega govora.
            </p>
            <p className="text-gray-500 text-sm">
              Vaši podatki bodo uporabljeni izključno za namene raziskave in bodo obravnavani zaupno.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
