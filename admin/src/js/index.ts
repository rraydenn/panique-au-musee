declare global {
    interface Window {
      authenticateAdmin: () => Promise<boolean>;
    }
  }

  window.authenticateAdmin = async function (): Promise<boolean>{
        // Get the password from the form
        const passwordInput = document.getElementById("pass") as HTMLInputElement | null;

        if (!passwordInput) {
          alert("Champ de mot de passe introuvable.");
          return false;
        }
      
        const password = passwordInput.value;
        if (!password) {
          alert("Veuillez entrer un mot de passe");
          return false;
        }
        
        try {
            // Send authentication request to Spring Boot server
            const response = await fetch("https://192.168.75.94:8443/users/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Origin": window.location.origin
                },
                body: JSON.stringify({ 
                    login: "admin",
                    password: password 
                })
            });
            
            if (response.status === 204) {
                // Authentication successful - get the token from header
                const authHeader = response.headers.get("Authorization");
                if (authHeader && authHeader.startsWith("Bearer ")) {
                    // Store the token in localStorage for later use
                    const token = authHeader//.substring(7); // Remove 'Bearer ' prefix
                    localStorage.setItem("adminToken", token);
                    console.log("Authentication successful, token stored");
                    return true; // Allow form submission to proceed to admin.html
                }
            }
            
            // Authentication failed
            alert("Authentification échouée. Mot de passe incorrect.");
            return false; // Prevent form submission
            
        } catch (error) {
            console.error("Error during authentication:", error);
            alert("Erreur lors de l'authentification. Vérifiez la console pour plus de détails.");
            return false; // Prevent form submission
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        const form = document.getElementById("loginForm") as HTMLFormElement | null;
        if (form) {
            form.addEventListener("submit", async (event) => {
            event.preventDefault(); // ⛔ empêche le rechargement
            await window.authenticateAdmin(); // ⬅️ appelle ta fonction
            });
        }
    });

    // Vérifier l'authentification et démarrer le polling
    // document.addEventListener('DOMContentLoaded', function() {
    //     if(window.location.pathname.includes('admin.html')) {
    //         const token = localStorage.getItem('adminToken');
        
    //         if (!token) {
    //             // Rediriger vers la page de connexion si non authentifié
    //             window.location.href = 'index.html';
    //         } else {
    //             // Démarrer le polling des ressources si gameService est disponible
    //             if (window.gameService) {
    //                 window.gameService.startPolling();
    //                 console.log('Polling des ressources démarré');
    //             } else {
    //                 console.error('GameService non disponible');
    //             }
    //         }
    //     }
        
    // });

    export {};