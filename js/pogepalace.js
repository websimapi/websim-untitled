const pogepalace = new WebsimSocket();

export async function sendToPoGePalace(cardData) {
  try {
    const response = await fetch(cardData.imageUrl);
    const blob = await response.blob();
    const file = new File([blob], `${cardData.name}.png`, { type: 'image/png' });
    const backupImageUrl = await websim.upload(file);
    
    // Update IndexDB with backup URL
    if (cardData.id) {
      const db = getDB();
      const transaction = db.transaction(['cards'], 'readwrite');
      const store = transaction.objectStore('cards');
      const request = store.get(cardData.id);
      
      request.onsuccess = () => {
        const record = request.result;
        if (record) {
          record.backupImageUrl = backupImageUrl;
          store.put(record);
        }
      };
    }
    
    const pogeRecord = await pogepalace.collection('pogemon').create({
      name: cardData.name,
      description: cardData.description,
      pogetype: cardData.type, 
      height: cardData.height, 
      weight: cardData.weight,
      imageUrl: cardData.imageUrl,
      backupImageUrl: backupImageUrl,
      origin_trainer: pogepalace.party.client.username
    });

    console.log('Created record:', pogeRecord);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const verificationRecords = await pogepalace.collection('pogemon')
      .filter({ id: pogeRecord.id })
      .getList();

    if (verificationRecords.length > 0) {
      console.log('Successfully verified PoGePalace record:', verificationRecords[0]);
    } else {
      console.warn('Warning: Could not verify PoGePalace record insertion');
    }
    
    return pogeRecord;
  } catch (error) {
    console.error('Error sending to PoGePalace:', error);
    throw error;
  }
}