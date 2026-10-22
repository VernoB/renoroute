export { BRAND, type Brand } from './config/brand';
export {
  formatCad,
  formatShortDate,
  intlLocale,
  resolveLocale,
  SUPPORTED_LOCALES,
  type AppLocale,
} from './i18n/index.ts';
export {
  FSA_PATTERN,
  parseProfileInput,
  PROFILE_UTILITIES,
  profileInputSchema,
  type ProfileInput,
  type ProfileUtility,
} from './profile/profile-input.ts';
export {
  legalContactEmail,
  legalPageUrl,
  LEGAL_PATHS,
  PROCESSORS,
  RETENTION,
} from './legal/processors.ts';
export {
  canGeneratePlan,
  consentProfileUpdate,
  TERMS_VERSION,
  type ConsentProfileUpdate,
  type ConsentSelection,
} from './consent/plan-consent.ts';
export {
  AI_TASKS,
  IMAGE_PREVIEW_ALLOWED_MODELS,
  OPENROUTER_AUTO_MODEL,
  TASK_AUTO_ROUTES,
  autoRouterPlugin,
  usesAutoRouter,
  isAiGenerationEnabled,
  isImagePreviewEnabled,
  selectModel,
  type AiTask,
} from './ai/tasks.ts';
export {
  PHOTO_OBSERVATION_CODES,
  parsePhotoObservation,
  photoObservationSchema,
  type PhotoObservation,
} from './ai/photo-observation.ts';
export {
  parseVisualizationInput,
  shouldAttemptVisualization,
  unavailableVisualization,
  visualizationInputSchema,
  visualizationPrompt,
  visualizationResultSchema,
  type VisualizationInput,
  type VisualizationResult,
} from './ai/visualization.ts';
