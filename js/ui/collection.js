import { getAllCards, deleteCard } from '../db.js';
import { createMiniCard } from './miniCard.js';
import { showToast } from '../utils.js';
import { showConfirmDialog, showImportDialog } from './dialogs.js';

export function showCollection() {
  const viewer = document.querySelector('.collection-viewer') || createCollectionViewer();
  const grid = viewer.querySelector('.collection-grid');
  const tabsContainer = viewer.querySelector('.collection-tabs');
  
  try {
    const cards = await getAllCards();
    cards.sort((a, b) => b.timestamp - a.timestamp);
    
    // Get unique types from all cards
    const allTypes = new Set();
    cards.forEach(card => {
      card.type.split('/').forEach(type => {
        allTypes.add(type.trim());
      });
    });
    
    // Create type tabs
    tabsContainer.innerHTML = `
      <button class="type-tab" data-type="all">
        <span>ALL</span>
      </button>
      ${Array.from(allTypes).sort().map(type => `
        <button class="type-tab" data-type="${type}">
          <div class="type-icon ${type.toLowerCase()}">${getTypeIcon(type)}</div>
          <span>${type}</span>
        </button>
      `).join('')}
    `;

    let selectedTypes = new Set();
    let filterMode = 'single'; // 'single', 'or', 'and'
    
    // Add tab click handlers
    const tabs = tabsContainer.querySelectorAll('.type-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        const type = tab.dataset.type;
        
        if (e.ctrlKey || e.metaKey) {
          // CTRL/CMD click for AND filter (max 2)
          if (filterMode !== 'and') {
            selectedTypes.clear(); // Clear previous selections
            filterMode = 'and';
          }
          
          if (selectedTypes.has(type)) {
            selectedTypes.delete(type);
          } else if (selectedTypes.size < 2) {
            selectedTypes.add(type);
          }
          
        } else if (e.shiftKey) {
          // SHIFT click for OR filter
          filterMode = 'or';
          if (selectedTypes.has(type)) {
            selectedTypes.delete(type);
          } else {
            selectedTypes.add(type);
          }
          
        } else {
          // Normal click for single filter
          filterMode = 'single';
          selectedTypes.clear();
          selectedTypes.add(type);
        }

        // Update visual state of tabs
        tabs.forEach(t => {
          t.classList.remove('selected-single', 'selected-or', 'selected-and');
          if (selectedTypes.has(t.dataset.type)) {
            t.classList.add(`selected-${filterMode}`);
          }
        });
        
        // Apply filters
        if (type === 'all' && filterMode === 'single') {
          selectedTypes.clear();
        }
        
        displayFilteredCards(cards, Array.from(selectedTypes), filterMode);
      });
    });
    
    // Initial display of all cards
    displayFilteredCards(cards, [], 'single');
    
    viewer.classList.remove('hidden');
  } catch (error) {
    console.error('Error loading collection:', error);
  }
}

export function displayFilteredCards(cards, selectedTypes, filterMode) {
  const grid = document.querySelector('.collection-grid');
  grid.innerHTML = '';
  
  let filteredCards;
  
  if (selectedTypes.length === 0 || (selectedTypes.length === 1 && selectedTypes[0] === 'all')) {
    filteredCards = cards;
  } else if (filterMode === 'and') {
    filteredCards = cards.filter(card => 
      selectedTypes.every(type => card.type.includes(type))
    );
  } else { // 'single' or 'or'
    filteredCards = cards.filter(card => 
      selectedTypes.some(type => card.type.includes(type))
    );
  }
  
  if (filteredCards.length === 0) {
    grid.innerHTML = `
      <div class="no-cards-message">
        No Pogemons found matching the selected filters
      </div>
    `;
    return;
  }
  
  filteredCards.forEach(card => {
    const miniCard = createMiniCard(card);
    grid.appendChild(miniCard);
  });
}

