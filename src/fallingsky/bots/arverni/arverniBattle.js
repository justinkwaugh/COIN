import _ from '../../../lib/lodash';
import CommandIDs from '../../config/commandIds';
import SpecialAbilityIDs from '../../config/specialAbilityIds';
import FactionIDs from '../../config/factionIds';
import Battle from '../../commands/battle';
import EnemyFactionPriority from './enemyFactionPriority';
import ArverniDevastate from './arverniDevastate';
import ArverniEntreat from './arverniEntreat';
import ArverniMarch from './arverniMarch';
import RemoveResources from '../../actions/removeResources';
import FactionActions from '../../../common/factionActions';

const Checkpoints = {
    PRE_BATTLE_SPECIAL_CHECK: 'pre-battle-special'
};

class ArverniBattle {

    static battle(state, modifiers) {
        const arverni = state.arverni;
        const turn = state.turnHistory.getCurrentTurn();

        if (arverni.resources() === 0 && !modifiers.free) {
            return false;
        }

        const battles = modifiers.context.battles || this.getBattleList(state, modifiers);

        // Allow battle list to be attempted first, because it has a side effect that it might signify the need to threat march
        if (!modifiers.isCommandAllowed(CommandIDs.BATTLE) || battles.length === 0) {
            return false;
        }

        turn.startCommand(CommandIDs.BATTLE);
        modifiers.context.battles = battles;

        if (!turn.getCheckpoint(Checkpoints.PRE_BATTLE_SPECIAL_CHECK)) {
            const ambushed = _.find(battles, {willAmbush: true});
            if (ambushed) {
                turn.startSpecialAbility(SpecialAbilityIDs.AMBUSH);
                turn.commitSpecialAbility();
                modifiers.context.didPreBattleSpecial = true;
            }
            else if (!ambushed && modifiers.canDoSpecial()) {
                modifiers.context.didPreBattleSpecial = ArverniDevastate.devastate(state,
                                                                                   modifiers) || ArverniEntreat.entreat(
                        state, modifiers);
            }
            turn.markCheckpoint(Checkpoints.PRE_BATTLE_SPECIAL_CHECK);
        }

        _.each(battles, (battle) => {
            if (!battle.complete) {
                if (!battle.paid && !modifiers.free) {
                    RemoveResources.execute(state, {factionId: FactionIDs.ARVERNI, count: battle.cost});
                    battle.paid = true;
                }
                Battle.execute(state, {battleResults: battle});
            }
        });

        turn.commitCommand();
        modifiers.context.battles = null;

        return modifiers.context.didPreBattleSpecial ? FactionActions.COMMAND_AND_SPECIAL : FactionActions.COMMAND;
    }

    static getBattleList(state, modifiers) {
        const arverni = state.arverni;
        console.log('*** Are there any effective Arverni Battles? ***');

        const importantBattleRegions = this.findImportantBattleRegions(state, modifiers);
        if (importantBattleRegions.length === 0) {
            return [];
        }

        const battlegrounds = this.findBattlegrounds(state, modifiers, importantBattleRegions);
        const prioritizedBattles = this.prioritizeBattles(state, battlegrounds);

        if (prioritizedBattles.length === 0 ||
            this.isVercingetorixInDangerWithoutBattle(state,
                                                      importantBattleRegions,
                                                      battlegrounds)) {
            if (!arverni.hasAvailableLeader()) {
                modifiers.context.tryThreatMarch = true;
            }
            return [];
        }

        let battles = modifiers.free ? prioritizedBattles : _.reduce(prioritizedBattles, (accumulator, battle) => {
            if (accumulator.resourcesRemaining >= battle.cost) {
                accumulator.resourcesRemaining -= battle.cost;
                accumulator.battles.push(battle);
            }
            return accumulator
        }, {resourcesRemaining: arverni.resources(), battles: []}).battles;

        if (battles.length > 0) {
            if (modifiers.limited) {
                battles = _.take(battles, 1);
            }

            if (modifiers.canDoSpecial() && (this.needAmbush(battles[0]) || modifiers.context.litaviccus)) {
                _.each(battles, (battle) => {
                    battle.willAmbush = true;
                });
            }

            _.each(battles, battle => {
                battle.theProvince = modifiers.context.theProvince;
            });
        }

        return battles;
    }

