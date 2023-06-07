const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();
const dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server has Started");
    });
  } catch (e) {
    console.log(`DB Error:${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();
app.get("/players/", async (request, response) => {
  const convertDBObjectToResponseObject = (dbObject) => {
    return {
      playerName: dbObject.player_name,
      playerId: dbObject.player_id,
      jersyNumber: dbObject.jersy_number,
      role: dbObject.role,
    };
  };
  const getPlayerQuery = `select * from cricket_team;`;
  const playersTable = await db.all(getPlayerQuery);
  response.send(
    playersTable.map((eachPlayer) =>
      convertDBObjectToResponseObject(eachPlayer)
    )
  );
});
app.get("players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `select * from cricket_team where
    player_id=${playerId};`;
  const player = await db.get(getPlayerQuery);
  response.send(convertDBObjectToResponseObject(player));
});

app.post("/players/", async (request, response) => {
  const { playerName, jersyNumber, role } = request.body;
  const postPlayerQuery = `Insert INTO cricket_team(player_name,jersy_number,role)
values('${playerName}','${jersyNumber}','${role}');`;
  const player = await db.run(postPlayerQuery);
  response.send("Player added to team");
});

app.put("/players/:playerId", async (request, response) => {
  const { playerName, jersyNumber, role } = request.body;
  const { playerId } = request.params;
  const updatePlayerQuery = `update
    cricket_team
    set player_name=${playerName},
    jersy_number=${jersyNumber},
    role=${role}
    where player_id=${playerId};`;
  await db.run(updatePlayerQuery);
  response.send("Player Details updated");
});

app.delete("players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `delete from cricket_team where player_id=${playerId};`;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});
module.exports = app;
