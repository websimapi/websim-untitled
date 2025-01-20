import { initDB } from './db.js';
import { generateCard } from './cardGenerator.js';
import { setupEventListeners } from './eventListeners.js';

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  initDB();
  setupEventListeners();
});