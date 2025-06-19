import { apiSpringBootPath } from './config';
import '../css/style.css'

declare global {
    interface Window {
      authenticateAdmin: () => Promise<boolean>;
    }
    namespace NodeJS {
        interface ProcessEnv {
            NODE_ENV: 'development' | 'production';
        }
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
            const response = await fetch(`${apiSpringBootPath}/login`, {
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
            event.preventDefault(); // empêche le rechargement
            const success = await window.authenticateAdmin(); // // appelle de la fonction de login et récupère le booléen
            if (success) {
                window.location.href = "admin.html"; // redirige si succès
            }
            });
        }
    });

    export {};