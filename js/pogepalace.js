const pogepalace = new WebsimSocket();

export async function sendToPoGePalace(cardData) {
  try {
    const response = await fetch(cardData.imageUrl);
    const blob = await response.blob();
    const file = new File([blob], `${cardData.name}.png`, { type: 'image/png' });
    const backupImageUrl = await websim.upload(file);
    
    // Create record
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

    // Verify record creation
    console.log('Created record:', pogeRecord);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const verificationRecords = await pogepalace.collection('pogemon')
      .filter({ id: pogeRecord.id })
      .getList();

    if (verificationRecords.length > 0) {
      console.log('Successfully verified PoGePalace record:', verificationRecords[0]);
      return pogeRecord;
    } else {
      throw new Error('Failed to verify record insertion');
    }
  } catch (error) {
    console.error('Error sending to PoGePalace:', error);
    throw error;
  }
}