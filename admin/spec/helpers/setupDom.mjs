import { JSDOM } from 'jsdom';

// Simuler un DOM global
const dom = new JSDOM(`<!DOCTYPE html><html><body>
  <form id="loginForm">
    <input type="password" id="pass" value="admin123">
    <input type="submit" value="Valider">
  </form>
</body></html>`, {
  url: "http://localhost"
});

global.window = dom.window;
global.document = dom.window.document;
global.localStorage = dom.window.localStorage;
global.HTMLElement = dom.window.HTMLElement;
global.CustomEvent = dom.window.CustomEvent;
