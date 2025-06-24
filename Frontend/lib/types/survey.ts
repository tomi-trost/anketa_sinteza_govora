

export interface DemographicsDataSurvey {
  email?: string,
  device_lable: string,
  device_other_input: string,
  gender: string,
  age?: number,
  education: string,
  media_experience: string,
  media_role: string,
  media_other_input: string,
  speach_experience: string,
  speach_role: string,
  speach_other_role: string,
  synthetic_speach_experience: string,
  synthetic_speach_role: string,
  synthetic_speach_other_role: string
}

export interface UserData {
  email?: string,
  device_lable: string,
  device_other_input: string | null,
  gender: string,
  age?: number,
  education: string,
  media_experience: boolean,
  media_role: string | null,
  media_other_input: string | null,
  speach_experience: boolean,
  speach_role: string | null,
  speach_other_role: string | null,
  synthetic_speach_experience: boolean,
  synthetic_speach_role: string | null,
  synthetic_speach_other_role: string | null
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
  speakerName?: string
  comment?: string
}

export interface AudioGroup {
  id: string
  title: string
  questions: AudioQuestion[]
  completed: boolean
  voiceRecognition: VoiceRecognition
}

export interface SurveyState {
  currentPage: number
  canHearWell: boolean
  demographics: DemographicsDataSurvey
  audioGroups: AudioGroup[]
  currentAudioGroupIndex: number
}

export type NarratorAudioMap = Record<string, AudioFile[]>;


export interface AudioFile {
  type: "human" | "synthetic",
  narrator_id: string,
  code: string,
  file_path: string,
  id: string
}
