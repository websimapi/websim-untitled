import { initDB } from './db.js';
import { setupEventListeners } from './eventListeners.js';

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  initDB();
  setupEventListeners();
});