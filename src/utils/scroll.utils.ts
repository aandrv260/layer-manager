/**
 * Toggle the document body's scrollability. Used to lock background scrolling
 * while a focus-trapping layer (modal/dialog) is open.
 */
export const toggleBodyScroll = (overflow: "hidden" | "visible") => {
  document.body.style.overflow = overflow;
};
