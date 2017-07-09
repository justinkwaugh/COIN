import _ from '../../../lib/lodash';
import CommandIDs from '../../config/commandIds';
import SpecialAbilityIDs from '../../config/specialAbilityIds';
import FactionIDs from '../../config/factionIds';
import Battle from '../../commands/battle';
import EnemyFactionPriority from './enemyFactionPriority';
import BelgaeRampage from './belgaeRampage';
import BelgaeEnlist from './belgaeEnlist';
import BelgaeMarch from './belgaeMarch';
import RemoveResources from '../../actions/removeResources';
import FactionActions from '../../../common/factionActions';

const Checkpoints = {
    PRE_BATTLE_SPECIAL_CHECK: 'pre-battle-special'
};

class BelgaeBattle {

    static battle(state, modifiers) {
        const belgae = state.belgae;
        const turn = state.turnHistory.getCurrentTurn();

        if (belgae.resources() === 0 && !modifiers.free) {
            return false;
        }

        const battles = modifiers.context.battles || this.getBattleList(state, modifiers);
        if (battles.length === 0) {
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
                modifiers.context.didPreBattleSpecial = BelgaeRampage.rampage(state, modifiers) ||
                                                        BelgaeEnlist.enlist(state, modifiers);
            }
            turn.markCheckpoint(Checkpoints.PRE_BATTLE_SPECIAL_CHECK);
        }

        _.each(battles, (battle) => {
            if (!battle.complete) {
                if (!battle.paid && !modifiers.free) {
                    RemoveResources.execute(state, {factionId: FactionIDs.BELGAE, count: battle.cost});
                    battle.paid = true;
                }
                Battle.execute(state, {battleResults: battle});
            }
        });

        turn.commitCommand();
        modifiers.context.battles = null;

        let didSpecial = modifiers.context.didPreBattleSpecial;
        if (modifiers.canDoSpecial() && !didSpecial) {
            didSpecial = BelgaeEnlist.enlist(state, modifiers);
        }

