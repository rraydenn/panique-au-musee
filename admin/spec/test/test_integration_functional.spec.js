describe("Intégration Application Admin", function() {
  
  beforeEach(function() {
    // Reset DOM
    const passInput = document.getElementById('pass');
    const latInput = document.getElementById('lat');
    const lonInput = document.getElementById('lon');
    
    if (passInput) passInput.value = '';
    if (latInput) latInput.value = '45.782';
    if (lonInput) lonInput.value = '4.8656';
    
    // Reset localStorage
    localStorage.clear();
    
    // Mock fetch
    global.fetch = jasmine.createSpy('fetch');
    
    // Mock alert
    spyOn(global, 'alert').and.stub();
  });

  it("devrait permettre un workflow complet d'authentification et gestion", async function() {
    // 1. Authentification
    document.getElementById('pass').value = 'admin123';
    global.fetch.and.returnValue(Promise.resolve({
      status: 204,
      headers: {
        get: (name) => name === 'Authorization' ? 'Bearer test-token' : null
      }
    }));
    
    const authResult = await window.authenticateAdmin();
    expect(authResult).toBe(true);
    // Le token est stocké avec "Bearer " inclus
    expect(localStorage.getItem('adminToken')).toBe('Bearer test-token');
    
    // 2. Initialisation de la carte
    const map = window.initMap();
    expect(map).toBeDefined();
    
    // 3. Mise à jour des coordonnées
    window.updateLatValue(45.123);
    window.updateLonValue(4.567);
    expect(document.getElementById('lat').value).toBe('45.123000');
    expect(document.getElementById('lon').value).toBe('4.567000');
    
    // 4. GameService
    const gameService = new window.GameService(map);
    spyOn(console, 'log');
    
    gameService.startPolling();
    expect(console.log).toHaveBeenCalledWith('Polling démarré');
  });

  it("devrait gérer l'absence d'authentification", function() {
    const gameService = new window.GameService(L.map('map'));
    spyOn(console, 'error');
    
    gameService.startPolling();
    expect(console.error).toHaveBeenCalledWith("Pas de token d'authentification disponible");
  });

  it("devrait valider la présence des éléments DOM", function() {
    expect(document.getElementById('pass')).toBeDefined();
    expect(document.getElementById('lat')).toBeDefined();
    expect(document.getElementById('lon')).toBeDefined();
    expect(document.getElementById('map')).toBeDefined();
  });

  it("devrait avoir les fonctions globales disponibles", function() {
    expect(typeof window.authenticateAdmin).toBe('function');
    expect(typeof window.initMap).toBe('function');
    expect(typeof window.updateLatValue).toBe('function');
    expect(typeof window.updateLonValue).toBe('function');
    expect(typeof window.GameService).toBe('function');
  });
});
