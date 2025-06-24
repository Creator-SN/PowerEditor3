import Editor from './src/index.vue';
import { convertPlugin } from '../install.ts';

export const PowerEditor = convertPlugin(Editor);
export default PowerEditor;