import socket

def get_local_ip():
    try:
        # Create a dummy socket connection to get local IP
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        s.close()
        return local_ip
    except Exception:
        return "127.0.0.1"

print(f"\n[IP CHECK] Your computer's active local IP address is: {get_local_ip()}")
print("Please ensure this matches c:\\ciro\\mobile-app\\src\\config.ts API_BASE_URL!\n")
