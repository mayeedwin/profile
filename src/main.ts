import './style.css'
import { initWebShare } from './web-share'

// ─── Service Worker ──────────────────────────────────────────────────────────

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then(() => console.log('Service Worker Registered'))
      .catch((err: unknown) => console.error('SW registration failed:', err))
  })
}

// ─── Panel navigation ────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  const body = document.body
  const wrapper = document.getElementById('wrapper')
  const footer = document.getElementById('footer')

  if (!wrapper || !footer) return

  // Collect all direct child panels
  const panels = Array.from(wrapper.querySelectorAll<HTMLElement>(':scope > .panel'))

  // ── Loading animation ──────────────────────────────────────────────────────
  window.addEventListener('load', () => {
    setTimeout(() => {
      body.classList.remove('is-loading-0')
      setTimeout(() => {
        body.classList.remove('is-loading-1')
      }, 1500)
    }, 100)
  })

  // ── Set background images from embedded <img> tags ─────────────────────────
  panels.forEach((panel, index) => {
    const imageEl = panel.querySelector<HTMLElement>('.image')
    const img = imageEl?.querySelector<HTMLImageElement>('img')

    if (imageEl && img) {
      const src = img.getAttribute('src')
      const position = img.dataset['position']
      if (src) imageEl.style.backgroundImage = `url(${src})`
      if (position) imageEl.style.backgroundPosition = position
      img.style.display = 'none'
    }

    // Hide every panel except the first
    if (index !== 0) {
      panel.classList.add('inactive')
      panel.style.display = 'none'
    }
  })

  // ── Navigation lock — prevents clicks during transitions ──────────────────
  let locked = true
  setTimeout(() => {
    locked = false
  }, 1250)

  // ── Anchor-link panel transitions ─────────────────────────────────────────
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault()
      event.stopPropagation()

      if (locked) return

      const id = link.getAttribute('href')
      if (!id) return

      const targetPanel = document.querySelector<HTMLElement>(id)
      if (!targetPanel) return

      locked = true

      // Detect spin animation on the parent <ul>
      const ul = link.closest('ul')
      const delay = ul?.classList.contains('spinX') || ul?.classList.contains('spinY') ? 250 : 0

      link.classList.add('active')

      setTimeout(() => {
        panels.forEach((p) => p.classList.add('inactive'))
        footer.classList.add('inactive')

        setTimeout(() => {
          panels.forEach((p) => {
            p.style.display = 'none'
          })
          targetPanel.style.display = ''
          document.documentElement.scrollTop = 0

          setTimeout(() => {
            targetPanel.classList.remove('inactive')
            link.classList.remove('active')
            locked = false

            setTimeout(() => {
              footer.classList.remove('inactive')
            }, 250)
          }, 100)
        }, 350)
      }, delay)
    })
  })

  // ── Web Share ──────────────────────────────────────────────────────────────
  initWebShare()
})
