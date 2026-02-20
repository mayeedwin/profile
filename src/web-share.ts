/**
 * Web Share API integration.
 * Falls back silently when the API is not available (desktop browsers).
 */
export function initWebShare(): void {
  if (!('share' in navigator)) return

  const shareBtn = document.querySelector<HTMLElement>('.share')
  if (!shareBtn) return

  shareBtn.addEventListener('click', (event) => {
    event.preventDefault()
    navigator
      .share({
        title: document.title,
        text: 'This is PWA Fire Demo Progressive App #pwafire #MeetMaye',
        url: window.location.href,
      })
      .then(() => console.info('PWA Fire Demo shared successfully!'))
      .catch((error: unknown) =>
        console.error('Wooooooo! Some magic failed in sharing:', error)
      )
  })
}
