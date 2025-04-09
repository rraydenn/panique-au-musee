import GameService from '../src/js/gameservice';
import * as L from 'leaflet';
import { apiPath, refreshInterval } from '../src/js/config';

describe("GameService", function() {
  let gameService;
  let mockMap;
  
  beforeEach(function() {
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jasmine.createSpy('getItem').and.returnValue('mock-token'),
        setItem: jasmine.createSpy('setItem')
      }
    });
    
    // Mock console methods
    spyOn(console, 'log');
    spyOn(console, 'error');
    
    // Mock setTimeout et setInterval
    jasmine.clock().install();
    
    // Mock Leaflet map et marker
    mockMap = {
      setView: jasmine.createSpy('setView')
    };
    
    L.marker = jasmine.createSpy('marker').and.returnValue({
      setLatLng: jasmine.createSpy('setLatLng'),
      getPopup: jasmine.createSpy('getPopup').and.returnValue({
        setContent: jasmine.createSpy('setContent')
      }),
      bindPopup: jasmine.createSpy('bindPopup').and.returnValue({
        addTo: jasmine.createSpy('addTo')
      }),
      remove: jasmine.createSpy('remove')
    });
    
    // Mock fetch
    global.fetch = jasmine.createSpy('fetch').and.returnValue(
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          resources: [
            {
              id: '1',
              position: { lat: 45.78, lon: 4.86 },
              type: 'ARTIFACT'
            },
            {
              id: '2',
              position: { lat: 45.79, lon: 4.87 },
              type: 'PLAYER'
            }
          ]
        })
      })
    );
    
    // Créer l'instance du service
    gameService = new GameService(mockMap);
  });
  
  afterEach(function() {
    jasmine.clock().uninstall();
  });
  
  it("devrait démarrer le polling des ressources", function() {
    gameService.startPolling();
    
    // Vérifier que fetch a été appelé
    expect(global.fetch).toHaveBeenCalledWith(
      `${apiPath}/resources`,
      jasmine.objectContaining({
        headers: jasmine.objectContaining({
          'Authorization': 'Bearer mock-token'
        })
      })
    );
    
    // Vérifier que le polling est configuré avec le bon intervalle
    expect(global.fetch.calls.count()).toBe(1);
    
    // Avancer le temps pour déclencher un autre appel de polling
    jasmine.clock().tick(refreshInterval + 100);
    
    expect(global.fetch.calls.count()).toBe(2);
  });
  
  it("devrait arrêter le polling quand stopPolling est appelé", function() {
    gameService.startPolling();
    gameService.stopPolling();
    
    // Premier appel fetch devrait avoir eu lieu
    expect(global.fetch.calls.count()).toBe(1);
    
    // Avancer le temps - aucun nouvel appel ne devrait se produire
    jasmine.clock().tick(refreshInterval + 100);
    
    expect(global.fetch.calls.count()).toBe(1);
    expect(console.log).toHaveBeenCalledWith('Polling arrêté');
  });
  
  it("devrait modifier la fréquence de polling avec setPollingDelay", function() {
    gameService.startPolling();
    
    // Modifier le délai de polling
    const newDelay = 10000;
    gameService.setPollingDelay(newDelay);
    
    // Le polling devrait être redémarré
    expect(console.log.calls.argsFor(1)[0]).toContain('Polling démarré');
    
    // Avancer le temps mais pas assez pour déclencher le nouvel intervalle
    jasmine.clock().tick(refreshInterval + 100);
    expect(global.fetch.calls.count()).toBe(2);
    
    // Avancer le temps pour atteindre le nouveau délai
    jasmine.clock().tick(newDelay);
    expect(global.fetch.calls.count()).toBe(3);
  });
  
  it("devrait mettre à jour les ressources sur la carte", async function() {
    gameService.startPolling();
    
    // Attendre que les promesses soient résolues
    await Promise.resolve();
    
    // Il devrait y avoir des marqueurs créés pour les ressources
    expect(L.marker).toHaveBeenCalledWith([45.78, 4.86]);
    expect(L.marker).toHaveBeenCalledWith([45.79, 4.87]);
    
    // Un message de log devrait être affiché avec le nombre de ressources
    expect(console.log).toHaveBeenCalledWith('2 ressources mises à jour sur la carte');
  });
  
  it("ne devrait pas démarrer le polling si aucun token n'est disponible", function() {
    // Simuler un localStorage sans token
    spyOn(localStorage, 'getItem').and.returnValue(null);
    
    gameService.startPolling();
    
    // Vérifier que fetch n'a pas été appelé
    expect(global.fetch).not.toHaveBeenCalled();
    
    // Vérifier qu'une erreur a été journalisée
    expect(console.error).toHaveBeenCalledWith("Pas de token d'authentification disponible");
  });
});