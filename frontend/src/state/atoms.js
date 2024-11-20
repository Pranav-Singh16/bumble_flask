import { atom } from 'recoil';

export const processStatusState = atom({
  key: 'processStatusState',
  default: 'idle'
});

export const userImageState = atom({
  key: 'userImageState',
  default: null
});