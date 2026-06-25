let players = [];
let currentEditIndex = -1;

/**
 * Fetch all players from the API
 */
async function fetchPlayers() {
  try {
    const res = await fetch('/api/players');
    if (!res.ok) {
      console.error('Failed to fetch players:', res.status);
      return;
    }
    players = await res.json();
    renderRanking();
    renderManage();
  } catch (e) {
    console.error('Error fetching players:', e);
  }
}

/**
 * Render ranking table
 */
function renderRanking() {
  const table = document.getElementById('rankingTable');
  if (!table) return;
  
  table.innerHTML = '';
  const sortedPlayers = [...players].sort((a, b) => b.mt - a.mt);

  sortedPlayers.forEach((player, index) => {
    const rank = index + 1;
    const row = `
      <tr>
        <td>${rank}</td>
        <td>${escapeHtml(player.nickname)}</td>
        <td>${escapeHtml(player.tier)}</td>
        <td>${player.mt}</td>
      </tr>
    `;
    table.innerHTML += row;
  });
}

/**
 * Render manage table with edit/delete buttons
 */
function renderManage() {
  const table = document.getElementById('manageTable');
  if (!table) return;
  
  table.innerHTML = '';
  const sortedPlayers = [...players].sort((a, b) => b.mt - a.mt);
  const originalIndices = sortedPlayers.map(p => players.indexOf(p));

  sortedPlayers.forEach((player, sortedIndex) => {
    const originalIndex = originalIndices[sortedIndex];
    const row = `
      <tr>
        <td>${escapeHtml(player.nickname)}</td>
        <td>${escapeHtml(player.tier)}</td>
        <td>${player.mt}</td>
        <td>
          <button class="action-btn" onclick="editPlayer(${originalIndex})">수정</button>
          <button class="action-btn delete-btn" onclick="deletePlayer(${originalIndex})">삭제</button>
        </td>
      </tr>
    `;
    table.innerHTML += row;
  });
}

/**
 * Add a new player
 */
async function addPlayer() {
  const nickname = document.getElementById('nickname').value.trim();
  const tier = document.getElementById('tier').value.trim();
  const mt = Number(document.getElementById('mt').value);
  
  if (!nickname) {
    alert('닉네임을 입력해주세요');
    return;
  }
  
  if (!mt || mt <= 0) {
    alert('MT 포인트를 올바르게 입력해주세요');
    return;
  }
  
  try {
    const res = await fetch('/api/players', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname, tier, mt })
    });
    
    if (!res.ok) {
      const error = await res.json();
      alert('오류: ' + (error.error || '참가자 추가 실패'));
      return;
    }
    
    document.getElementById('nickname').value = '';
    document.getElementById('tier').value = '신튜렁';
    document.getElementById('mt').value = '';
    
    await fetchPlayers();
  } catch (e) {
    console.error('Error adding player:', e);
    alert('참가자 추가 중 오류가 발생했습니다');
  }
}

/**
 * Delete a player
 */
async function deletePlayer(index) {
  if (!confirm(players[index].nickname + '을(를) 삭제하시겠습니까?')) {
    return;
  }
  
  try {
    const res = await fetch(`/api/players/${index}`, { method: 'DELETE' });
    
    if (!res.ok) {
      alert('삭제 실패');
      return;
    }
    
    await fetchPlayers();
  } catch (e) {
    console.error('Error deleting player:', e);
    alert('삭제 중 오류가 발생했습니다');
  }
}

/**
 * Open edit modal for a player
 */
function editPlayer(index) {
  if (index < 0 || index >= players.length) {
    alert('유효하지 않은 참가자입니다');
    return;
  }
  
  currentEditIndex = index;
  const player = players[index];
  document.getElementById('editNickname').value = player.nickname;
  document.getElementById('editTier').value = player.tier;
  document.getElementById('editMt').value = player.mt;
  document.getElementById('editModal').style.display = 'block';
}

/**
 * Close edit modal
 */
function closeModal() {
  document.getElementById('editModal').style.display = 'none';
  currentEditIndex = -1;
}

/**
 * Save player edits
 */
async function saveEdit() {
  const nickname = document.getElementById('editNickname').value.trim();
  const tier = document.getElementById('editTier').value.trim();
  const mt = Number(document.getElementById('editMt').value);
  
  if (!nickname) {
    alert('닉네임을 입력해주세요');
    return;
  }
  
  if (!mt || mt <= 0) {
    alert('MT 포인트를 올바르게 입력해주세요');
    return;
  }
  
  try {
    const res = await fetch(`/api/players/${currentEditIndex}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname, tier, mt })
    });
    
    if (!res.ok) {
      const error = await res.json();
      alert('오류: ' + (error.error || '수정 실패'));
      return;
    }
    
    await fetchPlayers();
    closeModal();
  } catch (e) {
    console.error('Error saving edit:', e);
    alert('수정 중 오류가 발생했습니다');
  }
}

/**
 * Escape HTML to prevent XSS attacks
 */
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Close modal when clicking outside of it
 */
window.onclick = function(event) {
  const modal = document.getElementById('editModal');
  if (event.target === modal) {
    closeModal();
  }
};

// Initialize on page load
fetchPlayers();

