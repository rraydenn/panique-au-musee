describe("Tests Fonctionnels Base", function() {
  
  it("devrait avoir un DOM fonctionnel", function() {
    expect(document).toBeDefined();
    expect(document.getElementById('pass')).toBeDefined();
    expect(document.getElementById('lat')).toBeDefined();
    expect(document.getElementById('lon')).toBeDefined();
    expect(document.getElementById('map')).toBeDefined();
  });

  it("devrait avoir localStorage mockée", function() {
    localStorage.setItem('test', 'value');
    expect(localStorage.getItem('test')).toBe('value');
    
    localStorage.clear();
    expect(localStorage.getItem('test')).toBe(null);
  });

  it("devrait avoir Leaflet mocké", function() {
    expect(typeof L.map).toBe('function');
    expect(typeof L.marker).toBe('function');
    expect(typeof L.tileLayer).toBe('function');
    
    const map = L.map('map');
    expect(map).toBeDefined();
    expect(typeof map.setView).toBe('function');
  });

  it("devrait avoir les fonctions globales", function() {
    expect(typeof window.authenticateAdmin).toBe('function');
    expect(typeof window.updateLatValue).toBe('function');
    expect(typeof window.updateLonValue).toBe('function');
    expect(typeof window.updateZoomValue).toBe('function');
    expect(typeof window.initMap).toBe('function');
    expect(typeof window.GameService).toBe('function');
  });

  it("devrait pouvoir appeler updateLatValue", function() {
    window.updateLatValue(45.123456);
    expect(document.getElementById('lat').value).toBe('45.123456');
  });

  it("devrait pouvoir créer une carte", function() {
    const map = window.initMap();
    expect(map).toBeDefined();
    expect(typeof map.setView).toBe('function');
  });

  it("devrait pouvoir créer GameService", function() {
    const map = L.map('map');
    const gameService = new window.GameService(map);
    expect(gameService).toBeDefined();
    expect(typeof gameService.startPolling).toBe('function');
    expect(typeof gameService.stopPolling).toBe('function');
  });

  it("devrait avoir alert mocké", function() {
    spyOn(global, 'alert');
    global.alert('test');
    expect(global.alert).toHaveBeenCalledWith('test');
  });
});
