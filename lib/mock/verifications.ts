// Identity-verification requests submitted by users via the
// IdentityVerificationModal. Admin reviews them in the
// "Vérifications" tab of /admin/utilisateurs and approves or
// rejects each one (with a mandatory reason on rejection).
//
// Once a request is approved, the matching user.verified flag is
// flipped to true and the blue checkmark appears next to their
// name on every public-facing surface.

export type VerificationStatus = 'pending' | 'approved' | 'rejected';

export type VerificationRequest = {
  id: string;
  // Mirrors a User.id so the admin tab can resolve user info via
  // getUser() instead of duplicating name / email fields here.
  userId: string;
  // Submission moment shown in the request list. Demo data uses
  // a fixed "today" of 2026-04-13.
  submittedAt: string;
  // CIN (national ID) front-side photo and a live selfie taken
  // during the verification flow. URLs point to demo placeholders;
  // in production these would be signed URLs to a private bucket.
  cinUrl: string;
  selfieUrl: string;
  status: VerificationStatus;
  // Filled when status === 'rejected' so the user can be told why
  // (kept on the audit log either way).
  rejectionReason?: string;
  // Admin who took the decision + when, populated when status flips
  // away from 'pending'.
  decidedBy?: string;
  decidedAt?: string;
};

// Demo CIN + selfie images pulled from picsum.photos with a fixed
// seed per request so each row stays visually distinct across
// re-renders. Real implementation would use signed URLs from a
// private storage bucket.
const cinImg = (seed: string) => `https://picsum.photos/seed/cin-${seed}/600/380`;
const selfieImg = (seed: string) => `https://picsum.photos/seed/selfie-${seed}/420/520`;

export const INITIAL_VERIFICATIONS: VerificationRequest[] = [
  // Pending — fresh requests waiting for an admin decision
  {
    id: 'v01',
    userId: '01',
    submittedAt: '13/04/26  09:14:22',
    cinUrl: cinImg('01'),
    selfieUrl: selfieImg('01'),
    status: 'pending',
  },
  {
    id: 'v02',
    userId: '18',
    submittedAt: '12/04/26  17:42:03',
    cinUrl: cinImg('18'),
    selfieUrl: selfieImg('18'),
    status: 'pending',
  },
  {
    id: 'v03',
    userId: '27',
    submittedAt: '12/04/26  11:08:55',
    cinUrl: cinImg('27'),
    selfieUrl: selfieImg('27'),
    status: 'pending',
  },
  {
    id: 'v04',
    userId: '31',
    submittedAt: '11/04/26  20:36:18',
    cinUrl: cinImg('31'),
    selfieUrl: selfieImg('31'),
    status: 'pending',
  },

  // Approved — historical decisions, still listed under the
  // "Approuvées" filter so admins can audit past actions
  {
    id: 'v05',
    userId: '24',
    submittedAt: '10/04/26  08:00:00',
    cinUrl: cinImg('24'),
    selfieUrl: selfieImg('24'),
    status: 'approved',
    decidedBy: 'Sara EL ALAOUI',
    decidedAt: '10/04/26  14:22:11',
  },
  {
    id: 'v06',
    userId: '26',
    submittedAt: '08/04/26  19:11:42',
    cinUrl: cinImg('26'),
    selfieUrl: selfieImg('26'),
    status: 'approved',
    decidedBy: 'Sara EL ALAOUI',
    decidedAt: '09/04/26  10:15:33',
  },
  {
    id: 'v07',
    userId: '29',
    submittedAt: '03/04/26  15:30:25',
    cinUrl: cinImg('29'),
    selfieUrl: selfieImg('29'),
    status: 'approved',
    decidedBy: 'Hicham TAZI',
    decidedAt: '03/04/26  17:48:09',
  },

  // Rejected — typical reasons logged so the support team can
  // explain what was off
  {
    id: 'v08',
    userId: '22',
    submittedAt: '15/02/26  10:50:11',
    cinUrl: cinImg('22'),
    selfieUrl: selfieImg('22'),
    status: 'rejected',
    rejectionReason: 'Photo CIN illisible — bord coupé',
    decidedBy: 'Sara EL ALAOUI',
    decidedAt: '15/02/26  16:02:18',
  },
  {
    id: 'v09',
    userId: '28',
    submittedAt: '06/04/26  14:55:00',
    cinUrl: cinImg('28'),
    selfieUrl: selfieImg('28'),
    status: 'rejected',
    rejectionReason: 'Visage selfie ne correspond pas à la photo CIN',
    decidedBy: 'Hicham TAZI',
    decidedAt: '06/04/26  18:30:42',
  },
];
