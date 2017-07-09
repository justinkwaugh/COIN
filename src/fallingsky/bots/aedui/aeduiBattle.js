import _ from '../../../lib/lodash';
import CommandIDs from '../../config/commandIds';
import SpecialAbilityIDs from '../../config/specialAbilityIds';
import FactionIDs from '../../config/factionIds';
import Battle from '../../commands/battle';
import AeduiTrade from './aeduiTrade';
import EnemyFactionPriority from './enemyFactionPriority';
import FactionActions from '../../../common/factionActions';
import RemoveResources from '../../actions/removeResources';

const Checkpoints = {
    BATTLE_COMPLETE_CHECK: 'battle-complete',
    SPECIAL_CHECK: 'special-check'
};


class AeduiBattle {

    static battle(state, modifiers) {
        const aeduiFaction = state.aedui;
        const turn = state.turnHistory.getCurrentTurn();

        if (!turn.getCheckpoint(Checkpoints.BATTLE_COMPLETE_CHECK)) {

            if (aeduiFaction.resources() === 0 && !modifiers.free) {
                return false;
            }


            const battles = modifiers.context.battles || this.getBattleList(state, modifiers);
            if (battles.length === 0) {
                return false;
            }

            turn.startCommand(CommandIDs.BATTLE);
            modifiers.context.battles = battles;

            const ambushed = _.find(battles, {willAmbush: true});
            if (!turn.getCheckpoint(Checkpoints.SPECIAL_CHECK) && ambushed) {
                turn.startSpecialAbility(SpecialAbilityIDs.AMBUSH);
                turn.commitSpecialAbility();
                turn.markCheckpoint(Checkpoints.SPECIAL_CHECK)
            }

            _.each(battles, (battle) => {
                if(!battle.complete) {
                    if(!battle.paid && !modifiers.free) {
                        RemoveResources.execute(state, {factionId: FactionIDs.AEDUI, count: battle.cost});
                        battle.paid = true;
                    }
                    Battle.execute(state, { battleResults: battle });
                }
            });

            turn.commitCommand();
            turn.markCheckpoint(Checkpoints.BATTLE_COMPLETE_CHECK);
            modifiers.context.battles = null;

            if (ambushed) {
                return FactionActions.COMMAND_AND_SPECIAL;
            }
        }

        const usedSpecialAbility = modifiers.canDoSpecial() && AeduiTrade.trade(state, modifiers);
        return usedSpecialAbility ? FactionActions.COMMAND_AND_SPECIAL : FactionActions.COMMAND;
    }

    static getBattleList(state, modifiers) {
        const aedui = state.aedui;
        console.log('*** Are there any effective Aedui Battles? ***');
        const effectiveBattles = this.findEffectiveBattles(state, modifiers);
        if (effectiveBattles.length === 0) {
            return [];
        }

        let battles = modifiers.free ? effectiveBattles : _.reduce(effectiveBattles, (accumulator, battle) => {
            if (accumulator.resourcesRemaining >= battle.cost) {
                accumulator.resourcesRemaining -= battle.cost;
                accumulator.battles.push(battle);
            }
            return accumulator
        }, {resourcesRemaining: aedui.resources(), battles: []}).battles;

        if (battles.length > 0) {

            if (modifiers.limited) {
                battles = _.take(battles, 1);
            }

            _.each(battles, battle => {
                if (this.shouldAmbush(battle) && modifiers.canDoSpecial()) {
                    battle.willAmbush = true;
                    return false;
                }
            });
        }

        return battles;

    }

    static findEffectiveBattles(state, modifiers) {
        const finalBattleList = [];

        const orderedBattles = this.getOrderedBattlesForRegions(state, modifiers, state.regions, true);
        const usedRegions = {};
        let ambushed = false;
        _.each(
            orderedBattles, (battle) => {
                usedRegions[battle.region.id] = true;
                finalBattleList.push(battle.battle);
                if (this.shouldAmbush(battle.battle)) {
                    ambushed = true;
                    return false;
                }
            });

        if (ambushed) {
            const unusedRegions = _.reject(state.regions, function (region) {
                return usedRegions[region.id];
            });
            const noAmbushBattles = this.getOrderedBattlesForRegions(state, modifiers, unusedRegions, false);
            finalBattleList.push.apply(finalBattleList, _.map(noAmbushBattles, 'battle'));
        }

        if (_.find(
                finalBattleList, (battleResult) => {
                    return this.isHighlyEffectiveBattle(battleResult);
                })) {
            return finalBattleList;
        }
        else {
            return [];
        }
    }

