/**
 * Constantes del feature de chat.
 */

/** Milisegundos para considerar que un usuario dejó de escribir. */
export const TYPING_TIMEOUT_MS = 2000;

/** Milisegundos mínimos entre emisiones de evento "typing". */
export const TYPING_EMIT_INTERVAL_MS = 1000;

/** Delay en ms antes de ejecutar onKicked tras ser expulsado. */
export const KICKED_DELAY_MS = 2000;

/** Longitud máxima de un mensaje de chat. */
export const MAX_MESSAGE_LENGTH = 1000;
