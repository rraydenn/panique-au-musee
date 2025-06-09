describe("Authentification Fonctionnelle", function() {
  
  beforeEach(function() {
    // Reset DOM
    const passInput = document.getElementById('pass');
    if (passInput) passInput.value = '';
    
    // Reset localStorage
    localStorage.clear();
    
    // Reset mocks - spyOn global alert car le code l'utilise directement
    spyOn(global, 'alert').and.stub();
    
    // Mock fetch
    global.fetch = jasmine.createSpy('fetch');
  });

  it("devrait empêcher la connexion avec un mot de passe vide", async function() {
    const passInput = document.getElementById('pass');
    passInput.value = '';
    
    const result = await window.authenticateAdmin();
    
    expect(global.alert).toHaveBeenCalledWith('Veuillez entrer un mot de passe');
    expect(result).toBe(false);
  });

  it("devrait réussir l'authentification avec un mot de passe valide", async function() {
    const passInput = document.getElementById('pass');
    passInput.value = 'admin123';
    
    global.fetch.and.returnValue(Promise.resolve({
      status: 204,
      headers: {
        get: jasmine.createSpy('get').and.callFake((name) => {
          return name === 'Authorization' ? 'Bearer test-token' : null;
        })
      }
    }));
    
    const result = await window.authenticateAdmin();
    
    // Le vrai code appelle l'URL du serveur Spring Boot
    expect(global.fetch).toHaveBeenCalledWith(
      'https://192.168.75.94:8443/users/login',
      jasmine.objectContaining({
        method: 'POST',
        body: jasmine.stringContaining('admin123')
      })
    );
    
    // Le vrai code stocke le token avec "Bearer " inclus
    expect(localStorage.getItem('adminToken')).toBe('Bearer test-token');
    expect(result).toBe(true);
  });

  it("devrait gérer les erreurs d'authentification", async function() {
    const passInput = document.getElementById('pass');
    passInput.value = 'wrongpassword';
    
    global.fetch.and.returnValue(Promise.resolve({
      status: 401,
      headers: { get: () => null }
    }));
    
    const result = await window.authenticateAdmin();
    
    expect(global.alert).toHaveBeenCalledWith('Authentification échouée. Mot de passe incorrect.');
    expect(result).toBe(false);
  });

  it("devrait gérer les erreurs réseau", async function() {
    const passInput = document.getElementById('pass');
    passInput.value = 'admin123';
    
    global.fetch.and.returnValue(Promise.reject(new Error('Network error')));
    
    const result = await window.authenticateAdmin();
    
    expect(global.alert).toHaveBeenCalledWith('Erreur lors de l\'authentification. Vérifiez la console pour plus de détails.');
    expect(result).toBe(false);
  });
});
