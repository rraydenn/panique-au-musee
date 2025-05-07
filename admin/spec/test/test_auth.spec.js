describe("Authentification", function() {
  const script = document.createElement('script');
  script.type = 'module';
  script.src = '../../src/js/index.ts';
    beforeEach(function() {
      // Créer le formulaire de connexion
      document.body.innerHTML = `
        <form onsubmit="return authenticateAdmin();" action="admin.html" class="pure-form">
          <input type="password" id="pass" value="testPassword">
          <input type="submit" value="Login">
        </form>
      `;
      
      // Mock localStorage
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: jasmine.createSpy('getItem'),
          setItem: jasmine.createSpy('setItem')
        }
      });
      
      // Espionner les alertes et les console.log
      spyOn(window, 'alert');
      spyOn(console, 'log');
      spyOn(console, 'error');
      
      // Mock fetch pour les tests
      global.fetch = jasmine.createSpy('fetch');
    });
    
    it("devrait empêcher la soumission du formulaire si le mot de passe est vide", async function() {
      // Définir la valeur du mot de passe à vide
      document.getElementById('pass').value = '';
      
      // Appeler la fonction d'authentification
      const result = await window.authenticateAdmin;
      
      // Vérifier que fetch n'a pas été appelé
      expect(global.fetch).not.toHaveBeenCalled();
      
      // Vérifier qu'une alerte a été affichée
      expect(window.alert).toHaveBeenCalledWith('Veuillez entrer un mot de passe');
      
      // Vérifier que la fonction retourne false pour empêcher la soumission du formulaire
      expect(result).toBe(false);
    });
    
    it("devrait stocker le token dans localStorage en cas de succès", async function() {
      // Mock une réponse réussie avec un token dans les en-têtes
      global.fetch.and.returnValue(Promise.resolve({
        status: 204,
        headers: new Map([
          ['Authorization', 'Bearer test-token-123']
        ]),
        headers: {
          get: function(name) {
            if (name === 'Authorization') return 'Bearer test-token-123';
            return null;
          }
        }
      }));
      
      // Appeler la fonction d'authentification
      const result = await window.authenticateAdmin;
      
      // Vérifier que fetch a été appelé avec les bons paramètres
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8080/login',
        jasmine.objectContaining({
          method: 'POST',
          body: jasmine.stringContaining('testPassword')
        })
      );
      
      // Vérifier que le token a été stocké dans localStorage
      expect(localStorage.setItem).toHaveBeenCalledWith('adminToken', 'test-token-123');
      
      // Vérifier que la fonction retourne true pour permettre la navigation vers admin.html
      expect(result).toBe(true);
    });
    
    it("devrait rejeter l'authentification en cas d'échec", async function() {
      // Mock une réponse d'échec
      global.fetch.and.returnValue(Promise.resolve({
        status: 401,
        ok: false
      }));
      
      // Appeler la fonction d'authentification
      const result = await window.authenticateAdmin;
      
      // Vérifier qu'une alerte a été affichée pour l'échec d'authentification
      expect(window.alert).toHaveBeenCalledWith('Authentification échouée. Mot de passe incorrect.');
      
      // Vérifier que la fonction retourne false pour empêcher la navigation
      expect(result).toBe(false);
    });
    
    it("devrait gérer les erreurs réseau", async function() {
      // Mock une erreur réseau
      global.fetch.and.returnValue(Promise.reject(new Error('Network error')));
      
      // Appeler la fonction d'authentification
      const result = await window.authenticateAdmin;
      
      // Vérifier qu'une erreur a été journalisée
      expect(console.error).toHaveBeenCalledWith('Error during authentication:', jasmine.any(Error));
      
      // Vérifier qu'une alerte a été affichée
      expect(window.alert).toHaveBeenCalledWith('Erreur lors de l\'authentification. Vérifiez la console pour plus de détails.');
      
      // Vérifier que la fonction retourne false
      expect(result).toBe(false);
    });
  });