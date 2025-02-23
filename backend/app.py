from flask import Flask, jsonify, request
from flask_cors import CORS  # Import CORS
import psutil
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/api/processes', methods=['GET'])
def get_processes():
    processes = list(set(proc.info['name'] for proc in psutil.process_iter(attrs=['name']) if proc.info['name']))
    return jsonify(processes)

@app.route('/api/kill', methods=['POST'])
def kill_process():
    data = request.json
    process_name = data.get("name")
    
    for process in psutil.process_iter(attrs=['pid', 'name']):
        if process.info['name'] == process_name:
            try:
                os.kill(process.info['pid'], 9)
                return jsonify({"message": f"{process_name} terminated"}), 200
            except Exception as e:
                return jsonify({"error": str(e)}), 500

    return jsonify({"error": "Process not found"}), 404

if __name__ == '__main__':
    app.run(debug=True)