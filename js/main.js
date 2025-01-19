import { initDB } from './db.js';
import { setupEventListeners } from './eventListeners.js';

document.addEventListener('DOMContentLoaded', () => {
  initDB();
  setupEventListeners();
});