    static getOrderedBattlesForRegions(state, modifiers, regions, canAmbush) {
        const aeduiFaction = state.factionsById[FactionIDs.AEDUI];
        return _(regions).filter(
            function (region) {
                if (!modifiers.free && (aeduiFaction.resources() < 2 && region.devastated())) {
                    return false;
                }

                const aeduiPieces = region.piecesByFaction()[FactionIDs.AEDUI];
                return _.find(aeduiPieces, {isMobile: true});
            }).map(
            (region) => {
                const battleData = this.findBestBattleForRegion(state, region, canAmbush);
                if (battleData) {
                    return {
                        region: region,
                        priority: battleData.priority,
                        battle: battleData.battleResult
                    }
                }
            }).compact().sortBy('priority').groupBy('priority').map(_.shuffle).flatten().value();
    }

    static findBestBattleForRegion(state, region, canAmbush) {
        const aeduiFaction = state.factionsById[FactionIDs.AEDUI];
        return _(EnemyFactionPriority).keys().map(
            (factionId) => {
                if (factionId === FactionIDs.ROMANS && aeduiFaction.victoryMargin(state) <= 0) {
                    return;
                }

                const enemyPieces = region.piecesByFaction()[factionId];
                if (enemyPieces) {
                    const battleResult = Battle.test(
                        state, {
                            region: region,
                            attackingFactionId: FactionIDs.AEDUI,
                            defendingFactionId: factionId
                        });

                    if (!canAmbush) {
                        battleResult.canAmbush = false;
                    }

                    if (this.isEffectiveBattle(battleResult)) {
                        const priority = this.getBattlePriority(battleResult);
                        return {
                            priority,
                            battleResult
                        }
                    }
                }
            }).compact().sortBy('priority').first();
    }

    static isHighlyEffectiveBattle(battleResult) {
        return battleResult.willCauseLeaderLoss(battleResult.canAmbush) ||
               battleResult.willCauseAllyLoss(battleResult.canAmbush) ||
               battleResult.willCauseCitadelLoss(battleResult.canAmbush) ||
               battleResult.willCauseLegionLoss(battleResult.canAmbush);
    }

    static isEffectiveBattle(battleResult) {
        if (this.isHighlyEffectiveBattle(battleResult)) {
            return true;
        }

        return this.willCauseEnoughDefenderLosses(battleResult);
    }

    static mostDefenderLosses(battleResult) {
        return Math.max(battleResult.worstCaseDefenderLosses.normal,
                        (battleResult.canAmbush ? battleResult.worstCaseDefenderLosses.ambush : 0))
    }

    static willCauseEnoughDefenderLosses(battleResult) {
        if (battleResult.worstCaseDefenderLosses.normal > 0 && battleResult.worstCaseDefenderLosses.normal >= battleResult.worstCaseAttackerLosses.normal) {
            return true;
        }

        return battleResult.canAmbush && battleResult.worstCaseDefenderLosses.ambush > 0 && battleResult.worstCaseDefenderLosses.ambush >= battleResult.worstCaseAttackerLosses.ambush;
    }

    static getBattlePriority(battleResult) {
        const enemyPriority = EnemyFactionPriority[battleResult.defendingFaction.id];
        if (battleResult.willCauseLeaderLoss(battleResult.canAmbush)) {
            return 'a' + enemyPriority;
        }
        else if (battleResult.willCauseAllyLoss(battleResult.canAmbush)) {
            return 'b' + enemyPriority;
        }
        else if (battleResult.willCauseCitadelLoss(battleResult.canAmbush)) {
            return 'c' + enemyPriority;
        }
        else if (battleResult.willCauseLegionLoss(battleResult.canAmbush)) {
            return 'd';
        }
        else if (this.willCauseEnoughDefenderLosses(battleResult)) {
            return 'e' + (100 - this.mostDefenderLosses(battleResult)) + enemyPriority;
        }
        else {
            return 'f';
        }
    }

    static shouldAmbush(battleResult) {
        if (!battleResult.canAmbush) {
            return false;
        }
        if (!battleResult.willCauseLeaderLoss() && battleResult.willCauseLeaderLoss(true)) {
            return true;
        }
        if (!battleResult.willCauseAllyLoss() && battleResult.willCauseAllyLoss(true)) {
            return true;
        }
        if (!battleResult.willCauseCitadelLoss() && battleResult.willCauseCitadelLoss(true)) {
            return true;
        }
        if (!battleResult.willCauseLegionLoss() && battleResult.willCauseLegionLoss(true)) {
            return true;
        }
        if (battleResult.worstCaseDefenderLosses.normal < battleResult.worstCaseDefenderLosses.ambush) {
            return true;
        }
        if (battleResult.worstCaseAttackerLosses.ambush < battleResult.worstCaseAttackerLosses.normal) {
            return true;
        }

        return false;
    }
}

export default AeduiBattle;