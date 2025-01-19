import { getTypeIcon, getTypeColor, handleHover, resetHover } from '../utils.js';

export function renderCard(cardData = null) {
  if (!cardData) {
    // If no card data is provided, render a default or empty card
    return;
  }

  // Create card inner structure with initial flipped state
  const cardInner = document.createElement('div');
  cardInner.className = 'card-inner flipped';
  
  cardInner.innerHTML = `
    <div class="card-front">
      <h2 class="pokemon-name">${cardData.name}</h2>
      <div class="card-image-container">
        <img class="pokemon-image" src="${cardData.imageUrl}" alt="Pokemon Image">
      </div>
      <div class="stats-container">
        <div class="type-wrapper"></div>
        <p class="pokemon-stats">${cardData.height} | ${cardData.weight}</p>
      </div>
      <div class="card-description">
        <p class="pokemon-description">${cardData.description}</p>
      </div>
    </div>
    <div class="card-back">
      <div class="card-back-design">
        <svg class="card-back-logo" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" stroke-width="2"/>
          <circle cx="50" cy="50" r="20" fill="currentColor"/>
          <line x1="50" y1="5" x2="50" y2="95" stroke="currentColor" stroke-width="2"/>
        </svg>
        <div class="card-back-pattern"></div>
      </div>
    </div>
  `;

  // Create and append Pokemon info elements
  const nameElement = cardInner.querySelector('.pokemon-name');
  nameElement.textContent = cardData.name;
  
  // Create stats container with new compact layout
  const statsContainer = cardInner.querySelector('.stats-container');
  
  const types = cardData.type.split('/');
  const typeIcons = types.map(type => {
    const typeDiv = document.createElement('div');
    typeDiv.className = `type-icon ${type.toLowerCase().trim()}`;
    typeDiv.innerHTML = getTypeIcon(type.trim());
    typeDiv.title = type.trim();
    return typeDiv;
  });
  
  const typeWrapper = statsContainer.querySelector('.type-wrapper');
  typeIcons.forEach(icon => typeWrapper.appendChild(icon));

  // Add the gradient classes based on both types
  const primaryType = types[0].toLowerCase().trim();
  const secondaryType = types[1] ? types[1].toLowerCase().trim() : primaryType;
  const cardFront = cardInner.querySelector('.card-front');
  
  // Remove any existing gradient classes
  cardFront.className = 'card-front';
  
  // Create custom gradient style
  const primaryColor = getTypeColor(primaryType);
  const secondaryColor = getTypeColor(secondaryType);
  cardFront.style.background = `linear-gradient(135deg, ${primaryColor}26, ${secondaryColor}26 70%)`;

  const statsElement = statsContainer.querySelector('.pokemon-stats');
  statsElement.textContent = `${cardData.height} | ${cardData.weight}`;
  
  const descElement = cardInner.querySelector('.pokemon-description');
  descElement.textContent = cardData.description;

  // Add hover effect
  cardInner.addEventListener('mousemove', handleHover);
  cardInner.addEventListener('mouseleave', resetHover);

  return cardInner;
}

export function loadCardToMain(cardData) {
  // Create a new card with the saved data
  const cardContainer = document.getElementById('cardContainer');
  
  // Remove existing card and submenu
  const existingCard = document.querySelector('.card');
  const existingSubmenu = document.querySelector('.submenu');
  if (existingCard) existingCard.remove();
  if (existingSubmenu) existingSubmenu.remove();

  // Create new card
  const card = document.createElement('div');
  card.className = 'card show';
  
  const cardInner = renderCard(cardData);
  
  card.appendChild(cardInner);
  
  // Create submenu but start hidden
  const submenu = document.createElement('div');
  submenu.className = 'submenu hidden';
  
  // Create submenu content with placeholder data
  submenu.innerHTML = `
    <div class="submenu-grid">
      <div class="stat-box">
        <div class="stat-label">Name</div>
        <div class="stat-value">${cardData.name}</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Type</div>
        <div class="stat-value">${cardData.type}</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Height</div>
        <div class="stat-value">${cardData.height}</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Weight</div>
        <div class="stat-value">${cardData.weight}</div>
      </div>
    </div>
    <div class="description-box">
      <div class="description-title">Description</div>
      <div class="full-description">${cardData.description}</div>
    </div>
  `;
  
  cardContainer.appendChild(submenu);

  // Add click handler with submenu toggle and auto-flip after mounting
  card.addEventListener('click', (e) => {
    const cardInner = e.currentTarget.querySelector('.card-inner');
    cardInner.classList.toggle('flipped');
    
    // Show/hide submenu based on card flip state
    if (!cardInner.classList.contains('flipped')) {
      setTimeout(() => {
        submenu.classList.remove('hidden');
      }, 400); // Half the flip animation duration
    } else {
      submenu.classList.add('hidden');
    }
  });

  // Auto flip the card after a short delay
  setTimeout(() => {
    const cardInner = card.querySelector('.card-inner');
    cardInner.classList.remove('flipped');
    setTimeout(() => {
      submenu.classList.remove('hidden');
    }, 400);
  }, 100);
}