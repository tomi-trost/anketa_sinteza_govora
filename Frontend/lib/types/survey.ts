export interface DemographicsData {
  device: string
  gender: string
  education: string
  audioWork: string
  audioWorkDetails: string
  audioWorkOther: string
  languageWork: string
  languageWorkDetails: string
  syntheticSpeechFamiliarity: string
  syntheticSpeechExperience: string
  syntheticSpeechExperienceOther: string
}

export interface AudioQuestion {
  id: string
  audioUrl: string
  text: string
  played: boolean
  answered: boolean
  answer: string
  isPlaying: boolean
  progress: number
  narratorId: string
  code: string
}

export interface VoiceRecognition {
  recognized: string
  speakerName: string
  comment: string
}

export interface AudioGroup {
  id: number
  title: string
  questions: AudioQuestion[]
  completed: boolean
  voiceRecognition: VoiceRecognition
}

export interface SurveyState {
  currentPage: number
  canHearWell: boolean
  demographics: DemographicsData
  audioGroups: AudioGroup[]
  currentAudioGroupIndex: number
}
