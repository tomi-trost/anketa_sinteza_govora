"use client";
import { useSurvey } from "@/hooks/use-survey";

import { AlreadyCompletedPage } from "@/components/pages/already-completed-page";
import { InstructionsPage } from "@/components/pages/instructions-page";
import { HearingTestPage } from "@/components/pages/hearing-test-page";
import { DemographicsPage } from "@/components/pages/demographics-page";
import { SurveyPage } from "@/components/pages/survey-page";
import { ThankYouPage } from "@/components/pages/thank-you-page";
import { getProgressPercentage } from "@/lib/utils/utils";

export default function SpeechSurvey() {
  const {
    // State
    currentPage,
    canHearWell,
    isPlaying,
    isLoading,
    audioGroups,
    currentAudioGroupIndex,
    alreadyCompleted,
    demographics,

    // Actions
    checkUser,
    setCurrentPage,
    setCanHearWell,
    handleTestAudioPlay,
    debouncedHandleChange,
    handleVoiceRecognitionChange,
    playAudio,
    answerQuestion,
    handleNextPage,
    handleNextPageSurvey
  } = useSurvey();

  // Calculate progress percentage
  const progressPercentage = getProgressPercentage(
    currentPage,
    currentAudioGroupIndex,
    audioGroups.length
  );

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F3E7E9] to-[#E3EEFF] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Show already completed page if user has already taken the survey
  if (alreadyCompleted) {
    return <AlreadyCompletedPage progressPercentage={progressPercentage} />;
  }

  // Render the appropriate page based on current page state
  switch (currentPage) {
    case 0:
      return (
        <InstructionsPage
          progressPercentage={progressPercentage}
          onNext={() => {
            checkUser().then(() => {
              setCurrentPage(1);
            });
          }}
        />
      );

    case 1:
      return (
        <HearingTestPage
          progressPercentage={progressPercentage}
          canHearWell={canHearWell}
          isPlaying={isPlaying}
          onHearingChange={setCanHearWell}
          onAudioPlay={handleTestAudioPlay}
          onNext={handleNextPage}
          onBack={() => setCurrentPage(0)}
        />
      );

    case 2:
      return (
        <DemographicsPage
          progressPercentage={progressPercentage}
          demographics={demographics}
          onDemographicsChange={debouncedHandleChange}
          onNext={handleNextPage}
          onBack={() => setCurrentPage(1)}
        />
      );

    case 3:
      return (
        <SurveyPage
          progressPercentage={progressPercentage}
          isLoading={isLoading}
          audioGroups={audioGroups}
          currentAudioGroupIndex={currentAudioGroupIndex}
          onPlayAudio={playAudio}
          onAnswerQuestion={answerQuestion}
          onVoiceRecognitionChange={handleVoiceRecognitionChange}
          onNext={handleNextPageSurvey}
        />
      );

    case 4:
      return <ThankYouPage progressPercentage={progressPercentage} />;

    default:
      return (
        <InstructionsPage
          progressPercentage={progressPercentage}
          onNext={handleNextPage}
        />
      );
  }
}
