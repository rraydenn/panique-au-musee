describe("GameService Fonctionnel", function() {
  let gameService;
  let mockMap;

  beforeEach(function() {
    // Reset localStorage
    localStorage.clear();
    
    // Create mock map
    mockMap = L.map('map');
    
    // Mock console
    spyOn(console, 'log').and.stub();
    spyOn(console, 'error').and.stub();
    
    // Mock fetch
    global.fetch = jasmine.createSpy('fetch').and.returnValue(
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ resources: [] })
      })
    );
  });

  it("devrait créer une instance de GameService", function() {
    gameService = new window.GameService(mockMap);
    
    expect(gameService).toBeDefined();
    expect(typeof gameService.startPolling).toBe('function');
    expect(typeof gameService.stopPolling).toBe('function');
  });

  it("devrait démarrer le polling avec un token valide", function() {
    localStorage.setItem('adminToken', 'Bearer mock-token');
    gameService = new window.GameService(mockMap);
    
    gameService.startPolling();
    
    expect(console.log).toHaveBeenCalledWith('Polling démarré');
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/game/resources',
      jasmine.objectContaining({
        headers: jasmine.objectContaining({
          'Authorization': 'Bearer Bearer mock-token'
        })
      })
    );
  });

  it("ne devrait pas démarrer le polling sans token", function() {
    gameService = new window.GameService(mockMap);
    
    gameService.startPolling();
    
    expect(console.error).toHaveBeenCalledWith("Pas de token d'authentification disponible");
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("devrait arrêter le polling", function() {
    localStorage.setItem('adminToken', 'Bearer mock-token');
    gameService = new window.GameService(mockMap);
    
    gameService.startPolling();
    gameService.stopPolling();
    
    expect(console.log).toHaveBeenCalledWith('Polling arrêté');
    expect(gameService.polling).toBe(false);
  });
});
