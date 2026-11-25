declare namespace App {
  interface SessionData {
    /** Set at back-office login; `fingerprint` ties the session to the current password. */
    admin: { fingerprint: string };
  }
}
