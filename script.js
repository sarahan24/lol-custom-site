let players =
  JSON.parse(localStorage.getItem("players")) || [
    {
      nickname: "신튜렁",
      tier: "신튜렁",
      mt: 1520
    },
    {
      nickname: "미드괴물",
      tier: "S",
      mt: 1490
    }
  ];

let currentEditIndex = -1;

function savePlayers() {
  localStorage.setItem(
    "players",
    JSON.stringify(players)
  );
}

function renderRanking() {

  const table =
    document.getElementById("rankingTable");

  if (!table) return;

  table.innerHTML = "";

  players.sort((a, b) => b.mt - a.mt);

  players.forEach((player, index) => {

    let rank;

    if (index === 0) rank = "1";
    else if (index === 1) rank = "2";
    else if (index === 2) rank = "3";
    else rank = index + 1;

    table.innerHTML += `
      <tr>
        <td>${rank}</td>
        <td>${player.nickname}</td>
        <td>${player.tier}</td>
        <td>${player.mt}</td>
      </tr>
    `;
  });
}

function renderManage() {

  const table =
    document.getElementById("manageTable");

  if (!table) return;

  table.innerHTML = "";

  players.sort((a, b) => b.mt - a.mt);

  players.forEach((player, index) => {

    table.innerHTML += `
      <tr>
        <td>${player.nickname}</td>
        <td>${player.tier}</td>
        <td>${player.mt}</td>
        <td>
          <button onclick="editPlayer(${index})">
            수정
          </button>

          <button onclick="deletePlayer(${index})">
            삭제
          </button>
        </td>
      </tr>
    `;
  });
}

function addPlayer() {

  const nickname =
    document.getElementById("nickname").value;

  const tier =
    document.getElementById("tier").value;

  const mt =
    Number(
      document.getElementById("mt").value
    );

  if (!nickname || !mt) return;

  players.push({
    nickname,
    tier,
    mt
  });

  savePlayers();

  renderManage();
}

function deletePlayer(index) {

  players.splice(index, 1);

  savePlayers();

  renderManage();
}

function editPlayer(index) {

  currentEditIndex = index;

  const player = players[index];

  document.getElementById(
    "editNickname"
  ).value = player.nickname;

  document.getElementById(
    "editTier"
  ).value = player.tier;

  document.getElementById(
    "editMt"
  ).value = player.mt;

  document.getElementById(
    "editModal"
  ).style.display = "block";
}

function closeModal() {
  document.getElementById(
    "editModal"
  ).style.display = "none";
}

function saveEdit() {

  players[currentEditIndex].nickname =
    document.getElementById(
      "editNickname"
    ).value;

  players[currentEditIndex].tier =
    document.getElementById(
      "editTier"
    ).value;

  players[currentEditIndex].mt =
    Number(
      document.getElementById(
        "editMt"
      ).value
    );

  savePlayers();

  renderManage();

  closeModal();
}

renderRanking();
renderManage();