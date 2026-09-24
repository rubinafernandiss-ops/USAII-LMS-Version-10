import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

const SEEN_KEY = 'usaii.lms.navvideo.v1';

/** True once this learner has opened (and closed) the navigation video on this device. */
export function navVideoSeen() {
  try {
    return localStorage.getItem(SEEN_KEY) === '1';
  } catch {
    return true;
  }
}
function markSeen() {
  try {
    localStorage.setItem(SEEN_KEY, '1');
  } catch {
    /* private browsing: nothing to remember */
  }
}

/**
 * "How to Navigate the USAII® LMS?": a three-minute video walkthrough of every learner page,
 * opened from the ? button at the top right (and once, automatically, on a learner's first visit).
 * Captions are part of the video. It never plays on its own; the learner presses play.
 */
export default function NavigationVideo({ open, onClose }: { open: boolean; onClose: () => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);

  const close = () => {
    video.current?.pause();
    markSeen();
    onClose();
  };

  useEffect(() => {
    if (!open) return;
    const back = document.activeElement as HTMLElement | null;
    const t = setTimeout(() => closeBtn.current?.focus(), 60);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        close();
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => {
      clearTimeout(t);
      window.removeEventListener('keydown', onKey, true);
      back?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[300] flex items-center justify-center p-3 sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-ink/50 backdrop-blur-[3px]" onClick={close} aria-hidden />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="nav-video-title"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="relative w-full max-w-[1040px] overflow-hidden rounded-3xl bg-white shadow-2xl"
          >
            <div className="h-1 bg-gradient-to-r from-nblue via-npurple to-npink" aria-hidden />
            <div className="flex items-start justify-between gap-3 px-5 pb-3 pt-4 sm:px-6">
              <div>
                <h2 id="nav-video-title" className="font-display text-xl font-extrabold leading-tight sm:text-2xl">
                  How to Navigate the USAII® LMS?
                </h2>
                <p className="mt-0.5 text-[13px] text-ink-soft">A 3-minute video tour of every page and button. Captions are included.</p>
              </div>
              <button
                ref={closeBtn}
                type="button"
                onClick={close}
                aria-label="Close video (Esc)"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink-soft transition hover:bg-mist hover:text-ink"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="bg-black">
              <video
                ref={video}
                className="block aspect-video max-h-[75vh] w-full bg-black"
                src="/videos/how-to-navigate-the-usaii-lms.mp4"
                poster="/videos/how-to-navigate-the-usaii-lms.jpg"
                controls
                playsInline
                preload="metadata"
                controlsList="nodownload"
              >
                Your browser cannot play this video.
              </video>
            </div>
            <p className="px-5 py-3 text-center text-xs text-ink-faint sm:px-6">You can watch it again anytime from the ? button at the top right.</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
