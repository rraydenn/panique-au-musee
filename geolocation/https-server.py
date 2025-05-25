import http.server
import ssl
import socketserver
import os

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        super().end_headers()

PORT = 8443
Handler = MyHTTPRequestHandler

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    context.load_cert_chain('server.pem')

    httpd.socket = context.wrap_socket(httpd.socket, server_side=True)

    print(f"HTTPS Server Running on https://localhost:{PORT}")
    print(f"Access from phone: https://<your-ip-address>:{PORT}")
    print("Note: You'll need to accept the security warning on your phone.")

    httpd.serve_forever()