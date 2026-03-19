const API_BASE = '/api';
const getToken = () => localStorage.getItem('mr_token') ?? '';
const setToken = (t: string) => localStorage.setItem('mr_token', t);
const clearAuth = () => { localStorage.removeItem('mr_token'); localStorage.removeItem('moverewards_user'); };

async function call(url: string, opts: RequestInit = {}): Promise<any> {
  const token = getToken();
  const res = await fetch(url, { ...opts, headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) } });
  let data: any;
  try { data = await res.json(); } catch { data = {}; }
  if (res.status === 401 && url.includes('auth.php')) throw new Error(data.error ?? 'Invalid credentials');
  if (res.status === 401) { clearAuth(); window.location.href = '/#/login'; throw new Error('Session expired'); }
  if (!res.ok) throw new Error(data.error ?? `Error ${res.status}`);
  return data;
}

const get = (ep: string, p: Record<string,string> = {}) => call(`${API_BASE}/${ep}?` + new URLSearchParams(p));
const post = (ep: string, action: string, body: any = {}) => call(`${API_BASE}/${ep}?action=${action}`, { method: 'POST', body: JSON.stringify(body) });

export const mockApi = {
  login: async (email: string, password: string) => { const d = await post('auth.php','login',{email,password}); setToken(d.token); return d; },
  logout: () => clearAuth(),
  signup: (d: any) => post('auth.php','signup',d),
  resetPasswordByEmail: (email: string, newPassword: string) => post('auth.php','reset_password',{email,newPassword}),
  updatePassword: (_: string, newPassword: string) => post('auth.php','update_password',{newPassword}),
  updateProfile: (_: string, data: any) => post('users.php','update_profile',data),
  getEmployees: () => get('users.php',{action:'list'}),
  adminCreateEmployee: (d: any) => post('users.php','admin_create',d),
  adminUpdateEmployee: (id: string, d: any) => post('users.php','admin_update',{id,...d}),
  approveEmployee: (id: string) => post('users.php','approve',{id}),
  deactivateEmployee: (id: string) => post('users.php','deactivate',{id}),
  activateEmployee: (id: string) => post('users.php','activate',{id}),
  getPointsHistory: (employeeId?: string) => { const p: Record<string,string>={action:'history'}; if(employeeId) p.employee_id=employeeId; return get('points.php',p); },
  addPoints: (employeeId: string, points: number, category: string, notes: string, _: string) => post('points.php','add',{employeeId,points,category,notes}),
  getCategories: () => get('points.php',{action:'categories'}),
  addCategory: (category: string) => post('points.php','add_category',{category}),
  deleteCategory: (category: string) => post('points.php','delete_category',{category}),
  getPointRequests: () => get('points.php',{action:'requests'}),
  createPointRequest: (_: string, points: number, category: string, notes: string) => post('points.php','create_request',{points,category,notes}),
  handlePointRequest: (requestId: string, status: string, _: string) => post('points.php','handle_request',{requestId,status}),
  getRewards: () => get('rewards.php',{action:'list'}),
  createReward: (d: any) => post('rewards.php','create',d),
  updateReward: (id: string, d: any) => post('rewards.php','update',{id,...d}),
  redeemReward: (_: string, rewardId: string) => post('rewards.php','redeem',{rewardId}),
  getRedemptions: (_?: string) => get('rewards.php',{action:'redemptions'}),
  handleRedemption: (id: string, status: string) => post('rewards.php','handle_redemption',{id,status}),
  getContests: () => get('contests.php',{action:'list'}),
  createContest: (d: any) => post('contests.php','create',d),
  updateContest: (id: string, d: any) => post('contests.php','update',{id,...d}),
  deleteContest: (id: string) => post('contests.php','delete',{id}),
  getLeaderboard: () => get('leaderboard.php',{action:'get'}),
  getNotes: (_: string) => get('notes.php',{action:'list'}),
  createNote: (note: any) => post('notes.php','create',note),
  deleteNote: (id: string, _: string) => post('notes.php','delete',{id}),
  getAdminStats: () => get('dashboard.php',{action:'admin_stats'}),
  getEmployeeStats: () => get('dashboard.php',{action:'employee_stats'}),
  getReports: () => get('dashboard.php',{action:'reports'}),
};
