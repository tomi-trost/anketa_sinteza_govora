import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Volume2 } from 'lucide-react'
import { ProgressBar } from "@/components/shared/progress-bar"
import { IconHeadphones, IconInfoCircle } from '@tabler/icons-react';

interface InstructionsPageProps {
  progressPercentage: number
  onNext: () => void
}

export function InstructionsPage({ progressPercentage, onNext }: InstructionsPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F3E7E9] to-[#E3EEFF] flex items-center justify-center p-4">
      <Card className="w-full max-w-5xl bg-white overflow-hidden">
        <ProgressBar percentage={progressPercentage} />
        <CardContent className="p-8">
          <div className="space-y-6">
            <div className="border-l-4 border-blue-400 pl-4">
              <h1 className="text-3xl font-semibold text-gray-800">Raziskava o Razpoznavanju Sintetiziranega Govora</h1>
            </div>

            <div className="space-y-4 text-gray-700">
              <p>
                Dobrodošli v anketi o prepoznavanju naravnega in sintetiziranega govora v slovenščini.
                <br />
                Vsak posnetek, ki ga boste slišali, je lahko sintetiziran ali naraven.
              </p>

              <div>
                <h2 className="font-bold flex gap-1">Navodila <IconInfoCircle/></h2>
                <ol className="list-decimal pl-5 space-y-2 mt-2">
                  <li>
                    <strong>Posamezen posnetek lahko poslušate le enkrat.</strong> 
                  </li>
                  <li>
                    <strong>Odgovorite na vprašanje</strong>. Za vsak posnetek se boste opredelili, ali je sintetiziran ali naraven. <strong>Opredelitev ni moč spreminjati za nazaj</strong>, zato poslušajte in klikajte zelo pozorno.
                  </li>
                </ol>
              </div>

              <p className="text-sm">
                Vsebina besedil se bo tudi ponavljala. Naj to čimmanj vpliva na vašo presojo, ne obremenjujte se s tem, kar ste že slišali, presojajte le trenutni posnetek. To, da isto vsebino slišite dvakrat, ne pomeni nujno, da je en posnetek sintetiziran, drugi pa naraven, lahko sta oba sintetizirana, lahko sta oba naravna, pravila ni.
              </p>

              <div className="bg-blue-50 p-4 rounded-lg flex gap-3 items-center border-blue-400 border-l-4">
                <div className="text-blue-500 mt-1">
                  <IconHeadphones size={38} />
                </div>
                <p className="text-blue-800 text-sm">
                  Pred začetkom: Najprej boste opravili kratek preizkus slišnosti, da se prepričamo, da lahko jasno slišite zvočne posnetke.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-6">
              <Button onClick={onNext} className="bg-gray-900 text-white hover:bg-gray-800 w-36">
                ZAČNI
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
