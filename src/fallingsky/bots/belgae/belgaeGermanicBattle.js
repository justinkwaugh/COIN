import _ from '../../../lib/lodash';
import FactionIDs from '../../config/factionIds';
import Battle from '../../commands/battle';

class BelgaeGermanicBattle {

    static battle(state, modifiers, enlistResults) {

        let effective = false;
        const validRegions = _.map(enlistResults, result => result.region.id);
        const effectiveBattle = this.findEffectiveBattle(state, validRegions);
        if (effectiveBattle) {
            console.log('*** Belgae Enlisted Germanic Battle ***');
            Battle.execute(
                state, {
                    region: effectiveBattle.region,
                    attackingFaction: effectiveBattle.attackingFaction,
                    defendingFaction: effectiveBattle.defendingFaction,
                    ambush: true
                });
            effective = true;
        }
        return effective;
    }

    static getEnemyFactionOrder(state) {
        return _(state.factions).reject({id: FactionIDs.GERMANIC_TRIBES}).reject(faction => faction.id === FactionIDs.BELGAE).partition('isNonPlayer').map(_.shuffle).flatten().sortBy('isNonPlayer').value();
    }

    static findEffectiveBattle(state, validRegions) {
        return _(state.regions).map(
            (region) => {
                if(_.indexOf(validRegions, region.id) < 0) {
                    return;
                }
                const enemyFactionOrder = this.getEnemyFactionOrder(state);
                return _(enemyFactionOrder).map(
                    function (faction) {
                        return Battle.test(
                            state, {
                                region: region,
                                attackingFactionId: FactionIDs.GERMANIC_TRIBES,
                                defendingFactionId: faction.id
                            });
                    }).filter(this.isEffectiveBattle).first();
            }).compact().first();
    }

    static isEffectiveBattle(battleResult) {
        return battleResult.canAmbush && battleResult.worstCaseDefenderLosses.ambush > 0 && battleResult.defendingPieces.length > 0;
    }
}

export default BelgaeGermanicBattle;