    static findImportantBattleRegions(state, modifiers) {
        return _(state.regions).map(
            (region) => {
                const piecesByType = _.groupBy(region.piecesByFaction()[FactionIDs.ARVERNI], 'type');
                const hasVercingetorix = piecesByType.leader && !piecesByType.leader[0].isSuccessor();
                let numWarbands = (piecesByType.warband || []).length;
                if(modifiers.context.litaviccus) {
                    numWarbands += region.getWarbandsOrAuxiliaForFaction(FactionIDs.AEDUI).length;
                }

                if (!hasVercingetorix && numWarbands <= 7) {
                    return;
                }

                const importantEnemies = _(EnemyFactionPriority).keys().filter(
                    function (factionId) {
                        const enemyPieces = region.piecesByFaction()[factionId] || [];
                        const enemyPiecesByType = _.groupBy(enemyPieces, 'type');

                        if(modifiers.context.litaviccus && factionId !== FactionIDs.ROMANS) {
                            return false;
                        }

                        return factionId !== FactionIDs.GERMANIC_TRIBES && factionId !== FactionIDs.BELGAE && (enemyPieces.length > 3 || enemyPiecesByType.alliedtribe || enemyPiecesByType.citadel || enemyPiecesByType.legion);
                    }).value();

                if (importantEnemies.length) {
                    return {
                        region,
                        hasVercingetorix,
                        importantEnemies
                    };
                }
            }).compact().value();
    }

    static findBattlegrounds(state, modifiers, importantRegions) {
        return _(state.regions).map(
            (region) => {
                const piecesByType = _.groupBy(region.piecesByFaction()[FactionIDs.ARVERNI], 'type');
                const hasVercingetorix = piecesByType.leader && !piecesByType.leader[0].isSuccessor();
                let warbands = piecesByType.warband || [];
                if(modifiers.context.litaviccus) {
                    warbands = _.concat(warbands, region.getWarbandsOrAuxiliaForFaction(FactionIDs.AEDUI));
                }

                if (!piecesByType.leader && warbands.length <= 7) {
                    return;
                }

                const potentialBattles = _(EnemyFactionPriority).keys().map(
                    (factionId) => {
                        if (factionId === FactionIDs.GERMANIC_TRIBES || factionId === FactionIDs.BELGAE) {
                            return;
                        }

                        if(modifiers.context.litaviccus && factionId !== FactionIDs.ROMANS) {
                            return;
                        }

                        const enemyPieces = region.piecesByFaction()[factionId] || [];
                        if (enemyPieces.length === 0) {
                            return;
                        }
                        const battleResult = Battle.test(
                            state, {
                                region: region,
                                attackingFactionId: FactionIDs.ARVERNI,
                                defendingFactionId: factionId,
                                helpingFactionId: modifiers.context.litaviccus ? FactionIDs.AEDUI : null,
                                theProvince: modifiers.context.theProvince
                            });

                        if (!this.isEffectiveBattle(battleResult)) {
                            return;
                        }

                        return battleResult;
                    }).compact().value();

                const importantRegionData = _.find(importantRegions, regionData => regionData.region.id === region.id);
                const importantEnemies = importantRegionData ? importantRegionData.importantEnemies : null;

                if (potentialBattles.length) {
                    return {
                        region,
                        warbands,
                        hasVercingetorix,
                        potentialBattles,
                        importantEnemies
                    };
                }
            }).compact().value();
    }

    static isEffectiveBattle(battleResult) {
        return this.isLossInflictedOnLegion(battleResult) || this.willCauseEnoughDefenderLosses(battleResult);
    }

    static isLossInflictedOnLegion(battleResult) {
        return battleResult.willInflictLossAgainstLegion(battleResult.canAmbush);
    }

