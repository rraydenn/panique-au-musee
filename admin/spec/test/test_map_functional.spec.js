describe("Carte Fonctionnelle", function() {
  
  beforeEach(function() {
    // Reset DOM values
    const latInput = document.getElementById('lat');
    const lonInput = document.getElementById('lon');
    const zoomInput = document.getElementById('zoom');
    const zoomValue = document.getElementById('zoomValue');
    
    if (latInput) latInput.value = '45.782';
    if (lonInput) lonInput.value = '4.8656';
    if (zoomInput) zoomInput.value = '19';
    if (zoomValue) zoomValue.textContent = '';
  });

  it("devrait initialiser la carte", function() {
    const map = window.initMap();
    
    expect(map).toBeDefined();
    expect(typeof map.setView).toBe('function');
  });

  it("devrait mettre à jour la latitude", function() {
    window.updateLatValue(45.123456);
    
    expect(document.getElementById('lat').value).toBe('45.123456');
  });

  it("devrait mettre à jour la longitude", function() {
    window.updateLonValue(4.987654);
    
    expect(document.getElementById('lon').value).toBe('4.987654');
  });

  it("devrait mettre à jour le zoom", function() {
    window.updateZoomValue(15);
    
    expect(document.getElementById('zoom').value).toBe('15');
    expect(document.getElementById('zoomValue').textContent).toBe(' (15)');
  });

  it("devrait formater les coordonnées avec la bonne précision", function() {
    window.updateLatValue(45.1);
    window.updateLonValue(4.9);
    
    expect(document.getElementById('lat').value).toBe('45.100000');
    expect(document.getElementById('lon').value).toBe('4.900000');
  });
});
