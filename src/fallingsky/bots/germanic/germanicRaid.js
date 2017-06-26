import _ from '../../../lib/lodash';
import FactionIDs from '../../config/factionIds';
import RevealPieces from '../../actions/revealPieces';
import Raid from '../../commands/raid';

class GermanicRaid {
    static raid(state, modifiers) {
        console.log('*** Germanic Raid ***');
        let effective = false;

        const germanicFaction = state.factionsById[FactionIDs.GERMANIC_TRIBES];
        const raidResults = Raid.test(state, {factionId: FactionIDs.GERMANIC_TRIBES});

        _.each(raidResults, (raidResult) => {
            const enemyFactionOrder = this.getEnemyFactionOrder(state);

            const numHiddenWarbands = _.filter(raidResult.region.piecesByFaction()[FactionIDs.GERMANIC_TRIBES], function (piece) {
                return piece.type === 'warband' && !piece.revealed();
            }).length;

            const stealableResources = _.reduce(enemyFactionOrder, function(sum, faction) {
                    return sum + faction.resources();
                }, 0);

            const resourcesGained = _.min([2, numHiddenWarbands, stealableResources]);
            RevealPieces.execute(state, {factionId: germanicFaction.id, regionId: raidResult.region.id, count: resourcesGained});

            let numResourcesToSteal = resourcesGained;


            _.each(enemyFactionOrder, function(faction) {
                const stolen = Math.min(numResourcesToSteal, faction.resources());
                faction.removeResources(stolen);
                numResourcesToSteal -= stolen;

                if (numResourcesToSteal <= 0) {
                    return false;
                }
            });
            effective = true;
        });

        return effective;

    }

    static getEnemyFactionOrder(state) {
        return _(state.factions).reject({id: FactionIDs.GERMANIC_TRIBES}).partition('isNonPlayer').map(_.shuffle).flatten().sortBy('isNonPlayer').value();
    }

}

export default GermanicRaid;