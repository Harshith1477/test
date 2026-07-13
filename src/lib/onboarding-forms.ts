export const ONBOARDING_FORM_TYPES = ["welcome", "project-brief", "brand-assets", "terms", "feedback"] as const;

export type OnboardingFormType = (typeof ONBOARDING_FORM_TYPES)[number];

export function isOnboardingFormType(value: string): value is OnboardingFormType {
  return (ONBOARDING_FORM_TYPES as readonly string[]).includes(value);
}
