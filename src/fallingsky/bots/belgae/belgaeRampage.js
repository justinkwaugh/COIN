import _ from '../../../lib/lodash';
import FactionIDs from '../../config/factionIds';
import Rampage from '../../commands/belgae/rampage';
import EnemyFactionPriority from './enemyFactionPriority';

class BelgaeRampage {

    static rampage(state, modifiers) {
        let effective = false;

        const prioritizedRampages = this.getPrioritizedRampages(state, modifiers);
        _.each(prioritizedRampages, function(rampage) {
            Rampage.execute(state, { rampage });
            effective = true;
        });

        return effective;
    }

    static getPrioritizedRampages(state, modifiers) {
        const rampages = _.each(
            Rampage.test(state), (possibleRampage) => {
                const [chosenFaction, factionData] = _(possibleRampage.enemyFactions).map(
                    factionId => [factionId, this.getRampageFactionData( state, modifiers, possibleRampage.region, factionId)]).sortBy(
                    pair => pair[1].priority).first();

                possibleRampage.chosenFaction = chosenFaction;
                possibleRampage.priority = factionData.priority;
                possibleRampage.agreeingFactionId = factionData.agreeingFactionId;
                possibleRampage.count = Math.min(possibleRampage.hiddenWarbands.length, (factionData.mobileEnemyPieces.length - (factionData.isBattling ? 1 : 0)));
            });

        return _(rampages).reject({priority : 'z'}).sortBy('priority').value();
    }

    static getRampageFactionData(state, modifiers, region, factionId) {

        const battles = modifiers.commandSpecific.battles;
        const isBattling = _.find(battles, function(battleResult) {
            return battleResult.region.id === region.id && battleResult.defendingFaction.id === factionId;
        });
        const mobileEnemyPieces = region.getMobilePiecesForFaction(factionId);

        let priority = 'z';
        let agreeingFactionId = null;
        if(!isBattling || mobileEnemyPieces.length >= 2) {

            agreeingFactionId = this.factionCanRetreat(state, region, factionId);

            if (!agreeingFactionId) {
                priority = 'a' + EnemyFactionPriority[factionId];
            }
            else if (this.rampageWillCauseBelgicControl(region, factionId, isBattling)) {
                priority = 'b' + EnemyFactionPriority[factionId];
            }
            else {
                priority = 'c' + EnemyFactionPriority[factionId];
            }
        }

        return {priority, agreeingFactionId, mobileEnemyPieces, isBattling}
    }

    static rampageWillCauseBelgicControl(region, factionId, isBattling) {
        if (region.controllingFactionId() === FactionIDs.BELGAE) {
            return false;
        }

        const hiddenWarbands = region.getHiddenPiecesForFaction(FactionIDs.BELGAE);
        const mobileEnemyPieces = region.getMobilePiecesForFaction(factionId);
        const margin = region.controllingMarginByFaction()[FactionIDs.BELGAE];
        const numRemoved = Math.min(hiddenWarbands.length, mobileEnemyPieces.length - (isBattling ? 1 : 0));
        return (margin + numRemoved >= 1 );
    }

    static factionCanRetreat(state, region, factionId) {
        const canRetreatToSelf = _.find(
            region.adjacent, (adjacentRegion) => {
                return adjacentRegion.controllingFactionId() && adjacentRegion.controllingFactionId() === factionId;
            });

        if(canRetreatToSelf) {
            return factionId;
        }
        else {
            const player = state.playersByFaction[factionId];
            return player.getRetreatAgreement(state, region);
        }
    }
}

export default BelgaeRampage;