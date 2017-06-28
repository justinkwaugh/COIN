import _ from '../../../lib/lodash';
import CommandIDs from '../../config/commandIds';
import SpecialAbilityIDs from '../../config/specialAbilityIds';
import FactionIDs from '../../config/factionIds';
import Battle from '../../commands/battle';
import EnemyFactionPriority from './enemyFactionPriority';
import BelgaeRampage from './belgaeRampage';
import BelgaeEnlist from './belgaeEnlist';
import BelgaeMarch from './belgaeMarch';
import CommandModifier from '../../commands/commandModifiers';
import RemoveResources from '../../actions/removeResources';
import FactionActions from '../../../common/factionActions';

class BelgaeBattle {

    static battle(state, modifiers) {

        const importantBattleRegions = this.findImportantBattleRegions(state, modifiers);
        if (importantBattleRegions.length === 0) {
            return false;
        }

        const battlegrounds = this.findBattlegrounds(state, modifiers, importantBattleRegions);
        const prioritizedBattles = this.prioritizeBattles(state, battlegrounds);

        if (prioritizedBattles.length === 0 || this.isAmbiorixInDangerWithoutBattle(state, importantBattleRegions, battlegrounds)) {
            modifiers.commandSpecific.threatRegions = _.map(importantBattleRegions, importantRegion => importantRegion.region.id);
            return BelgaeMarch.march(state, modifiers);
        }

        const belgae = state.belgae;
        if (belgae.resources() < (prioritizedBattles[0].region.devastated() ? 2 : 1)) {
            return false;
        }

        const willAmbush = modifiers.canDoSpecial() && this.needAmbush(prioritizedBattles[0]);
        let didSpecial = willAmbush;
        if (!didSpecial && modifiers.canDoSpecial()) {
            didSpecial = BelgaeRampage.rampage(
                    state, new CommandModifier(
                        {
                            commandSpecific: {
                                battles: prioritizedBattles
                            }
                        })) || BelgaeEnlist.enlist(
                    state, new CommandModifier(
                        {
                            commandSpecific: {
                                battles: prioritizedBattles
                            }
                        }));
        }

        state.turnHistory.getCurrentTurn().startCommand(CommandIDs.BATTLE);
        _.each(
            prioritizedBattles, (battle,index) => {
                const cost = battle.region.devastated() ? 2 : 1;
                if (belgae.resources() < cost) {
                    return false;
                }

                if(index===0 && willAmbush) {
                    state.turnHistory.getCurrentTurn().startSpecialAbility(SpecialAbilityIDs.AMBUSH);
                    state.turnHistory.getCurrentTurn().commitSpecialAbility();
                }

                Battle.execute(
                    state, {
                        region: battle.region,
                        attackingFaction: battle.attackingFaction,
                        defendingFaction: battle.defendingFaction,
                        ambush: willAmbush,
                        enlistGermans: battle.canEnlistGermans
                    });
                RemoveResources.execute(state, { factionId: FactionIDs.BELGAE, count: cost});
            });
        state.turnHistory.getCurrentTurn().commitCommand();

        if (modifiers.canDoSpecial() && !didSpecial) {
            didSpecial = BelgaeEnlist.enlist(
                state, new CommandModifier());
        }

        return didSpecial ? FactionActions.COMMAND_AND_SPECIAL : FactionActions.COMMAND;
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