export function createCollectionViewer() {
  const viewer = document.createElement('div');
  viewer.className = 'collection-viewer hidden';
  viewer.innerHTML = `
    <div class="collection-header">
      <div class="collection-header-title">
        <h2>Your PoGeFlex Collection</h2>
        <button class="import-btn" title="Import Collection">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" transform="rotate(180, 12, 12)"/>
          </svg>
        </button>
        <button class="export-btn" title="Export Collection">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
          </svg>
        </button>
        <input type="file" class="hidden-file-input" accept=".json">
      </div>
      <div class="collection-header-buttons">
        <button class="delete-mode-toggle" title="Toggle Delete Mode">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12z"/>
          </svg>
        </button>
        <button class="close-collection">×</button>
      </div>
    </div>
    <div class="collection-tabs">
      <button class="type-tab active" data-type="all">
        <span>ALL</span>
      </button>
    </div>
    <div class="collection-grid"></div>
  `;
  document.body.appendChild(viewer);

  // Add event listeners for the buttons
  const closeBtn = viewer.querySelector('.close-collection');
  const deleteToggle = viewer.querySelector('.delete-mode-toggle');
  const exportBtn = viewer.querySelector('.export-btn');
  const importBtn = viewer.querySelector('.import-btn');
  const fileInput = viewer.querySelector('.hidden-file-input');
  let deleteMode = false;

  closeBtn.addEventListener('click', () => {
    viewer.classList.add('hidden');
    deleteMode = false;
    deleteToggle.classList.remove('active');
    const cards = viewer.querySelectorAll('.mini-card');
    cards.forEach(card => card.classList.remove('delete-mode'));
  });

  deleteToggle.addEventListener('click', () => {
    deleteMode = !deleteMode;
    deleteToggle.classList.toggle('active');
    const cards = viewer.querySelectorAll('.mini-card');
    cards.forEach(card => {
      card.classList.toggle('delete-mode');
      
      // Remove existing click handlers
      const newCard = card.cloneNode(true);
      card.parentNode.replaceChild(newCard, card);
      
      // Add appropriate click handler based on mode
      if (deleteMode) {
        newCard.addEventListener('click', async (e) => {
          e.stopPropagation();
          const cardData = newCard.cardData;
          if (await showConfirmDialog(cardData)) {
            try {
              await deleteCard(cardData.id);
              newCard.remove();
              showToast(`${cardData.name} was released successfully!`);
            } catch (error) {
              console.error('Error deleting card:', error);
              showToast('Failed to release Pogemon', true);
            }
          }
        });
      } else {
        newCard.addEventListener('click', async (e) => {
          const palaceButton = e.target.closest('.palace-button');
          
          if (palaceButton) {
            e.stopPropagation(); // Prevent card load
            try {
              // await showPalaceDialog(newCard.cardData);
            } catch (error) {
              console.error('Failed to send to PoGePalace:', error);
            }
            return;
          }

          // loadCardToMain(newCard.cardData);
          viewer.classList.add('hidden');
        });
      }
      
      // Preserve the cardData
      newCard.cardData = card.cardData;
    });
  });

  exportBtn.addEventListener('click', async () => {
    try {
      const cards = await getAllCards();
      const exportData = {
        pogeflex: {
          version: 1,
          cards: cards,
          exported_at: new Date().toISOString()
        }
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pogeflex-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast('PoGeFlex collection exported successfully!');
    } catch (error) {
      console.error('Error exporting collection:', error);
      showToast('Failed to export collection', true);
    }
  });

  importBtn.addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // Validate the imported data structure
      if (!data.pogeflex || !Array.isArray(data.pogeflex.cards)) {
        throw new Error('Invalid file format');
      }

      // Show import options dialog
      const importChoice = await showImportDialog(data.pogeflex.cards.length);
      if (importChoice === null) {
        fileInput.value = '';
        return; // User cancelled
      }

      // Get existing cards to check for duplicates
      const existingCards = await getAllCards();
      let cardsToImport;
      
      if (importChoice === 'skip') {
        // Filter out exact duplicates
        cardsToImport = data.pogeflex.cards.filter(importCard => 
          !existingCards.some(existingCard => 
            existingCard.name === importCard.name &&
            existingCard.description === importCard.description &&
            existingCard.imageUrl === importCard.imageUrl
          )
        );
      } else {
        // Import all cards
        cardsToImport = data.pogeflex.cards;
      }

      // Import the cards
      const importPromises = cardsToImport.map(card => ({...card, id: null})); // Reset ID
      // const importPromises = cardsToImport.map(card => saveCard(card));
      // await Promise.all(importPromises);
      
      // Refresh the collection display
      const grid = viewer.querySelector('.collection-grid');
      grid.innerHTML = '';
      await showCollection();

      // Show success message
      const skippedCount = data.pogeflex.cards.length - cardsToImport.length;
      if (importChoice === 'skip' && skippedCount > 0) {
        showToast(`Imported ${cardsToImport.length} cards. Skipped ${skippedCount} duplicate(s).`);
      } else {
        showToast(`Successfully imported ${cardsToImport.length} cards!`);
      }
    } catch (error) {
      console.error('Error importing collection:', error);
      showToast('Failed to import collection: ' + error.message, true);
    }

    // Reset the file input
    fileInput.value = '';
  });

  return viewer;
}