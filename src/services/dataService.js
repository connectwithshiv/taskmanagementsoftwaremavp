// ============================================================================
// STORAGE MANAGER - Handles chunked storage for large datasets
// ============================================================================

const StorageManager = {
  save: (data) => {
    try {
      const storage = { categories: data.categories, deletedLogs: data.deletedLogs };
      const jsonData = JSON.stringify(storage);
      
      // Split data into chunks if it exceeds 1MB
      if (jsonData.length > 1000000) {
        const chunks = [];
        for (let i = 0; i < jsonData.length; i += 1000000) {
          chunks.push(jsonData.slice(i, i + 1000000));
        }
        
        // Clear old chunks
        Object.keys(window.localStorage).forEach(key => {
          if (key.startsWith('categoryData_chunk_')) {
            window.localStorage.removeItem(key);
          }
        });
        
        // Save new chunks
        chunks.forEach((chunk, index) => {
          window.localStorage.setItem(`categoryData_chunk_${index}`, chunk);
        });
        window.localStorage.setItem('categoryData_chunks', chunks.length.toString());
      } else {
        // Save as single entry if small enough
        window.localStorage.setItem('categoryData', jsonData);
        window.localStorage.removeItem('categoryData_chunks');
      }
    } catch (error) {
      console.error('Failed to save data:', error);
      alert('Failed to save data. Storage may be full.');
    }
  },
  
  load: () => {
    try {
      const chunks = window.localStorage.getItem('categoryData_chunks');
      let jsonData;
      
      if (chunks) {
        // Reconstruct data from chunks
        const chunkCount = parseInt(chunks);
        let fullData = '';
        for (let i = 0; i < chunkCount; i++) {
          fullData += window.localStorage.getItem(`categoryData_chunk_${i}`) || '';
        }
        jsonData = fullData;
      } else {
        // Load single entry
        jsonData = window.localStorage.getItem('categoryData');
      }
      
      if (jsonData) {
        const parsed = JSON.parse(jsonData);
        return { 
          categories: parsed.categories || [], 
          deletedLogs: parsed.deletedLogs || [] 
        };
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    }
    return { categories: [], deletedLogs: [] };
  }
};

export { StorageManager };