        return didSpecial ? FactionActions.COMMAND_AND_SPECIAL : FactionActions.COMMAND;
    }

    static getBattleList(state, modifiers) {
        const belgae = state.belgae;
        console.log('*** Are there any effective Belgae Battles? ***');

        const importantBattleRegions = this.findImportantBattleRegions(state, modifiers);
        if (importantBattleRegions.length === 0) {
            return false;
        }

        const battlegrounds = this.findBattlegrounds(state, modifiers, importantBattleRegions);
        const prioritizedBattles = this.prioritizeBattles(state, battlegrounds);

        if (prioritizedBattles.length === 0 || this.isAmbiorixInDangerWithoutBattle(state, importantBattleRegions, battlegrounds)) {
            modifiers.context.threatRegions = _.map(importantBattleRegions, importantRegion => importantRegion.region.id);
            modifiers.context.tryThreatMarch = true;
            return [];
        }

        let battles = modifiers.free ? prioritizedBattles : _.reduce(prioritizedBattles, (accumulator, battle) => {
            if (accumulator.resourcesRemaining >= battle.cost) {
                accumulator.resourcesRemaining -= battle.cost;
                accumulator.battles.push(battle);
            }
            return accumulator
        }, {resourcesRemaining: belgae.resources(), battles: []}).battles;

        if (battles.length > 0) {
            if (modifiers.limited) {
                battles = _.take(battles, 1);
            }

            if (modifiers.canDoSpecial() && this.needAmbush(battles[0])) {
                _.each(battles, (battle) => {
                    battle.willAmbush = true;
                });

            }
        }

        return battles;
    }

    static findImportantBattleRegions(state, modifiers) {
        return _(state.regions).map(
            (region) => {
                const piecesByType = _.groupBy(region.piecesByFaction()[FactionIDs.BELGAE], 'type');
                const hasAmbiorix = piecesByType.leader && !piecesByType.leader[0].isSuccessor();
                const numWarbands = (piecesByType.warband || []).length;
                if (!hasAmbiorix && numWarbands <= 3) {
                    return;
                }

                const importantEnemies = _(EnemyFactionPriority).keys().filter(
                    function (factionId) {
                        const enemyPieces = region.piecesByFaction()[factionId] || [];
                        const enemyPiecesByType = _.groupBy(enemyPieces, 'type');

                        return factionId !== FactionIDs.GERMANIC_TRIBES && (enemyPieces.length > 3 || enemyPiecesByType.alliedtribe || enemyPiecesByType.citadel || enemyPiecesByType.legion);
                    }).value();

                if (importantEnemies.length) {
                    return {
                        region,
                        hasAmbiorix,
                        importantEnemies
                    }
                }
            }).compact().value();
    }

    static findBattlegrounds(state, modifiers, importantRegions) {
        return _(state.regions).map(
            (region) => {
                const piecesByType = _.groupBy(region.piecesByFaction()[FactionIDs.BELGAE], 'type');
                const hasAmbiorix = piecesByType.leader && !piecesByType.leader[0].isSuccessor();
                const warbands = piecesByType.warband || [];
                if (!piecesByType.leader && warbands.length <= 3) {
                    return;
                }

                const potentialBattles = _(EnemyFactionPriority).keys().map(
                    (factionId) => {
                        if (factionId === FactionIDs.GERMANIC_TRIBES) {
                            return;
                        }
                        const enemyPieces = region.piecesByFaction()[factionId] || [];
                        if (enemyPieces.length === 0) {
                            return;
                        }
                        const battleResult = Battle.test(
                            state, {
                                region: region,
                                attackingFactionId: FactionIDs.BELGAE,
                                defendingFactionId: factionId
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
                        hasAmbiorix,
                        potentialBattles,
                        importantEnemies
                    }
                }
            }).compact().value();
    }

    static isEffectiveBattle(battleResult) {
        return this.willCauseEnoughDefenderLosses(battleResult);
    }

    static willCauseEnoughDefenderLosses(battleResult) {
        if (battleResult.worstCaseDefenderLosses.normal > 0 && battleResult.worstCaseDefenderLosses.normal >= battleResult.worstCaseAttackerLosses.normal) {
            return true;
        }

        return battleResult.canAmbush && battleResult.worstCaseDefenderLosses.ambush > 0 && battleResult.worstCaseDefenderLosses.ambush >= battleResult.worstCaseAttackerLosses.ambush;
    }

    static isAmbiorixInDangerWithoutBattle(state, importantBattleRegions, battlegrounds) {
        const ambiorixInDanger = _.find(importantBattleRegions, {hasAmbiorix: true});
        if (!ambiorixInDanger) {
            return false;
        }

        const ambiorixBattleground = _.find(battlegrounds, {hasAmbiorix: true});

        if (!ambiorixBattleground) {
            return true;
        }

        const willBattleRomans = this.getAmbiorixBattleWithRomans(ambiorixBattleground);
        const willBattleGauls = this.willAmbiorixBattleGallicFaction(state, ambiorixBattleground);
        const canAfford = state.belgae.resources() >= (ambiorixBattleground.region.devastated() ? 2 : 1);

        return !canAfford || (!willBattleRomans && !willBattleGauls);
    }

    static prioritizeBattles(state, battlegrounds) {
        return _(battlegrounds).map(
            (battleground) => {
                let priority = 'c';

                const bestBattle = this.getBestBattleForBattleground(state, battleground);

                if (battleground.hasAmbiorix) {
                    priority = 'a';
                }
                else if (_.indexOf(battleground.importantEnemies, bestBattle.defendingFaction.id) >= 0) {
                    priority = 'b';
                }

                if (bestBattle) {
                    return {
                        priority,
                        bestBattle
                    }
                }
            }).compact().sortBy('priority').groupBy('priority').map(_.shuffle).flatten().map('bestBattle').value();
    }

    static getBestBattleForBattleground(state, battleground) {

        let bestBattle = null;
        if (battleground.hasAmbiorix) {
            bestBattle = this.getAmbiorixBattleWithRomans(battleground);
            if (!bestBattle) {
                // Should find the one that meets condition?
                bestBattle = _.find(battleground.potentialBattles, potentialBattle => potentialBattle.defendingFaction.id !== FactionIDs.ROMANS);
            }
        }
        else {
            bestBattle = _(battleground.potentialBattles).sortBy(
                potentialBattle => (_.indexOf(
                    battleground.importantEnemies, potentialBattle.defendingFaction.id) >= 0 ? 'a' : 'b') +
                                   EnemyFactionPriority[potentialBattle.defendingFaction.id]).first();
        }

        return bestBattle;
    }

    static getAmbiorixBattleWithRomans(battleground) {
        return _.find(
            battleground.potentialBattles, function (potentialBattle) {
                if (potentialBattle.defendingFaction.id !== FactionIDs.ROMANS) {
                    return false;
                }
                const numRomanMobile = battleground.region.getMobilePiecesForFaction(FactionIDs.ROMANS).length;
                return numRomanMobile < battleground.warbands.length + 1;
            });
    }

    static willAmbiorixBattleGallicFaction(state, battleground) {
        const romansPresent = battleground.region.piecesByFaction()[FactionIDs.ROMANS];
        const gallicBattle = _.find(battleground.potentialBattles, potentialBattle => potentialBattle.defendingFaction.id !== FactionIDs.ROMANS);
        return !romansPresent && gallicBattle;
    }

    static needAmbush(battle) {
        return battle.canAmbush &&
               battle.worstCaseAttackerLosses.normal > 0 ||
               battle.worstCaseDefenderLosses.ambush > battle.worstCaseDefenderLosses.normal;
    }
}

export default BelgaeBattle;