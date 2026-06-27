from flask import Flask, render_template, jsonify, request, abort
import json
import os
import threading
import logging

app = Flask(__name__, template_folder='template')

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# data file used to persist participants
DATA_FILE = os.path.join(os.path.dirname(__file__), 'data.json')
DATA_LOCK = threading.Lock()


def load_players():
    """Load players from data.json file"""
    try:
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        logger.warning(f"Data file not found: {DATA_FILE}")
        return []
    except json.JSONDecodeError:
        logger.error(f"Invalid JSON in {DATA_FILE}")
        return []
    except Exception as e:
        logger.error(f"Error loading players: {e}")
        return []


def save_players(players):
    """Save players to data.json file with thread safety"""
    try:
        with DATA_LOCK:
            with open(DATA_FILE, 'w', encoding='utf-8') as f:
                json.dump(players, f, ensure_ascii=False, indent=2)
                logger.info(f"Saved {len(players)} players to {DATA_FILE}")
    except Exception as e:
        logger.error(f"Error saving players: {e}")
        raise


@app.route("/")
def main():
    return render_template("index.html")


@app.route('/manage')
def manage():
    return render_template('manage.html')


@app.route('/ranking')
def ranking():
    return render_template('ranking.html')


@app.route('/team')
def team():
    return render_template('team.html')


@app.route('/vs')
def vs():
    return render_template('vs.html')


@app.route('/api/players', methods=['GET'])
def api_get_players():
    """Get all players"""
    return jsonify(load_players())


@app.route('/api/players', methods=['POST'])
def api_add_player():
    """Add a new player"""
    data = request.get_json() or {}
    nickname = data.get('nickname', '').strip()
    tier = data.get('tier', '').strip()
    mt = data.get('mt')
    
    if not nickname:
        return jsonify({'error': 'nickname is required'}), 400
    if mt is None:
        return jsonify({'error': 'mt is required'}), 400
    
    try:
        mt = int(mt)
    except (ValueError, TypeError):
        return jsonify({'error': 'mt must be an integer'}), 400
    
    try:
        players = load_players()
        
        # Check if nickname already exists
        if any(player['nickname'] == nickname for player in players):
            return jsonify({'error': 'nickname already exists'}), 400
        
        players.append({'nickname': nickname, 'tier': tier or '신튜렁', 'mt': mt})
        save_players(players)
        logger.info(f"Added player: {nickname}")
        return jsonify(players[-1]), 201
    except Exception as e:
        logger.error(f"Error adding player: {e}")
        return jsonify({'error': 'Internal server error'}), 500


@app.route('/api/players/<int:index>', methods=['PUT'])
def api_update_player(index):
    """Update a player by index"""
    try:
        players = load_players()
        if index < 0 or index >= len(players):
            return jsonify({'error': 'Player not found'}), 404
        
        data = request.get_json() or {}
        if 'nickname' in data:
            players[index]['nickname'] = data['nickname'].strip()
        if 'tier' in data:
            players[index]['tier'] = data['tier'].strip()
        if 'mt' in data:
            try:
                players[index]['mt'] = int(data['mt'])
            except (ValueError, TypeError):
                return jsonify({'error': 'mt must be an integer'}), 400
        
        save_players(players)
        logger.info(f"Updated player at index {index}")
        return jsonify(players[index])
    except Exception as e:
        logger.error(f"Error updating player: {e}")
        return jsonify({'error': 'Internal server error'}), 500


@app.route('/api/players/<int:index>', methods=['DELETE'])
def api_delete_player(index):
    """Delete a player by index"""
    try:
        players = load_players()
        if index < 0 or index >= len(players):
            return jsonify({'error': 'Player not found'}), 404
        
        deleted = players.pop(index)
        save_players(players)
        logger.info(f"Deleted player: {deleted.get('nickname', 'Unknown')}")
        return ('', 204)
    except Exception as e:
        logger.error(f"Error deleting player: {e}")
        return jsonify({'error': 'Internal server error'}), 500


@app.errorhandler(404)
def not_found(e):
    return jsonify({'error': 'Not found'}), 404


@app.errorhandler(500)
def internal_error(e):
    logger.error(f"Internal error: {e}")
    return jsonify({'error': 'Internal server error'}), 500


if __name__ == '__main__':
    app.run(debug=True)