import map from './map';
import form from './form';
import GameService from './gameservice';
import '../css/style.css';

const mymap = map();
const myform = form(mymap);
const gameService = new GameService(mymap);

//Démarrer le service si l'utilisateur est authentifié
if(localStorage.getItem('adminToken')){
    gameService.startPolling();
}

// Exposer gameService pour l'utilisation depuis d'autres modules
(window as any).gameService = gameService; 
