import _ from '../../../lib/lodash';
import CommandIDs from '../../config/commandIds';
import SpecialAbilityIDs from '../../config/specialAbilityIds';
import FactionIDs from '../../config/factionIds';
import Battle from '../../commands/battle';
import EnemyFactionPriority from './enemyFactionPriority';
import RemoveResources from '../../actions/removeResources';
import FactionActions from '../../../common/factionActions';
import RomanBesiege from 'fallingsky/bots/romans/romanBesiege';
import Enlist from 'fallingsky/commands/belgae/enlist';
import Rampage from 'fallingsky/commands/belgae/rampage';
import RomanUtils from 'fallingsky/bots/romans/romanUtils';

const Checkpoints = {
    PRE_BATTLE_SPECIAL_CHECK: 'pre-battle-special'
};

class RomanBattle {

    static battle(state, modifiers) {
        const romans = state.romans;
        const turn = state.turnHistory.getCurrentTurn();

        if (romans.resources() === 0 && !modifiers.free) {
            return false;
        }

        const battles = modifiers.context.battles || this.getBattleList(state, modifiers);
        if (battles.length === 0) {
            return false;
        }

        turn.startCommand(CommandIDs.BATTLE);
        modifiers.context.battles = battles;

        if (!turn.getCheckpoint(Checkpoints.PRE_BATTLE_SPECIAL_CHECK) && modifiers.canDoSpecial()) {
            modifiers.context.didPreBattleSpecial = RomanBesiege.besiege(state, modifiers);
            turn.markCheckpoint(Checkpoints.PRE_BATTLE_SPECIAL_CHECK);
        }

        _.each(battles, (battle) => {
            if (!battle.complete) {
                Battle.execute(state, {battleResults: battle});
                if (!battle.paid && !modifiers.free) {
                    RemoveResources.execute(state, {factionId: FactionIDs.ROMANS, count: battle.cost});
                    battle.paid = true;
                }
            }
        });

        turn.commitCommand();
        modifiers.context.battles = null;

        let didSpecial = modifiers.context.didPreBattleSpecial;
        if (modifiers.canDoSpecial() && !didSpecial) {
            // didSpecial = RomanScout.scout(state, modifiers);
        }

        return didSpecial ? FactionActions.COMMAND_AND_SPECIAL : FactionActions.COMMAND;
    }

    static getBattleList(state, modifiers) {
        const romans = state.romans;
        console.log('*** Are there any effective Roman Battles? ***');

        const importantBattleRegions = this.findImportantBattleRegions(state, modifiers);
        if (importantBattleRegions.length === 0) {
            return [];
        }

        const battlegrounds = this.findBattlegrounds(state, modifiers, importantBattleRegions);
        const prioritizedBattles = this.prioritizeBattles(state, battlegrounds);

        if (prioritizedBattles.length === 0) {
            modifiers.context.threatRegions = _.map(importantBattleRegions, importantRegion => importantRegion.region.id);
            modifiers.context.tryThreatMarch = true;
            return [];
        }

        let battles = modifiers.free ? prioritizedBattles : _.reduce(prioritizedBattles, (accumulator, battle) => {
            if (accumulator.resourcesRemaining >= battle.cost) {
                accumulator.resourcesRemaining -= battle.cost;
                accumulator.battles.push(battle);
            }
            return accumulator;
        }, {resourcesRemaining: romans.resources(), battles: []}).battles;

        if (battles.length > 0 && modifiers.limited) {
            battles = _.take(battles, 1);
        }

        return battles;
    }

    static findImportantBattleRegions(state, modifiers) {
        return _(state.regions).map(
            (region) => {
                const leader = region.getLeaderForFaction(FactionIDs.ROMANS);
                const hasCaesar = leader && !leader.isSuccessor();
                const numLegions = region.getLegions().length;

                if (!hasCaesar && numLegions === 0) {
                    return;
                }

                const importantEnemyData = _(EnemyFactionPriority).keys().map(
                    function (factionId) {
                        const hasLeader = region.getLeaderForFaction(factionId);
                        const numAlliesAndCitadels = region.numAlliesAndCitadelsForFaction(factionId);
                        const hasControl = region.controllingFactionId() === factionId;

                        const willInflictCriticalLoss = RomanUtils.canEnemyTurnInflictCriticalLoss(state, region, factionId);
                        if (!hasLeader && numAlliesAndCitadels === 0 && !hasControl && !willInflictCriticalLoss) {
                            return;
                        }

                        return {
                            factionId,
                            hasLeader,
                            numAlliesAndCitadels,
                            hasControl,
                            willInflictCriticalLoss
                        }
                    }).compact().value();

                if (importantEnemyData.length > 0) {
                    return {
                        region,
                        hasCaesar,
                        numLegions,
                        importantEnemyData
                    };
                }
            }).compact().value();
    }

