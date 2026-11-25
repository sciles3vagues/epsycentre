import { login, logout } from '@/actions/admin/auth';
import {
  discardDrafts,
  exportJson,
  getDrafts,
  publish,
  saveGroupes,
  saveTeam,
  uploadPhoto,
} from '@/actions/admin/content';

export const server = {
  admin: { login, logout, getDrafts, saveTeam, saveGroupes, uploadPhoto, publish, discardDrafts, exportJson },
};
