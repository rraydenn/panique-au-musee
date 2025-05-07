describe("Module Map", function () {
  let mymap;

  beforeEach(function () {
    // Créer un élément DOM pour la carte
    document.body.innerHTML = '<div id="map" style="height: 400px;"></div>';

    // Mock de Leaflet
    global.L = {
      map: jasmine.createSpy('map').and.returnValue({
        setView: jasmine.createSpy('setView'),
        getCenter: jasmine.createSpy('getCenter').and.returnValue({ lat: 45.782, lng: 4.8656 }),
        getZoom: jasmine.createSpy('getZoom').and.returnValue(19),
        on: jasmine.createSpy('on'),
        addLayer: jasmine.createSpy('addLayer')
      }),
      tileLayer: jasmine.createSpy('tileLayer').and.returnValue({
        addTo: jasmine.createSpy('addTo')
      }),
      marker: jasmine.createSpy('marker').and.returnValue({
        addTo: jasmine.createSpy('addTo').and.returnValue({
          bindPopup: jasmine.createSpy('bindPopup').and.returnValue({
            openPopup: jasmine.createSpy('openPopup')
          })
        })
      })
    };

    // Espionner les fonctions importées du module form
    spyOn(window, 'updateLatValue').and.callFake(() => {});
    spyOn(window, 'updateLonValue').and.callFake(() => {});
    spyOn(window, 'updateZoomValue').and.callFake(() => {});
  });

  it("devrait initialiser la carte avec les valeurs par défaut", function () {
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

  it("devrait mettre à jour la carte avec de nouvelles coordonnées", function () {
    mymap = initMap();
    const newLat = 45.78;
    const newLng = 4.86;
    const zoom = 18;

    const result = updateMap([newLat, newLng], zoom);

    expect(mymap.setView).toHaveBeenCalledWith([newLat, newLng], zoom);
    expect(result).toBe(false);
  });

  it("devrait ajouter des gestionnaires d'événements à la carte", function () {
    mymap = initMap();

    expect(mymap.on).toHaveBeenCalledWith('click', jasmine.any(Function));
    expect(mymap.on).toHaveBeenCalledWith('zoomend', jasmine.any(Function));
    expect(mymap.on).toHaveBeenCalledWith('moveend', jasmine.any(Function));
  });
});
