import _ from '../../../lib/lodash';
import FactionIDs from '../../config/factionIds';
import Enlist from '../../commands/belgae/enlist';
import Battle from '../../commands/battle';
import EnemyFactionPriority from './enemyFactionPriority';
import BelgaeGermanicBattle from './belgaeGermanicBattle';
import BelgaeGermanicMarch from './belgaeGermanicMarch';
import BelgaeGermanicRally from './belgaeGermanicRally';
import BelgaeGermanicRaid from './belgaeGermanicRaid';

class BelgaeEnlist {

    static enlist(state, modifiers) {
        const enlistResults = Enlist.test(state);
        if(modifiers.commandSpecific.battles) {
            return this.enlistForBattle(state, modifiers, enlistResults);
        }
        else {
            return this.enlistForCommand(state, modifiers, enlistResults);
        }
    }

    static enlistForBattle(state, modifiers, enlistResults) {
        const battleResults = modifiers.commandSpecific.battles;
        _.each(battleResults, battleResult => this.checkAndUpdateBattleResult(state, modifiers, enlistResults, battleResult));
        return _.find(battleResults, {canEnlistGermans: true});
    }

    static enlistForCommand(state, modifiers, enlistResults) {
        return BelgaeGermanicBattle.battle(state, modifiers, enlistResults) ||
               BelgaeGermanicMarch.march(state, modifiers, enlistResults) ||
               BelgaeGermanicRally.rally(state, modifiers, enlistResults) ||
               BelgaeGermanicRaid.raid(state, modifiers, enlistResults);
    }

    static checkAndUpdateBattleResult(state, modifiers, enlistResults, battleResults) {
        const enlistResultForBattleRegion = _.find(enlistResults, result => result.region.id === battleResults.region.id);
        if (enlistResultForBattleRegion) {
            const enlistedBattleResults = Battle.test(
                state, {
                    region: battleResults.region,
                    attackingFaction: battleResults.attackingFaction,
                    defendingFaction: battleResults.defendingFaction,
                    enlistingGermans: true
                });

            if (enlistedBattleResults.worstCaseAttackerLosses.normal < battleResults.worstCaseAttackerLosses.normal ||
                enlistedBattleResults.worstCaseDefenderLosses.normal > battleResults.worstCaseDefenderLosses.normal) {
                battleResults.canEnlistGermans = true;
            }
        }
    }

}

export default BelgaeEnlist;