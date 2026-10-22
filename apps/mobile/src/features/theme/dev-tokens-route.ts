export function devTokensDestination(enabled: boolean): 'gallery' | 'welcome' {
  return enabled ? 'gallery' : 'welcome';
}
