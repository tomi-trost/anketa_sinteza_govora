import { Card, CardContent } from "@/components/ui/card"
import { ProgressBar } from "@/components/shared/progress-bar"

interface AlreadyCompletedPageProps {
  progressPercentage: number
}

export function AlreadyCompletedPage({ progressPercentage }: AlreadyCompletedPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F3E7E9] to-[#E3EEFF] flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl bg-white overflow-hidden">
        <ProgressBar percentage={progressPercentage} />
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
            <h1 className="text-2xl font-bold text-gray-800">Anketa že rešena</h1>
            <p className="text-gray-600">
              Izgleda, da ste to anketo že rešili. Vsak udeleženec lahko anketo reši samo enkrat.
            </p>
            <p className="text-gray-500 text-sm">
              Hvala za vaš interes in sodelovanje v naši raziskavi o razpoznavanju sintetiziranega govora.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
