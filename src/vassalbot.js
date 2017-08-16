import _ from 'lib/lodash';
import FallingSkyVassalGameState from 'fallingsky/vassal/fallingSkyVassalGameState';
import CommandIDs from 'fallingsky/config/commandIds';
import FactionIDs from 'fallingsky/config/factionIds';
import RegionIDs from 'fallingsky/config/regionIds';
import FactionActions from 'common/factionActions';
import TribeIDs from 'fallingsky/config/tribeIds';
import HumanPlayer from 'fallingsky/player/humanPlayer';
import PlaceWarbands from 'fallingsky/actions/placeWarbands';
import PlaceAlliedTribe from 'fallingsky/actions/placeAlliedTribe';
import PlaceFort from 'fallingsky/actions/placeFort';
import PlaceLeader from 'fallingsky/actions/placeLeader';
import PlaceAuxilia from 'fallingsky/actions/placeAuxilia';
import PlaceLegions from 'fallingsky/actions/placeLegions';
import RevealPieces from 'fallingsky/actions/revealPieces';
import AeduiBattle from 'fallingsky/bots/aedui/aeduiBattle';
import TurnContext from 'common/turnContext';

import Game from 'fallingsky/game';
import TheGreatRevolt from 'fallingsky/scenarios/TheGreatRevolt';
import PlayerInteractionFactory from 'common/playerInteractionFactory';

import * as fs from 'fs';
import * as tempy from 'tempy';

JSON.stringifyOnce = function(obj, replacer, indent){
  var printedObjects = [];
  var printedObjectKeys = [];

  function printOnceReplacer(key, value) {
    if (printedObjects.length > 20000) { // browsers will not print more than 20K, I don't see the point to allow 2K.. algorithm will not be fast anyway if we have too many objects
      return 'object too long';
    }
    var printedObjIndex = false;
    printedObjects.forEach(function(obj, index){
      if(obj===value){
        printedObjIndex = index;
      }
    });

    if (key == '') { //root element
      printedObjects.push(obj);
      printedObjectKeys.push("root");
      return value;
    }
    else if (printedObjIndex+"" != "false" && typeof(value) == "object") {
      if (printedObjectKeys[printedObjIndex] == "root"){
        return "(pointer to root)";
      } else {
        return "(see " + ((!!value && !!value.constructor) ? value.constructor.name.toLowerCase()  : typeof(value)) + " with key " + printedObjectKeys[printedObjIndex] + ")";
      }
    } else {
      var qualifiedKey = key || "(empty key)";
      printedObjects.push(value);
      printedObjectKeys.push(qualifiedKey);
      if (replacer) {
        return replacer(key, value);
      } else {
        return value;
      }
    }
  }
  return JSON.stringify(obj, printOnceReplacer, indent);
};

function findFirstDiffPos(a, b)
{
  var longerLength = Math.max(a.length, b.length);
  for (var i = 0; i < longerLength; i++)
  {
     if (a[i] !== b[i]) return i;
  }

  return -1;
}

function isEmpty(str) {
  return (!str || 0 === str.length);
}

function loadedVassalData(err, data) {
  console.log('vassalbot.readFile()');

  if (err) {
    console.log('M*ERROR READING GAMESTATE ' + err.message);
    throw err;
  }

  var json = JSON.parse(data.toString());

  const game = new FallingSkyVassalGameState();
  game.loadVassalGameData(json);
  
  console.log('Action: ' + json.action);

  if (json.action == 'action:Play-Next')
    game.playTurn();
  else if (json.action == 'action:Game-State') {
    console.log('@ECHO ON');
    game.logState();
    console.log('@ECHO OFF');
  }
  else if (json.action == 'action:JSON') {
    game.playTurn();

    var newdata = game.serializeGameState(game);

    var newdatafile = tempy.file({extension: 'json'});
    fs.writeFileSync(newdatafile, newdata);
    console.log('M*File written to ', newdatafile);

    // reload

    const loaddata = fs.readFileSync(newdatafile);
    const loaddatastr = loaddata.toString();
    let loadgame = new FallingSkyVassalGameState();

    //console.log('M*BEFORE LOAD:');
    // console.log('@ECHO ON');
    //loadgame.logState();
    // console.log('@ECHO OFF');

    loadgame.loadGameState(JSON.parse(loaddatastr));

    // console.log('M*AFTER LOAD:');
    // console.log('@ECHO ON');
    // loadgame.logState();
    // console.log('@ECHO OFF');

    let diffIndex = findFirstDiffPos(newdata, loaddatastr);
    if (diffIndex > -1) {
      console.log('M*DIFF', diffIndex);
      console.log('M*STRING 1:', newdata.substring(diffIndex - 30, diffIndex + 30).replace(/(?:\r\n|\r|\n)/g, ' '));
      console.log('M*STRING 2:', loaddatastr.substring(diffIndex - 30, diffIndex + 30).replace(/(?:\r\n|\r|\n)/g, ' '));
    }
  }
}

module.exports = {
  start: function(gameStateFile, question) {
    console.log('vassalbot.start(', gameStateFile, ', ', question, ')');

    if (isEmpty(gameStateFile) && question) {
      // resume from VASSAL
      var response = JSON.parse(question);
      console.log('vassalbot.datafile', response.datafile);

      fs.readFile(response.datafile, function (err, data) {
        console.log('vassalbot.readFile()');
        
        if (err) {
          console.log('M*ERROR READING GAMESTATE ' + err.message);
          throw err;
        }
      
        var json = JSON.parse(data.toString());

        console.log('vassalbot.loadGameState()');

        const game = new FallingSkyVassalGameState();
        game.loadGameState(json);

        // resume game

        console.log('vassalbot.resume');
        console.log(response);
        console.log(response.interaction);

        const interactionData = JSON.parse(response.interaction);
        const interaction = PlayerInteractionFactory.create(interactionData.type, interactionData);
        //interaction.loadGameState(interactionData);
        interaction.response = response.reply;

        switch (response.reply) {
          case 'agreed':
            console.log('M RESPONSE --> ' + interaction.respondingFactionId + ' agreed');
            break;
          case 'refused':
            console.log('M RESPONSE --> ' + interaction.respondingFactionId + ' refused');
            break;
        }

        game.resumeTurn(interaction);
      });
    } else {
      // action from VASSAL
      fs.readFile(gameStateFile, loadedVassalData);
    }
  }
};

console.log('JS Bot Engine Script Loaded');
