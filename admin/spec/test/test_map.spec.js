import * as L from 'leaflet';
import initMap, { updateMap } from '../../src/js/map';
import { updateLatValue, updateLonValue, updateZoomValue } from '../../src/js/form';

// Mock des fonctions importées du module form
jest.mock('../src/js/form', () => ({
  updateLatValue: jest.fn(),
  updateLonValue: jest.fn(),
  updateZoomValue: jest.fn()
}));

describe("Module Map", function() {
  let mymap;
  
  // Mock du DOM pour créer un élément map
  beforeEach(function() {
    // Créer un élément div avec l'id 'map' pour que Leaflet puisse s'y attacher
    document.body.innerHTML = '<div id="map" style="height: 400px;"></div>';
    
    // Mock de certaines méthodes Leaflet
    L.map = jasmine.createSpy('map').and.returnValue({
      setView: jasmine.createSpy('setView'),
      getCenter: jasmine.createSpy('getCenter').and.returnValue({lat: 45.782, lng: 4.8656}),
      getZoom: jasmine.createSpy('getZoom').and.returnValue(19),
      on: jasmine.createSpy('on'),
      addLayer: jasmine.createSpy('addLayer')
    });
    
    L.tileLayer = jasmine.createSpy('tileLayer').and.returnValue({
      addTo: jasmine.createSpy('addTo')
    });
    
    L.marker = jasmine.createSpy('marker').and.returnValue({
      addTo: jasmine.createSpy('addTo').and.returnValue({
        bindPopup: jasmine.createSpy('bindPopup').and.returnValue({
          openPopup: jasmine.createSpy('openPopup')
        })
      })
    });
  });
  
  it("devrait initialiser la carte avec les valeurs par défaut", function() {
    mymap = initMap();
    
    expect(L.map).toHaveBeenCalledWith('map', {
      center: [45.782, 4.8656],
      zoom: 19
    });
    expect(L.tileLayer).toHaveBeenCalled();
    expect(updateLatValue).toHaveBeenCalled();
    expect(updateLonValue).toHaveBeenCalled();
    expect(updateZoomValue).toHaveBeenCalled();
  });

  it("devrait mettre à jour la carte avec de nouvelles coordonnées", function() {
    mymap = initMap();
    const newLat = 45.78;
    const newLng = 4.86;
    const zoom = 18;
    
    const result = updateMap([newLat, newLng], zoom);
    
    expect(mymap.setView).toHaveBeenCalledWith([newLat, newLng], zoom);
    expect(result).toBe(false); // La fonction devrait retourner false pour bloquer le rechargement de la page
  });

  it("devrait ajouter des gestionnaires d'événements à la carte", function() {
    mymap = initMap();
    
    // Vérifier que les événements sont configurés
    expect(mymap.on).toHaveBeenCalledWith('click', jasmine.any(Function));
    expect(mymap.on).toHaveBeenCalledWith('zoomend', jasmine.any(Function));
    expect(mymap.on).toHaveBeenCalledWith('moveend', jasmine.any(Function));
  });
});