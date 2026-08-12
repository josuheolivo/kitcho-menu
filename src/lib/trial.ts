// =============================================
// Helpers de Trial — Kitcho Menu
// =============================================

const TRIAL_DAYS = 15;

export function calculateTrialEnd(startDate: Date = new Date()): Date {
  const end = new Date(startDate);
  end.setDate(end.getDate() + TRIAL_DAYS);
  return end;
}

export function getTrialDaysRemaining(trialEndsAt: string): number {
  const end = new Date(trialEndsAt);
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function isTrialActive(trialEndsAt: string): boolean {
  return new Date(trialEndsAt) > new Date();
}

export function formatTrialDate(date: string): string {
  return new Date(date).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
