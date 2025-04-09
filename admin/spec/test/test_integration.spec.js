import map from '../src/js/map';
import form from '../src/js/form';
import GameService from '../src/js/gameservice';
import { apiPath } from '../src/js/config';

describe("Application Admin", function() {
  let mockMap;
  let mockForm;
  let gameService;
  
  beforeEach(function() {
    // Créer les éléments nécessaires du DOM
    document.body.innerHTML = `
      <div id="map" style="height: 400px;"></div>
      <input id="lat" type="text" value="45.782">
      <input id="lon" type="text" value="4.8656">
      <input id="zoom" type="range" value="19">
      <span id="zoomValue"></span>
    `;
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jasmine.createSpy('getItem').and.returnValue('mock-token'),
        setItem: jasmine.createSpy('setItem')
      }
    });
    
    // Mock des modules
    mockMap = {
      setView: jasmine.createSpy('setView'),
      getBounds: jasmine.createSpy('getBounds'),
      getCenter: jasmine.createSpy('getCenter').and.returnValue({lat: 45.782, lng: 4.8656}),
      getZoom: jasmine.createSpy('getZoom').and.returnValue(19),
      on: jasmine.createSpy('on')
    };
    
    // Espionner les fonctions principales
    spyOn(window, 'map').and.returnValue(mockMap);
    spyOn(window, 'form');
    spyOn(window, 'GameService').and.callThrough();
  });
  
  it("devrait initialiser correctement l'application", function() {
    // Mock window.gameService pour le test d'exposition globale
    Object.defineProperty(window, 'gameService', {
      value: undefined,
      writable: true
    });
    
    // Charger le module index qui initialise l'application
    require('../src/js/index');
    
    // Vérifier que map, form et gameService ont été initialisés
    expect(window.map).toHaveBeenCalled();
    expect(window.form).toHaveBeenCalledWith(mockMap);
    expect(window.GameService).toHaveBeenCalledWith(mockMap);
    
    // Vérifier que gameService est exposé globalement
    expect(window.gameService).toBeDefined();
  });
  
  it("devrait démarrer le polling si l'utilisateur est authentifié", function() {
    // S'assurer que localStorage.getItem('adminToken') renvoie un token
    localStorage.getItem.and.returnValue('mock-token');
    
    // Créer une instance de GameService et espionner sa méthode startPolling
    gameService = new GameService(mockMap);
    spyOn(gameService, 'startPolling');
    
    // Exposer gameService globalement pour le test
    window.gameService = gameService;
    
    // Charger le module index
    require('../src/js/index');
    
    // Vérifier que startPolling a été appelé
    expect(gameService.startPolling).toHaveBeenCalled();
  });
  
  it("ne devrait pas démarrer le polling si l'utilisateur n'est pas authentifié", function() {
    // Simuler un utilisateur non authentifié
    localStorage.getItem.and.returnValue(null);
    
    // Créer une instance de GameService et espionner sa méthode startPolling
    gameService = new GameService(mockMap);
    spyOn(gameService, 'startPolling');
    
    // Exposer gameService globalement pour le test
    window.gameService = gameService;
    
    // Charger le module index
    require('../src/js/index');
    
    // Vérifier que startPolling n'a pas été appelé
    expect(gameService.startPolling).not.toHaveBeenCalled();
  });
});