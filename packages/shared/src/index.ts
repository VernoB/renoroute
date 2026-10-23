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
  DISCLAIMER_VERSION,
  parsePlanOutput,
  planOutputSchema,
  previewPlanContent,
  reconcilePlanOutput,
  type PlanOutput,
} from './ai/plan.ts';
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
export {
  MAX_VOICE_SECONDS,
  parseTranscribeInput,
  transcribeInputSchema,
  type TranscribeInput,
  type TranscribeParseResult,
} from './ai/transcription.ts';
export {
  AMOUNT_TYPES,
  APP_LOCALES,
  ASSESSMENT_STATUSES,
  CONTRACTOR_STATUSES,
  ELECTRIC_UTILITIES,
  ENERGY_ADVISOR_STATUSES,
  ENERGY_FUELS,
  HEATING_SYSTEMS,
  HOME_TYPES,
  INCOME_BANDS,
  ITEM_STATUSES,
  LEAD_STATUSES,
  MEASURE_CODES,
  PAYMENT_STATUSES,
  PHOTO_CATEGORIES,
  PLAN_STATUSES,
  PROGRAM_STATUSES,
  REBATE_CHECKLIST_KINDS,
  USER_ROLES,
  type PhotoCategory,
} from './home/enums.ts';
export {
  HOME_PROVINCES,
  homeInputSchema,
  parseHomeInput,
  type HomeInput,
} from './home/home-input.ts';
export {
  DASHBOARD_STATES,
  dashboardState,
  intakePercent,
  isIntakeComplete,
  nextActionKey,
  type DashboardState,
  type PlanProgress,
} from './home/dashboard-state.ts';
export { homeInputToUpdate, homeRowToInput, mergeHomeUpdate } from './home/home-row.ts';
export {
  OPTIONAL_PHOTO_CATEGORIES,
  PHOTO_MAX_BYTES,
  RECOMMENDED_PHOTO_CATEGORIES,
  isAllowedPhotoBytes,
  photoStoragePath,
  type OptionalPhotoCategory,
  type RecommendedPhotoCategory,
} from './photos/photo-upload.ts';
export {
  dequeuePhoto,
  enqueuePhoto,
  parseQueuedPhoto,
  type QueuedPhoto,
} from './photos/photo-queue.ts';
export { hasGpsExif } from './photos/exif.ts';
export {
  jpegBytesFromDataUrl,
  jpegHasExif,
  jpegHasGps,
  prepareUploadJpeg,
  stripJpegExif,
  type PrepareUploadJpeg,
} from './photos/jpeg-exif.ts';
export {
  parseCreateAssessment,
  type CreateAssessmentInput,
  type CreateAssessmentResult,
} from './assessment/create-assessment.ts';
export {
  estimateCandidateMeasures,
  estimateMeasure,
  type Confidence,
  type HomeEnergyInput,
  type MeasureBenchmarkRow,
  type MeasureEstimate,
  type RangeCad,
} from './calc/cost-savings.ts';
export {
  parseRebateConditions,
  rebateConditionsSchema,
  type RebateConditions,
} from './rebates/conditions.ts';
export {
  DEFAULT_PLAN_PRODUCT_CODE,
  isPaymentProvider,
  isPlanProductCode,
  PLAN_PRODUCT_CODES,
  PLAN_PRODUCTS,
  PAYMENT_PROVIDERS,
  resolvePlanProduct,
  type PaymentProvider,
  type PlanProduct,
  type PlanProductCode,
} from './payments/products.ts';
export {
  parsePaymentEvent,
  previewStillLimited,
  rebuildPlanContent,
  type PaymentEvent,
  type UnlockPlanItem,
} from './payments/unlock.ts';
export {
  evaluateEligibility,
  type EligibilityHome,
  type EligibilityProgram,
  type EligibilityReason,
  type EligibilityResult,
  type EligibilityRule,
  type EligibilityStatus,
} from './calc/eligibility.ts';