    static findBattlegrounds(state, modifiers, importantRegions) {
        return _(state.regions).map(
            (region) => {
                const importantRegionData = _.find(importantRegions, regionData => regionData.region.id === region.id);
                const importantEnemyData = importantRegionData ? _.keyBy(importantRegionData.importantEnemyData, 'factionId') : {};

                if (!importantEnemyData) {
                    return;
                }

                const numCriticalEnemies = _.reduce(importantEnemyData, (sum, enemyData, factionId) => {
                    return enemyData.willInflictCriticalLoss ? sum + 1 : sum;
                    }, 0 );

                if(numCriticalEnemies > 1) {
                    // Too many threats... run away! (Not necessarily part of rules)
                    return;
                }

                const potentialBattles = _(EnemyFactionPriority).keys().map(
                    (factionId) => {

                        const enemyPieces = region.getPiecesForFaction(factionId);
                        if (enemyPieces.length === 0) {
                            return;
                        }

                        if(!importantEnemyData[factionId]) {
                            return;
                        }

                        const battleResult = Battle.test(
                            state, {
                                region: region,
                                attackingFactionId: FactionIDs.ROMANS,
                                defendingFactionId: factionId
                            });

                        if (!this.isEffectiveBattle(battleResult)) {
                            return;
                        }

                        return battleResult;
                    }).compact().value();

                if (potentialBattles.length) {
                    return {
                        region,
                        potentialBattles,
                        importantEnemyData
                    };
                }
            }).compact().value();
    }

    static isEffectiveBattle(battleResult) {
        return !this.isCounterattackLossInflictedOnLegion(battleResult) && this.willCauseEnoughDefenderLosses(
                battleResult);
    }

    static isCounterattackLossInflictedOnLegion(battleResult) {
        return battleResult.willInflictCounterattackLossAgainstLegion();
    }

    static willCauseEnoughDefenderLosses(battleResult) {
        // 8.8.1 They do so only in Regions where the Defender would inflict less than half the Losses (as distinct from removals) on the Romans
        // as the Romans would inflict
        return battleResult.defenderLosses.normal > 0 && battleResult.worstCaseAttackerLosses.normal < (battleResult.defenderLosses.normal / 2);
    }

    static prioritizeBattles(state, battlegrounds) {
        return _(battlegrounds).map(
            (battleground) => {
                return this.getBestBattleForBattleground(state, battleground);
            }).sortBy('priority').groupBy('priority').map(_.shuffle).flatten().map('battle').value();
    }

    static getBestBattleForBattleground(state, battleground) {
        return _(battleground.potentialBattles).map(
            (potentialBattle) => {
                let priority;
                const enemyData = battleground.importantEnemyData[potentialBattle.defendingFaction.id];

                if (enemyData.hasLeader) {
                    priority = 'a-';
                }

                if (enemyData.numAlliesAndCitadels > 0) {
                    priority += 'b' + (99 - enemyData.numAlliesAndCitadels) + '-';
                }

                priority += 'c' + (99 - potentialBattle.region.getWarbandsOrAuxiliaForFaction(
                        potentialBattle.defendingFaction.id).length);

                const faction = state.factionsById[potentialBattle.defendingFaction.id];
                const player = state.playersByFaction[potentialBattle.defendingFaction.id];
                priority += '-' + (50 - faction.victoryMargin(state)) + '-' + (player.isNonPlayer ? 'b' : 'a');
                return {
                    battle: potentialBattle,
                    priority
                }
            }).compact().sortBy('priority').groupBy('priority').map(_.shuffle).flatten().first();
    }

}

export default RomanBattle;
