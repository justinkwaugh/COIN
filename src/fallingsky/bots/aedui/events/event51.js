import _ from '../../../../lib/lodash';
import FactionIDs from '../../../config/factionIds';
import RegionIDs from '../../../config/regionIds';
import RemovePieces from '../../../actions/removePieces';
import PlaceWarbands from '../../../actions/placeWarbands';
import EnemyFactionPriority from '../enemyFactionPriority';
import FactionActions from '../../../../common/factionActions';
import TurnContext from 'common/turnContext'

class Event51 {
    static handleEvent(state) {
        const aeduiBot = state.playersByFaction[FactionIDs.AEDUI];
        const aeduiFaction = state.factionsById[FactionIDs.AEDUI];
        let effective = false;

        const treveri = state.regionsById[RegionIDs.TREVERI];
        const regionsWithNonAeduiWarbands = _(treveri.adjacent).concat([treveri]).map(
            function (region) {
                const warbands = _(region.pieces).filter({type: 'warband'}).sortBy(
                    function (piece) {
                        let sortValue = EnemyFactionPriority[piece.factionId];
                        if (!piece.revealed()) {
                            sortValue += 'a';
                        }
                        if (!piece.scouted()) {
                            sortValue += 'b';
                        }
                        else {
                            sortValue += 'c';
                        }
                        return sortValue;
                    }).value();
                return {
                    region: region,
                    warbands: warbands,
                    numWarbands: warbands.length
                }
            }).reject({numWarbands: 0}).groupBy('numWarbands').value();

        const sortedKeys = _(regionsWithNonAeduiWarbands).keys().sort().reverse().value();
        if (sortedKeys.length > 0) {
            const regionGroup = regionsWithNonAeduiWarbands[sortedKeys.shift()];
            const regionEntry = _.sample(regionGroup);
            const piecesToRemove = _.take(regionEntry.warbands, 4);
            const groupedPiecesByFaction = _.groupBy(piecesToRemove, 'factionId');
            _.each(
                groupedPiecesByFaction, function (pieces, factionId) {
                    RemovePieces.execute(state, {factionId: factionId, regionId: regionEntry.region.id, pieces: pieces});
                });
            const numWarbandsToPlace = Math.min(aeduiFaction.availableWarbands().length, piecesToRemove.length);
            if (numWarbandsToPlace > 0) {
                PlaceWarbands.execute(
                    state, {
                        factionId: aeduiFaction.id,
                        regionId: regionEntry.region.id,
                        count: numWarbandsToPlace
                    });
            }
            effective = true;
        }
        const turn = state.turnHistory.currentTurn;
        turn.pushContext(new TurnContext({ id: 'e50', free: true}));
        const commandAction = aeduiBot.executeCommand(state, turn);
        turn.popContext();

        return effective || (commandAction && commandAction !== FactionActions.PASS);
    }

}

export default Event51;
