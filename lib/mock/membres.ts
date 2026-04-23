export type Role = 'admin' | 'moderateur' | 'support';
export type Status = 'actif' | 'inactif' | 'suspendu';

export type Member = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  status: Status;
  lastSeen: string;
};

export const ROLE_STYLE: Record<Role, { label: string; cls: string }> = {
  admin: { label: 'Admin', cls: 'text-violet-500 bg-violet-200/40' },
  moderateur: { label: 'Modérateur', cls: 'text-brand-blue bg-brand-sky/60' },
  support: { label: 'Support', cls: 'text-orange-600 bg-orange-100' },
};

export const STATUS_STYLE: Record<Status, { label: string; cls: string }> = {
  actif: { label: 'Actif', cls: 'text-green-700 bg-green-100' },
  inactif: { label: 'Inactif', cls: 'text-gray-600 bg-gray-200' },
  suspendu: { label: 'Suspendu', cls: 'text-red-700 bg-red-100' },
};

export const INITIAL_MEMBERS: Member[] = [
  { id: '01', name: 'Yahya MOUSSAOUI', email: 'yahya.moussaoui@gmail.com', phone: '+212 661 11 22 33', role: 'admin', status: 'actif', lastSeen: '13/04/26  23:12:05' },
  { id: '02', name: 'Salma EL AMRANI', email: 'salma@hadar.ma', phone: '+212 661 22 33 44', role: 'moderateur', status: 'actif', lastSeen: '13/04/26  18:40:00' },
  { id: '03', name: 'Karim BENJELLOUN', email: 'karim@hadar.ma', phone: '+212 661 33 44 55', role: 'moderateur', status: 'actif', lastSeen: '13/04/26  14:05:17' },
  { id: '04', name: 'Fatima ZAHRA', email: 'fatima@hadar.ma', phone: '+212 661 44 55 66', role: 'support', status: 'inactif', lastSeen: '01/04/26  10:22:44' },
  { id: '05', name: 'Mehdi TAZI', email: 'mehdi@hadar.ma', phone: '+212 661 55 66 77', role: 'support', status: 'suspendu', lastSeen: '15/03/26  12:05:08' },
  { id: '06', name: 'Rajae OUAZZANI', email: 'rajae@hadar.ma', phone: '+212 662 11 22 33', role: 'admin', status: 'actif', lastSeen: '13/04/26  21:14:08' },
  { id: '07', name: 'Hakim CHRAIBI', email: 'hakim@hadar.ma', phone: '+212 662 22 33 44', role: 'moderateur', status: 'actif', lastSeen: '13/04/26  17:22:30' },
  { id: '08', name: 'Nadia BELHAJ', email: 'nadia@hadar.ma', phone: '+212 662 33 44 55', role: 'moderateur', status: 'actif', lastSeen: '12/04/26  19:45:00' },
  { id: '09', name: 'Imane ZAKARI', email: 'imane@hadar.ma', phone: '+212 662 44 55 66', role: 'support', status: 'actif', lastSeen: '12/04/26  15:02:12' },
  { id: '10', name: 'Younes AIT BEN', email: 'younes@hadar.ma', phone: '+212 662 55 66 77', role: 'support', status: 'inactif', lastSeen: '10/04/26  11:33:45' },
  { id: '11', name: 'Laila BENNIS', email: 'laila@hadar.ma', phone: '+212 663 11 22 33', role: 'moderateur', status: 'actif', lastSeen: '11/04/26  20:10:55' },
  { id: '12', name: 'Omar FILALI', email: 'omar@hadar.ma', phone: '+212 663 22 33 44', role: 'support', status: 'actif', lastSeen: '11/04/26  12:48:14' },
  { id: '13', name: 'Zineb HARTI', email: 'zineb@hadar.ma', phone: '+212 663 33 44 55', role: 'moderateur', status: 'suspendu', lastSeen: '28/03/26  09:14:21' },
  { id: '14', name: 'Anas CHERKAOUI', email: 'anas@hadar.ma', phone: '+212 663 44 55 66', role: 'admin', status: 'actif', lastSeen: '13/04/26  22:02:55' },
  { id: '15', name: 'Sara BENALI', email: 'sara@hadar.ma', phone: '+212 663 55 66 77', role: 'moderateur', status: 'actif', lastSeen: '12/04/26  16:44:32' },
  { id: '16', name: 'Hamza IDRISSI', email: 'hamza@hadar.ma', phone: '+212 664 11 22 33', role: 'support', status: 'inactif', lastSeen: '02/04/26  18:01:09' },
  { id: '17', name: 'Meryem TAHIRI', email: 'meryem@hadar.ma', phone: '+212 664 22 33 44', role: 'moderateur', status: 'actif', lastSeen: '12/04/26  13:19:44' },
  { id: '18', name: 'Walid CHARKAOUI', email: 'walid@hadar.ma', phone: '+212 664 33 44 55', role: 'support', status: 'actif', lastSeen: '11/04/26  10:05:12' },
  { id: '19', name: 'Amina SEKKAT', email: 'amina@hadar.ma', phone: '+212 664 44 55 66', role: 'moderateur', status: 'actif', lastSeen: '13/04/26  08:30:17' },
  { id: '20', name: 'Youssef AMRANI', email: 'youssef@hadar.ma', phone: '+212 664 55 66 77', role: 'support', status: 'suspendu', lastSeen: '20/03/26  14:51:03' },
  { id: '21', name: 'Houda MANSOURI', email: 'houda@hadar.ma', phone: '+212 665 11 22 33', role: 'moderateur', status: 'actif', lastSeen: '13/04/26  07:41:50' },
  { id: '22', name: 'Tarik BEKKARI', email: 'tarik@hadar.ma', phone: '+212 665 22 33 44', role: 'support', status: 'actif', lastSeen: '12/04/26  09:16:28' },
  { id: '23', name: 'Leila ENNAJI', email: 'leila@hadar.ma', phone: '+212 665 33 44 55', role: 'moderateur', status: 'inactif', lastSeen: '05/04/26  17:12:40' },
  { id: '24', name: 'Khalid BENSOUDA', email: 'khalid@hadar.ma', phone: '+212 665 44 55 66', role: 'admin', status: 'actif', lastSeen: '13/04/26  11:28:09' },
  { id: '25', name: 'Sofia LAMRINI', email: 'sofia@hadar.ma', phone: '+212 665 55 66 77', role: 'support', status: 'actif', lastSeen: '12/04/26  20:33:11' },
  { id: '26', name: 'Amine DOUKALI', email: 'amine@hadar.ma', phone: '+212 666 11 22 33', role: 'moderateur', status: 'actif', lastSeen: '13/04/26  06:22:00' },
  { id: '27', name: 'Dounia KETTANI', email: 'dounia@hadar.ma', phone: '+212 666 22 33 44', role: 'support', status: 'actif', lastSeen: '12/04/26  22:47:55' },
  { id: '28', name: 'Ali BOURKIA', email: 'ali@hadar.ma', phone: '+212 666 33 44 55', role: 'moderateur', status: 'suspendu', lastSeen: '12/03/26  13:05:20' },
  { id: '29', name: 'Kenza LAHMADI', email: 'kenza@hadar.ma', phone: '+212 666 44 55 66', role: 'admin', status: 'actif', lastSeen: '13/04/26  19:59:12' },
  { id: '30', name: 'Rachid NACIRI', email: 'rachid@hadar.ma', phone: '+212 666 55 66 77', role: 'support', status: 'inactif', lastSeen: '28/03/26  10:45:06' },
];
