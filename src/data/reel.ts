/**
 * The reel's pace: twelve seconds of notional footage per chapter.
 *
 * It started as a way to make the frame's timecode read as footage. It is now also how long
 * PLAY holds each chapter before cutting to the next — so while the reel plays, the timecode
 * is not a decoration beside the playhead but the playhead itself, and it lands exactly on
 * `chapter × 12` at every cut. One number, so the two can never drift apart.
 */
export const SECONDS_PER_CHAPTER = 12;

/** Frames per second the timecode counts in, as film does. */
export const FPS = 24;
