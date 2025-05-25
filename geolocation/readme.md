# TP7 - Partie 1: Script indépendant de l'application

Sur téléphone, il faut que la page soit sécurisée pour pouvoir accéder à la localisation, autrement une erreur est renvoyée.  
Pour tester en hostant un serveur en local sur le pc, on a utilisé un script python ```python3 https-server.py```. Au préalable, on a créé un certificat server.pem ```openssl req -new -x509 -keyout server.pem -out server.pem -days 365 -nodes```.  
geolocation.html affiche les coordonnées et la précision, et leaflet-map.html affiche des coordonnées décidées sur Lyon avec la localisation au milieu de ces coordonnées.