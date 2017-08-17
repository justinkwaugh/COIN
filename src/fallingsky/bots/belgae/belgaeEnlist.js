import _ from '../../../lib/lodash';
import SpecialAbilityIDs from '../../config/specialAbilityIds';
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
        const enlistResults = _.filter(Enlist.test(state, {
            ignoreSARegionCondition: modifiers.context.ignoreSARegionCondition
        }), enlist => _.indexOf(modifiers.allowedRegions, enlist.region.id) >= 0);
        let effective = false;

        state.turnHistory.getCurrentTurn().startSpecialAbility(SpecialAbilityIDs.ENLIST);
        if (modifiers.context.battles) {
            effective = this.enlistForBattle(state, modifiers, enlistResults);
        }
        else {
            effective = this.enlistForCommand(state, modifiers, enlistResults);
        }

        if (!effective) {
            state.turnHistory.getCurrentTurn().rollbackSpecialAbility();
        }
        else {
            state.turnHistory.getCurrentTurn().commitSpecialAbility();
        }

        return effective;
    }

    static enlistForBattle(state, modifiers, enlistResults) {
        const battleResults = modifiers.context.battles;
        _.each(battleResults,
               battleResult => this.checkAndUpdateBattleResult(state, modifiers, enlistResults, battleResult));
        return _.find(battleResults, {willEnlistGermans: true});
    }

    static enlistForCommand(state, modifiers, enlistResults) {
        return BelgaeGermanicBattle.battle(state, modifiers, enlistResults) ||
               BelgaeGermanicMarch.march(state, modifiers, enlistResults) ||
               BelgaeGermanicRally.rally(state, modifiers, enlistResults) ||
               BelgaeGermanicRaid.raid(state, modifiers, enlistResults);
    }

    static checkAndUpdateBattleResult(state, modifiers, enlistResults, battleResults) {
        const enlistResultForBattleRegion = _.find(enlistResults,
                                                   result => result.region.id === battleResults.regionId);
        if (enlistResultForBattleRegion) {
            const enlistedBattleResults = Battle.test(
                state, {
                    region: state.regionsById[battleResults.regionId],
                    attackingFaction: battleResults.attackingFaction,
                    defendingFaction: battleResults.defendingFaction,
                    enlistingGermans: true
                });

            if (enlistedBattleResults.worstCaseAttackerLosses.normal < battleResults.worstCaseAttackerLosses.normal ||
                enlistedBattleResults.worstCaseDefenderLosses.normal > battleResults.worstCaseDefenderLosses.normal) {
                battleResults.willEnlistGermans = true;
            }
        }
    }

}

export default BelgaeEnlist;