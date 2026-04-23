export type Status = 'actif' | 'inactif' | 'bloque' | 'supprime';

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  signup: string;
  lastSeen: string;
  status: Status;
  city: string;
  reportsTotal: number;
  reportsPublished: number;
  reportsRejected: number;
};

export const STATUS_STYLE: Record<Status, { label: string; cls: string }> = {
  actif: { label: 'Actif', cls: 'text-green-700 bg-green-100' },
  inactif: { label: 'Inactif', cls: 'text-brand-navy bg-brand-sky/60' },
  bloque: { label: 'Bloqué', cls: 'text-gray-600 bg-gray-200' },
  supprime: { label: 'Supprimé', cls: 'text-red-700 bg-red-100' },
};

export const INITIAL_USERS: User[] = [
  { id: '01', name: 'Yahya MOUSSAOUI', email: 'yahya.moussaoui@gmail.com', phone: '0675487955', signup: '13/04/26  23:12:05', lastSeen: '13/04/26  23:12:05', status: 'actif', city: 'Casablanca', reportsTotal: 8, reportsPublished: 5, reportsRejected: 1 },
  { id: '18', name: 'Salma EL AMRANI', email: 'salma.elamrani@outlook.com', phone: '0661230987', signup: '05/04/26  09:05:22', lastSeen: '13/04/26  18:41:30', status: 'actif', city: 'Rabat', reportsTotal: 3, reportsPublished: 3, reportsRejected: 0 },
  { id: '16', name: 'Karim BENJELLOUN', email: 'karim.b@yahoo.fr', phone: '0698564123', signup: '28/03/26  14:22:11', lastSeen: '02/04/26  10:15:08', status: 'inactif', city: 'Marrakech', reportsTotal: 2, reportsPublished: 1, reportsRejected: 1 },
  { id: '22', name: 'Fatima ZAHRA', email: 'fatimaz@gmail.com', phone: '0600000000', signup: '15/02/26  11:00:45', lastSeen: '20/02/26  12:33:17', status: 'bloque', city: 'Tanger', reportsTotal: 12, reportsPublished: 2, reportsRejected: 9 },
  { id: '07', name: 'Mehdi TAZI', email: 'mehdi.tazi@outlook.com', phone: '0655554433', signup: '01/01/26  08:15:00', lastSeen: '12/01/26  22:10:05', status: 'supprime', city: 'Fès', reportsTotal: 5, reportsPublished: 3, reportsRejected: 2 },
  { id: '24', name: 'Imane BENALI', email: 'imane.b@gmail.com', phone: '0612345678', signup: '12/04/26  10:05:00', lastSeen: '13/04/26  10:02:00', status: 'actif', city: 'Casablanca', reportsTotal: 4, reportsPublished: 4, reportsRejected: 0 },
  { id: '25', name: 'Rachid DEMNATI', email: 'rachid.d@outlook.fr', phone: '0699887766', signup: '11/04/26  14:22:00', lastSeen: '13/04/26  09:17:45', status: 'actif', city: 'Agadir', reportsTotal: 1, reportsPublished: 1, reportsRejected: 0 },
  { id: '26', name: 'Amina KAROUI', email: 'amina.karoui@hadar.ma', phone: '0677001122', signup: '10/04/26  07:30:00', lastSeen: '12/04/26  22:30:00', status: 'inactif', city: 'Meknès', reportsTotal: 6, reportsPublished: 4, reportsRejected: 1 },
  { id: '27', name: 'Nabil EL HOUSSEIN', email: 'nabil.elh@gmail.com', phone: '0688889999', signup: '08/04/26  20:50:00', lastSeen: '13/04/26  08:44:30', status: 'actif', city: 'Oujda', reportsTotal: 3, reportsPublished: 2, reportsRejected: 0 },
  { id: '28', name: 'Leila MOUTAMID', email: 'leila.m@outlook.com', phone: '0644556677', signup: '06/04/26  15:10:00', lastSeen: '10/04/26  17:05:15', status: 'bloque', city: 'Tétouan', reportsTotal: 9, reportsPublished: 1, reportsRejected: 7 },
  { id: '29', name: 'Youssef BENDRISS', email: 'y.bendriss@gmail.com', phone: '0622334455', signup: '03/04/26  11:11:11', lastSeen: '11/04/26  13:13:13', status: 'actif', city: 'Casablanca', reportsTotal: 7, reportsPublished: 6, reportsRejected: 1 },
  { id: '30', name: 'Asmaa SENHAJI', email: 'a.senhaji@hadar.ma', phone: '0666667777', signup: '31/03/26  18:20:40', lastSeen: '12/04/26  14:28:02', status: 'actif', city: 'Rabat', reportsTotal: 2, reportsPublished: 2, reportsRejected: 0 },
  { id: '31', name: 'Othmane BERRADA', email: 'othmane.b@gmail.com', phone: '0611112222', signup: '28/03/26  09:12:05', lastSeen: '13/04/26  07:15:00', status: 'actif', city: 'Salé', reportsTotal: 1, reportsPublished: 0, reportsRejected: 0 },
  { id: '32', name: 'Houda TOUIL', email: 'houda.touil@outlook.com', phone: '0633334444', signup: '20/03/26  16:45:00', lastSeen: '05/04/26  20:11:30', status: 'inactif', city: 'Kenitra', reportsTotal: 4, reportsPublished: 3, reportsRejected: 0 },
  { id: '33', name: 'Anas SALEM', email: 'anas.salem@gmail.com', phone: '0645566778', signup: '17/03/26  12:55:00', lastSeen: '13/04/26  11:22:15', status: 'actif', city: 'Casablanca', reportsTotal: 0, reportsPublished: 0, reportsRejected: 0 },
];

export function getUser(id: string): User | undefined {
  return INITIAL_USERS.find((u) => u.id === id);
}

export function validationRate(u: Pick<User, 'reportsPublished' | 'reportsTotal'>): number {
  if (u.reportsTotal === 0) return 0;
  return Math.round((u.reportsPublished / u.reportsTotal) * 100);
}
