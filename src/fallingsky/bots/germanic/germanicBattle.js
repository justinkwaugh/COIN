import _ from '../../../lib/lodash';
import FactionIDs from '../../config/factionIds';
import SpecialAbilityIDs from 'fallingsky/config/specialAbilityIds';
import CommandIDs from '../../config/commandIds';
import Battle from '../../commands/battle';

class GermanicBattle {

    static battle(state, modifiers) {
        console.log('*** Germanic Battle ***');
        const effectiveBattles = this.findEffectiveBattles(state);
        if(effectiveBattles.length === 0) {
            return false;
        }
        const turn = state.turnHistory.getCurrentTurn();
        turn.startCommand(CommandIDs.BATTLE);
        turn.startSpecialAbility(SpecialAbilityIDs.AMBUSH);
        turn.commitSpecialAbility();
        _.each(effectiveBattles, (battle) => {
                Battle.execute(
                    state, {
                        region: battle.region,
                        attackingFaction: battle.attackingFaction,
                        defendingFaction: battle.defendingFaction,
                        ambush: true
                    });
            });
        turn.commitCommand();
        return true;
    }

    static getEnemyFactionOrder(state) {
        return _(state.factions).reject({id: FactionIDs.GERMANIC_TRIBES}).partition('isNonPlayer').map(_.shuffle).flatten().sortBy('isNonPlayer').value();
    }

    static findEffectiveBattles(state) {
        return _(state.regions).map(
            (region) => {
                const enemyFactionOrder = this.getEnemyFactionOrder(state);
                return _(enemyFactionOrder).map(function(faction) {
                    return Battle.test(
                        state, {
                            region: region,
                            attackingFactionId: FactionIDs.GERMANIC_TRIBES,
                            defendingFactionId: faction.id
                        });
                }).filter(this.isEffectiveBattle).first();
            }).compact().value();
    }

    static isEffectiveBattle(battleResult) {
        return battleResult.canAmbush && battleResult.mostDefenderLosses() > 0;
    }
}

export default GermanicBattle;