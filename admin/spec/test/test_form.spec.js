jest.mock('../../src/js/map', () => ({
  updateMap: jest.fn()
}));

import initListeners from '../../src/js/form.ts';
import { updateLatValue, updateLonValue, updateZoomValue } from '../../src/js/mapState.ts';
import { apiPath } from '../../src/js/config.ts';


// Mock pour fetch
global.fetch = jest.fn();

describe("Module Form", function() {
  let mockMap;
  
  beforeEach(function() {
    // Reset des mocks
    jest.resetAllMocks();
    
    // Créer les éléments DOM nécessaires pour les tests
    document.body.innerHTML = `
      <input id="lat" type="text" value="45.782">
      <input id="lon" type="text" value="4.8656">
      <input id="zoom" type="range" value="19">
      <span id="zoomValue"></span>
      <input id="lat1" type="text">
      <input id="lon1" type="text">
      <input id="lat2" type="text">
      <input id="lon2" type="text">
      <input id="ttl" type="number" value="60">
      <button id="setZrrButton">Set</button>
      <button id="sendZrrButton">Send</button>
      <button id="setTtlButton">Set</button>
    `;
    
    // Mock de l'objet map pour les tests
    mockMap = {
      getBounds: jasmine.createSpy('getBounds').and.returnValue({
        getSouthWest: jasmine.createSpy('getSouthWest').and.returnValue({lat: 45.78, lng: 4.86}),
        getNorthEast: jasmine.createSpy('getNorthEast').and.returnValue({lat: 45.79, lng: 4.87})
      }),
      getCenter: jasmine.createSpy('getCenter').and.returnValue({lat: 45.782, lng: 4.8656}),
      getZoom: jasmine.createSpy('getZoom').and.returnValue(19)
    };
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jasmine.createSpy('getItem').and.returnValue('mock-token'),
        setItem: jasmine.createSpy('setItem')
      }
    });
    
    // Mock pour fetch avec une réponse réussie par défaut
    global.fetch.mockImplementation(() => 
      Promise.resolve({
        ok: true,
        status: 200,
        text: () => Promise.resolve('Success'),
        json: () => Promise.resolve({})
      })
    );
  });
  
  it("devrait mettre à jour les valeurs des champs de formulaire", function() {
    // Tests des fonctions de mise à jour des valeurs de formulaire
    updateLatValue(45.12345);
    expect(document.getElementById('lat').value).toBe('45.123450');
    
    updateLonValue(4.12345);
    expect(document.getElementById('lon').value).toBe('4.123450');
    
    updateZoomValue(15);
    expect(document.getElementById('zoom').value).toBe('15');
    expect(document.getElementById('zoomValue').textContent).toBe(' (15)');
  });
  
  it("devrait initialiser les listeners d'événements", function() {
    // Espionner les événements addEventListener
    const originalAddEventListener = document.addEventListener;
    const mockAddEventListener = jasmine.createSpy('addEventListener');
    document.addEventListener = mockAddEventListener;
    Element.prototype.addEventListener = mockAddEventListener;
    
    initListeners(mockMap);
    
    // Restaurer la fonction originale
    document.addEventListener = originalAddEventListener;
    
    // Vérifier qu'un certain nombre d'écouteurs ont été définis
    expect(mockAddEventListener.calls.count()).toBeGreaterThan(0);
  });
  
  it("devrait définir la ZRR à partir des limites de la carte", function() {
    initListeners(mockMap);
    
    // Simuler un clic sur le bouton setZrrButton
    document.getElementById('setZrrButton').click();
    
    // Vérifier que les valeurs du formulaire ont été mises à jour
    expect(mockMap.getBounds).toHaveBeenCalled();
    expect(document.getElementById('lat1').value).not.toBe('');
    expect(document.getElementById('lon1').value).not.toBe('');
    expect(document.getElementById('lat2').value).not.toBe('');
    expect(document.getElementById('lon2').value).not.toBe('');
  });
  
  it("devrait envoyer la ZRR au serveur quand on clique sur Send", async function() {
    // Configurer les valeurs de ZRR
    document.getElementById('lat1').value = '45.78';
    document.getElementById('lon1').value = '4.86';
    document.getElementById('lat2').value = '45.79';
    document.getElementById('lon2').value = '4.87';
    
    initListeners(mockMap);
    
    // Cliquer sur le bouton d'envoi
    document.getElementById('sendZrrButton').click();
    
    // Attendre que les promesses soient résolues
    await new Promise(process.nextTick);
    
    // Vérifier que fetch a été appelé avec les bons paramètres
    expect(fetch).toHaveBeenCalledWith(`${apiPath}/zrr`, jasmine.objectContaining({
      method: 'POST',
      headers: jasmine.objectContaining({
        'Authorization': 'Bearer mock-token'
      }),
      body: jasmine.any(String)
    }));
  });
  
  it("devrait mettre à jour le TTL lorsque le bouton est cliqué", async function() {
    initListeners(mockMap);
    
    // Définir une valeur TTL
    document.getElementById('ttl').value = '120';
    
    // Cliquer sur le bouton setTtl
    document.getElementById('setTtlButton').click();
    
    // Attendre que les promesses soient résolues
    await new Promise(process.nextTick);
    
    // Vérifier que fetch a été appelé avec les bons paramètres
    expect(fetch).toHaveBeenCalledWith(`${apiPath}/ttl`, jasmine.objectContaining({
      method: 'POST',
      headers: jasmine.objectContaining({
        'Authorization': 'Bearer mock-token'
      }),
      body: jasmine.stringContaining('120')
    }));
  });
});