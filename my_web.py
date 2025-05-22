from flask import Flask, render_template, request, url_for, jsonify
import json
import os

DATA_FILE = 'work_data.json'

app = Flask(__name__, static_folder="Static", template_folder="template")

def read_data():
    if not os.path.exists(DATA_FILE) or os.path.getsize(DATA_FILE) == 0:
        return []
    try:
        with open(DATA_FILE, 'r') as f:
            data = json.load(f)
            return data
    except json.JSONDecodeError:
        return [] # Or handle error appropriately

def write_data(data):
    try:
        with open(DATA_FILE, 'w') as f:
            json.dump(data, f, indent=4)
    except IOError:
        # Handle error appropriately (e.g., log it)
        pass

@app.route('/')
def home():
    return render_template("main_view.html")
@app.route('/work_data')
def work_data():
    return render_template("work_data.html")

@app.route('/api/work_experiences', methods=['GET'])
def get_work_experiences():
    experiences = read_data()
    return jsonify(experiences)

@app.route('/api/work_experiences', methods=['POST'])
def add_work_experience():
    data = request.get_json()
    new_experience = {
        'company': data.get('company'),
        'role': data.get('role'),
        'period': data.get('period'),
        'description': data.get('description'),
        'jobTitle': data.get('jobTitle', ''),  # Add jobTitle, default to empty string
        'endDate': data.get('endDate', None)    # Add endDate, default to None
    }
    experiences = read_data()
    experiences.append(new_experience)
    write_data(experiences)
    return jsonify(new_experience), 201

@app.route('/api/work_experiences/<int:entry_index>', methods=['PUT'])
def update_work_experience(entry_index):
    data = request.get_json()
    experiences = read_data()
    if 0 <= entry_index < len(experiences):
        # Preserve existing fields if not provided in the update payload
        experiences[entry_index]['company'] = data.get('company', experiences[entry_index].get('company'))
        experiences[entry_index]['role'] = data.get('role', experiences[entry_index].get('role'))
        experiences[entry_index]['period'] = data.get('period', experiences[entry_index].get('period'))
        experiences[entry_index]['description'] = data.get('description', experiences[entry_index].get('description'))
        experiences[entry_index]['jobTitle'] = data.get('jobTitle', experiences[entry_index].get('jobTitle', '')) # Update jobTitle
        experiences[entry_index]['endDate'] = data.get('endDate', experiences[entry_index].get('endDate', None))    # Update endDate
        write_data(experiences)
        return jsonify(experiences[entry_index])
    return jsonify({'error': 'Entry not found'}), 404

@app.route('/api/work_experiences/<int:entry_index>', methods=['DELETE'])
def delete_work_experience(entry_index):
    experiences = read_data()
    if 0 <= entry_index < len(experiences):
        deleted_experience = experiences.pop(entry_index)
        write_data(experiences)
        return jsonify(deleted_experience), 200 # Or 204 No Content
    return jsonify({'error': 'Entry not found'}), 404


if __name__ == "__main__":
    app.run(debug=True)

