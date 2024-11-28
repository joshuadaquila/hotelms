// public/preload.js
const { contextBridge, ipcRenderer } = require('electron');
console.log('Preload script loaded');

contextBridge.exposeInMainWorld('api', {
    executeQuery: (query, params) => ipcRenderer.invoke('execute-query', query, params),
    onQueryResult: (callback) => ipcRenderer.on('query-result', (event, result) => callback(result))
});
