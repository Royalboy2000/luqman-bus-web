import subprocess
import sys
import os
import signal

# Configuration
BACKEND_DIR = os.path.join(os.getcwd(), "truck-web", "server")
FRONTEND_DIR = os.path.join(os.getcwd(), "truck-web")

processes = []

def get_port(prompt, default):
    try:
        user_input = input(f"{prompt} (default {default}): ").strip()
        if not user_input:
            return default
        return int(user_input)
    except ValueError:
        print(f"Invalid input. Using default {default}.")
        return default

def run_command(command, cwd):
    print(f"Executing: {command} in {cwd}")
    result = subprocess.run(command, cwd=cwd, shell=True, check=True)
    return result

def start_app(port):
    print(f"Starting FleetOps on port {port}...")
    env = os.environ.copy()
    env["PORT"] = str(port)
    # Backend serves frontend from ../../dist
    proc = subprocess.Popen(["npm", "run", "start"], cwd=BACKEND_DIR, env=env, shell=True)
    processes.append(proc)
    return proc

def cleanup(signum, frame):
    print("\nShutting down FleetOps...")
    for proc in processes:
        try:
            if sys.platform == "win32":
                subprocess.run(["taskkill", "/F", "/T", "/PID", str(proc.pid)])
            else:
                os.killpg(os.getpgid(proc.pid), signal.SIGTERM)
        except:
            proc.terminate()
    sys.exit(0)

if sys.platform != "win32":
    signal.signal(signal.SIGINT, cleanup)
    signal.signal(signal.SIGTERM, cleanup)

def main():
    print("=== FleetOps Production Orchestrator ===")

    port = get_port("Enter port to serve the application", 3000)

    try:
        # 1. Install Backend Dependencies
        print("\n--- Installing Backend Dependencies ---")
        run_command("npm install", BACKEND_DIR)

        # 2. Seed Database if not exists
        db_path = os.path.join(BACKEND_DIR, "fleetops.sqlite")
        if not os.path.exists(db_path):
            print("\n--- Initializing Database ---")
            run_command("npm run seed", BACKEND_DIR)
        else:
            print("\n--- Database already exists, skipping seed ---")

        # 3. Install Frontend Dependencies
        print("\n--- Installing Frontend Dependencies ---")
        run_command("npm install", FRONTEND_DIR)

        # 4. Build Frontend
        print("\n--- Building Frontend ---")
        run_command("npm run build", FRONTEND_DIR)

        # 5. Start Application
        start_app(port)

        print(f"\nFleetOps is running at http://localhost:{port}")
        print("Press Ctrl+C to stop.")

        # Keep the script running
        processes[0].wait()

    except subprocess.CalledProcessError as e:
        print(f"\nError during execution: {e}")
        sys.exit(1)
    except KeyboardInterrupt:
        cleanup(None, None)
    except Exception as e:
        print(f"\nUnexpected error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    if sys.platform != "win32":
        # Create a new process group to manage child processes better
        os.setpgrp()
    main()
