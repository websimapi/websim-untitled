export async function getPokemonDescription() {
  try {
    const response = await fetch('/api/ai_completion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        prompt: `Generate a creative description for a completely new, unique Pogemon...`,
        data: ""
      }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error fetching Pogemon description:', error);
    return {
      name: 'Error',
      description: 'Failed to generate Pogemon description',
      type: 'Unknown',
      height: 'Unknown',
      weight: 'Unknown'
    };
  }
}

export async function generatePokemonImage(description) {
  try {
    const response = await fetch('/api/ai_completion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        prompt: `Generate a unique image URL for a cartoon Pogemon...`,
        data: description
      }),
    });
    const data = await response.json();
    return data.imageUrl;
  } catch (error) {
    console.error('Error generating Pogemon image:', error);
    return null;
  }
}