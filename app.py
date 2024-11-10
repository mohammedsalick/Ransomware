from flask import Flask, jsonify, request, render_template
from flask_cors import CORS
import os
import time
import random
import shutil
import threading
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from google.generativeai import GenerativeModel
import google.generativeai as genai

app = Flask(__name__)
CORS(app)

# Global variables to store test results and status
test_results = []
is_running = False

# Add after Flask initialization
GOOGLE_API_KEY = "you_google_api"
genai.configure(api_key=GOOGLE_API_KEY)
model = GenerativeModel('gemini-1.5-pro')

def run_test(test_id, test_dir):
    global test_results, is_running
    
    try:
        os.makedirs(test_dir, exist_ok=True)
        
        def create_file_with_content(filename, content):
            filepath = os.path.join(test_dir, filename)
            with open(filepath, 'wb') as f:
                f.write(content)
            
            # Check if file is suspicious and quarantine if necessary
            if is_suspicious_file(filepath):
                quarantine_path = move_to_quarantine(filepath)
                test_results.append({
                    'id': test_id,
                    'name': f"Test {test_id}",
                    'status': f"Suspicious file quarantined: {filepath} -> {quarantine_path}",
                    'timestamp': time.strftime('%H:%M:%S')
                })
            return filepath

        # Test 1: Rapid file creation
        if test_id == 1:
            for i in range(10):
                content = random.randbytes(1024 * 100)
                filepath = create_file_with_content(f"test_file_{i}.txt", content)
                test_results.append({
                    'id': test_id,
                    'name': "Rapid file creation",
                    'status': f"Created file: {filepath}",
                    'timestamp': time.strftime('%H:%M:%S')
                })
                time.sleep(0.2)

        # Test 2: Suspicious extensions
        elif test_id == 2:
            suspicious_extensions = ['.encrypted', '.crypto', '.locked', '.wannacry', '.cerber']
            for ext in suspicious_extensions:
                content = random.randbytes(1024 * 100)
                filepath = create_file_with_content(f"important_doc{ext}", content)
                test_results.append({
                    'id': test_id,
                    'name': "Suspicious extensions",
                    'status': f"Created suspicious file: {filepath}",
                    'timestamp': time.strftime('%H:%M:%S')
                })
                time.sleep(0.5)

        # Test 3: High entropy files
        elif test_id == 3:
            for i in range(3):
                content = random.randbytes(1024 * 1024)
                filepath = create_file_with_content(f"high_entropy_file_{i}.dat", content)
                test_results.append({
                    'id': test_id,
                    'name': "High entropy files",
                    'status': f"Created high entropy file: {filepath}",
                    'timestamp': time.strftime('%H:%M:%S')
                })
                time.sleep(0.5)

        # Test 4: Rapid file modifications
        elif test_id == 4:
            test_file = os.path.join(test_dir, "modified_file.txt")
            for i in range(5):
                with open(test_file, 'w') as f:
                    f.write(f"Modified content {i}")
                test_results.append({
                    'id': test_id,
                    'name': "Rapid file modifications",
                    'status': f"Modified file: {test_file}",
                    'timestamp': time.strftime('%H:%M:%S')
                })
                time.sleep(0.2)

        # Test 5: File moves/renames
        elif test_id == 5:
            source_file = os.path.join(test_dir, "source_file.txt")
            with open(source_file, 'w') as f:
                f.write("Test content")
            
            dest_file = os.path.join(test_dir, "moved_file.encrypted")
            shutil.move(source_file, dest_file)
            test_results.append({
                'id': test_id,
                'name': "File moves/renames",
                'status': f"Moved file: {source_file} -> {dest_file}",
                'timestamp': time.strftime('%H:%M:%S')
            })

    except Exception as e:
        test_results.append({
            'id': test_id,
            'name': f"Test {test_id}",
            'status': f"Error: {str(e)}",
            'timestamp': time.strftime('%H:%M:%S')
        })

def move_to_quarantine(file_path):
    # Create quarantine directory if it doesn't exist
    quarantine_dir = os.path.join(os.path.dirname(file_path), 'quarantine')
    os.makedirs(quarantine_dir, exist_ok=True)
    
    # Move file to quarantine
    filename = os.path.basename(file_path)
    quarantine_path = os.path.join(quarantine_dir, filename)
    shutil.move(file_path, quarantine_path)
    return quarantine_path

def is_suspicious_file(filepath):
    suspicious_extensions = ['.encrypted', '.crypto', '.locked', '.wannacry', '.cerber']
    return any(filepath.lower().endswith(ext) for ext in suspicious_extensions)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/run-tests', methods=['POST'])
def run_tests():
    global is_running, test_results
    
    if is_running:
        return jsonify({'error': 'Tests are already running'}), 400
    
    test_ids = request.json.get('test_ids', [])
    test_dir = r'C:\Users\mhmmd\Downloads\ransome'
    test_results = []
    is_running = True

    def run_all_tests():
        global is_running
        try:
            for test_id in test_ids:
                run_test(test_id, test_dir)
        finally:
            is_running = False

    # Run tests in a separate thread
    thread = threading.Thread(target=run_all_tests)
    thread.start()

    return jsonify({'message': 'Tests started successfully'})

@app.route('/api/test-status')
def get_test_status():
    return jsonify({
        'is_running': is_running,
        'results': test_results
    })

@app.route('/api/scan-folder', methods=['POST'])
def scan_folder():
    folder_path = request.json.get('folder_path')
    if not folder_path or not os.path.exists(folder_path):
        return jsonify({'error': 'Invalid folder path'}), 400

    scan_results = []
    for root, _, files in os.walk(folder_path):
        for file in files:
            file_path = os.path.join(root, file)
            is_suspicious = is_suspicious_file(file_path)
            scan_results.append({
                'file_path': file_path,
                'suspicious': is_suspicious
            })

    return jsonify({'results': scan_results})

@app.route('/api/quarantine-scanned-file', methods=['POST'])
def quarantine_scanned_file():
    file_path = request.json.get('file_path')
    if not file_path or not os.path.exists(file_path):
        return jsonify({'error': 'Invalid file path'}), 400

    try:
        quarantine_path = move_to_quarantine(file_path)
        return jsonify({
            'success': True,
            'message': 'File moved to quarantine successfully',
            'quarantine_path': quarantine_path
        })
    except Exception as e:
        return jsonify({
            'error': f'Failed to quarantine file: {str(e)}'
        }), 500

@app.route('/api/analyze-file', methods=['POST'])
def analyze_file():
    file_info = request.json.get('file_info')
    
    if not file_info:
        return jsonify({'error': 'No file information provided'}), 400
    
    prompt = f"""
    As a Security Analysis Assistant, analyze this suspicious file:
    Path: {file_info['file_path']}

    Provide a detailed analysis in this format:

    🔍 Initial Assessment
    - File type and characteristics
    - Suspicious indicators detected
    - Threat level evaluation

    ⚠️ Potential Threats
    - Identified malware patterns
    - Known attack vectors
    - Associated risks

    🛡️ Recommended Actions
    - Immediate security measures
    - Containment steps
    - Prevention strategies

    💡 Security Tips
    - Best practices for similar cases
    - System hardening recommendations
    - Future prevention guidelines

    Please format the response with clear sections and bullet points for readability.
    """
    
    try:
        response = model.generate_content(prompt)
        formatted_response = response.text.replace('•', '•  ').replace('-', '- ')
        return jsonify({'analysis': formatted_response})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
