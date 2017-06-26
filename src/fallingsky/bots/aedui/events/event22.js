import _ from '../../../../lib/lodash';
import FactionIDs from '../../../config/factionIds';
import EnemyFactionPriority from '../enemyFactionPriority';
import RemovePieces from '../../../actions/removePieces';
import PlaceWarbands from '../../../actions/placeWarbands';

class Event22 {

    static handleEvent(state) {
        const groupedRegions = _(state.regions).filter(
            function (region) {
                if (region.controllingFactionId() !== FactionIDs.AEDUI) {
                    return false;
                }
            }).map(
            function (region) {
                let priority = 'z';
                let factionId = '';
                let pieces = null;
                _.each(
                    EnemyFactionPriority, function (enemyPriority, enemyFactionId) {
                        const warbandsOrAuxilia = _.filter(
                            region.piecesByFaction()[enemyFactionId], function (piece) {
                                return piece.type === 'warband' || piece.type === 'auxilia';
                            });

                        if (warbandsOrAuxilia.length === 0) {
                            return;
                        }
                        const numToRemoveOrReplace = Math.min(warbandsOrAuxilia.length, 4);
                        const factionPriority = 'a' + enemyPriority + '-' + (99 - numToRemoveOrReplace);
                        if (factionPriority < priority) {
                            priority = factionPriority;
                            pieces = _.take(warbandsOrAuxilia, numToRemoveOrReplace);
                            factionId = enemyFactionId;
                        }
                    });
                return {
                    region: region,
                    pieces: pieces,
                    factionId: factionId,
                    priority: priority
                };
            }).compact().reject({priority: 'z'}).groupBy('priority').value();

        const sortedPriorities = _.keys(groupedRegions).sort();
        if (sortedPriorities.length === 0) {
            return false;
        }

        const priorityGroup = groupedRegions[_.first(sortedPriorities)];
        const chosen = _.sample(priorityGroup);

        RemovePieces.execute(
            state, {
                regionId: chosen.region.id,
                factionId: chosen.faction.id,
                pieces: chosen.pieces
            });

        const aedui = state.factionsById[FactionIDs.AEDUI];
        const numWarbandsToPlace = Math.min(aedui.availableWarbands(), chosen.pieces.length);
        if (numWarbandsToPlace) {
            PlaceWarbands(
                state, {
                    region: chosen.region,
                    faction: aedui,
                    count: numWarbandsToPlace
                });
        }

        return true;
    }
}

export default Event22;