    static willCauseEnoughDefenderLosses(battleResult) {
        if (battleResult.worstCaseDefenderLosses.normal > 0 && battleResult.worstCaseDefenderLosses.normal >= battleResult.worstCaseAttackerLosses.normal) {
            return true;
        }

        return battleResult.canAmbush && battleResult.worstCaseDefenderLosses.ambush > 0 && battleResult.worstCaseDefenderLosses.ambush >= battleResult.worstCaseAttackerLosses.ambush;
    }

    static isVercingetorixInDangerWithoutBattle(state, importantBattleRegions, battlegrounds) {
        const vercingetorixInDanger = _.find(importantBattleRegions, {hasVercingetorix: true});
        if (!vercingetorixInDanger) {
            return false;
        }

        const vercingetorixBattleground = _.find(battlegrounds, {hasVercingetorix: true});
        if (!vercingetorixBattleground) {
            return true;
        }

        const willBattleRomans = this.getVercingetorixBattleWithRomans(vercingetorixBattleground);
        const willBattleAedui = this.willVercingetorixBattleAedui(state, vercingetorixBattleground);
        const canAfford = state.arverni.resources() >= (vercingetorixBattleground.region.devastated() ? 2 : 1);

        return !canAfford || (!willBattleRomans && !willBattleAedui);
    }

    static prioritizeBattles(state, battlegrounds) {
        return _(battlegrounds).map(
            (battleground) => {
                let priority = 'c';

                const bestBattle = this.getBestBattleForBattleground(state, battleground);

                if (battleground.hasVercingetorix) {
                    priority = 'a';
                }
                else if (_.indexOf(battleground.importantEnemies, bestBattle.defendingFactionId) >= 0) {
                    priority = 'b';
                }

                if (bestBattle) {
                    return {
                        priority,
                        bestBattle
                    };
                }
            }).compact().sortBy('priority').groupBy('priority').map(_.shuffle).flatten().map('bestBattle').value();
    }

    static getBestBattleForBattleground(state, battleground) {

        let bestBattle = null;
        if (battleground.hasAmbiorix) {
            bestBattle = this.getVercingetorixBattleWithRomans(battleground);
            if (!bestBattle) {
                // Should find the one that meets condition?
                bestBattle = _.find(battleground.potentialBattles,
                                    potentialBattle => potentialBattle.defendingFactionId === FactionIDs.AEDUI);
            }
        }
        else {
            bestBattle = _(battleground.potentialBattles).sortBy(
                potentialBattle => (_.indexOf(
                    battleground.importantEnemies, potentialBattle.defendingFactionId) >= 0 ? 'a' : 'b') +
                                   EnemyFactionPriority[potentialBattle.defendingFactionId]).first();
        }

        return bestBattle;
    }

    static getVercingetorixBattleWithRomans(battleground) {
        return _.find(
            battleground.potentialBattles, function (potentialBattle) {
                if (potentialBattle.defendingFactionId !== FactionIDs.ROMANS) {
                    return false;
                }
                const battleRegion = battleground.region;
                const leader = battleRegion.getLeaderForFaction(FactionIDs.ROMANS);
                const caesar = leader && !leader.isSuccessor();
                const numRomanMobile = battleRegion.getMobilePiecesForFaction(FactionIDs.ROMANS).length;
                return !caesar || ((numRomanMobile * 2) < battleground.warbands.length + 1);
            });
    }

    static willVercingetorixBattleAedui(state, battleground) {
        const romansPresent = battleground.region.piecesByFaction()[FactionIDs.ROMANS];
        const aeduiBattle = _.find(battleground.potentialBattles,
                                   potentialBattle => potentialBattle.defendingFactionId === FactionIDs.AEDUI);
        return !romansPresent && aeduiBattle;
    }

    static needAmbush(battle) {
        return battle.canAmbush &&
               battle.worstCaseAttackerLosses.normal > 0 ||
               battle.worstCaseDefenderLosses.ambush > battle.worstCaseDefenderLosses.normal;
    }
}

export default ArverniBattle;