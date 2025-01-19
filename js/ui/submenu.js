export function showSubmenu(pokemonData) {
  // Create submenu but start hidden
  const submenu = document.createElement('div');
  submenu.className = 'submenu hidden';
  
  // Create submenu content with placeholder data
  submenu.innerHTML = `
    <div class="submenu-grid">
      <div class="stat-box">
        <div class="stat-label">Name</div>
        <div class="stat-value">${pokemonData.name}</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Type</div>
        <div class="stat-value">${pokemonData.type}</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Height</div>
        <div class="stat-value">${pokemonData.height}</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Weight</div>
        <div class="stat-value">${pokemonData.weight}</div>
      </div>
    </div>
    <div class="description-box">
      <div class="description-title">Description</div>
      <div class="full-description">${pokemonData.description}</div>
    </div>
  `;
  
  // Append the submenu to the card container
  const cardContainer = document.getElementById('cardContainer');
  cardContainer.appendChild(submenu);
}