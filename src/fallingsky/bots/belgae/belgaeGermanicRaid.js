import _ from '../../../lib/lodash';
import FactionIDs from '../../config/factionIds';
import RevealPieces from '../../actions/revealPieces';
import RemoveResources from '../../actions/removeResources';
import Raid from '../../commands/raid';

class BelgaeGermanicRaid {
    static raid(state, modifiers, enlistResults) {
        let effective = false;

        const validRegions = _.map(enlistResults, result => result.region.id);
        const germanicFaction = state.factionsById[FactionIDs.GERMANIC_TRIBES];
        const effectiveRaid = this.findEffectiveRaid(state, modifiers, validRegions);

        if(effectiveRaid) {
            console.log('*** Belgae Enlisted Germanic Raid ***');
            const enemyFactionOrder = this.getEnemyFactionOrder(state);
            RevealPieces.execute(state, {factionId: germanicFaction.id, regionId: effectiveRaid.region.id, count: effectiveRaid.resourcesGained});

            let numResourcesToSteal = effectiveRaid.resourcesGained;
            _.each(enemyFactionOrder, function(faction) {
                const stolen = Math.min(numResourcesToSteal, faction.resources());
                RemoveResources.execute(state, { factionId: faction.id, count: stolen});

                numResourcesToSteal -= stolen;

                if (numResourcesToSteal <= 0) {
                    return false;
                }
            });
            effective = true;
        }

        return effective;
    }

    static findEffectiveRaid(state, modifiers, validRegions) {
        const raidResults = Raid.test(state, {factionId: FactionIDs.GERMANIC_TRIBES});
        return _(raidResults).map( (raidResult) => {
            if (_.indexOf(validRegions, raidResult.region.id) < 0) {
                    return;
                }

            const enemyFactionOrder = this.getEnemyFactionOrder(state);
            const numHiddenWarbands = raidResult.region.getHiddenPiecesForFaction(FactionIDs.GERMANIC_TRIBES).length;
            const stealableResources = _.reduce(enemyFactionOrder, function(sum, faction) {
                    return sum + faction.resources();
                }, 0);

            const resourcesGained = _.min([1, numHiddenWarbands, stealableResources]);
            if(resourcesGained < 1) {
                return;
            }

            raidResult.resourcesGained = resourcesGained;
            return raidResult;
        }).compact().shuffle().first();
    }

    static getEnemyFactionOrder(state) {
        return _(state.factions).reject({id: FactionIDs.GERMANIC_TRIBES}).reject(faction => faction.id === FactionIDs.BELGAE).reject('isNonPlayer').shuffle().value();
    }

}

export default BelgaeGermanicRaid;