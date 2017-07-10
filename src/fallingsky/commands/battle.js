import _ from '../../lib/lodash';
import Command from './command';
import FactionIDs from '../config/factionIds';
import BattleResults from './battleResults';

import RevealPieces from '../actions/revealPieces';
import RemovePieces  from '../actions/removePieces';
import {CapabilityIDs} from '../config/capabilities';
import Losses from 'fallingsky/util/losses';

class Battle extends Command {

    static doTest(state, args) {
        const region = args.region;
        const enlistingGermans = args.enlistingGermans;
        const attackingFaction = args.attackingFaction;
        const defendingFaction = args.defendingFaction;
        const attackingPlayer = state.playersByFaction[attackingFaction.id];
        const defendingPlayer = state.playersByFaction[defendingFaction.id];

        let attackingPieces = region.piecesByFaction()[attackingFaction.id] || [];
        if (enlistingGermans) {
            const germanicPieces = region.piecesByFaction()[attackingFaction.id] || [];
            attackingPieces = _.concat(attackingPieces, germanicPieces);
        }
        const defendingPieces = region.piecesByFaction()[defendingFaction.id] || [];

        const canAmbush = !enlistingGermans && this.canAmbush(state, region, attackingFaction, attackingPieces,
                                                              defendingPieces);
        const defenderCanRetreat = this.canRetreat(attackingFaction, defendingFaction, region);

        // Base Losses
        let unmodifiedDefenderLosses = Losses.calculateUnmodifiedLosses(state, attackingPieces);
        if (attackingFaction.id === FactionIDs.ARVERNI && state.hasUnshadedCapability(
                CapabilityIDs.MASSED_GALLIC_ARCHERS)) {
            unmodifiedDefenderLosses = Math.max(0, unmodifiedDefenderLosses - 1);
        }

        // No Retreat
        let noRetreatDefenderLosses = unmodifiedDefenderLosses;
        if (this.defenderHasCitadelOrFort(defendingPieces)) {
            noRetreatDefenderLosses /= 2;
        }
        noRetreatDefenderLosses = Math.floor(noRetreatDefenderLosses);


        const minNoRetreatDefenderLosses = Math.min(Math.floor(noRetreatDefenderLosses), defendingPieces.length);
        const noRetreatRollOrderedDefendingPieces = Losses.orderPiecesRollsFirst(defendingPieces, false);
        const worstCaseNoRetreatDefenderResults = this.calculateLeastAttackResults(noRetreatRollOrderedDefendingPieces,
                                                                                   minNoRetreatDefenderLosses, false);
        const worstCaseNoRetreatDefenderResultsWithAmbush = this.calculateLeastAttackResults(
            noRetreatRollOrderedDefendingPieces,
            minNoRetreatDefenderLosses, true);

        // Counterattack
        const defenderCanCounterattack = this.canCounterattack(false, minNoRetreatDefenderLosses, defendingPieces);
        const defenderCanCounterattackAmbush = this.canCounterattack(true, minNoRetreatDefenderLosses, defendingPieces);

        const worstCaseAttackerLosses = Math.min(
            Math.floor(Losses.calculateUnmodifiedLosses(state, worstCaseNoRetreatDefenderResults.remaining, true)),
            attackingPieces.length);
        const worstCaseAttackerLossesAmbush = defenderCanCounterattackAmbush ? worstCaseAttackerLosses : 0;

        const orderedAttackingPieces = Losses.orderPiecesForRemoval(state, attackingPieces, false);
        const worstCaseCounterattackResults = this.calculateAttackResults(orderedAttackingPieces,
                                                                          worstCaseAttackerLosses,
                                                                          false);
        const worstCaseCounterattackResultsWithAmbush = this.calculateAttackResults(orderedAttackingPieces,
                                                                                    worstCaseAttackerLossesAmbush,
                                                                                    false);

        // Retreat
        const retreatDefenderLosses = Math.floor(unmodifiedDefenderLosses / 2);
        const minRetreatDefenderLosses = Math.min(retreatDefenderLosses, defendingPieces.length);
        const retreatOrderedDefendingPieces = Losses.orderPiecesRollsFirst(defendingPieces, true);
        const worstCaseRetreatDefenderResults = this.calculateLeastAttackResults(retreatOrderedDefendingPieces,
                                                                                 minRetreatDefenderLosses, false);

        const worstCaseDefenderLosses = _.min(
            [(defenderCanRetreat ? worstCaseRetreatDefenderResults.targets.length : worstCaseNoRetreatDefenderResults.targets.length), worstCaseNoRetreatDefenderResults.targets.length, defendingPieces.length]);
        const worstCaseDefenderLossesAmbush = worstCaseNoRetreatDefenderResultsWithAmbush.targets.length;

        return new BattleResults(
            {
                region: region,
                cost: (region.devastated() ? 2 : 1) * (attackingFaction.id === FactionIDs.ROMANS ? 2 : 1),

                attackingFaction: attackingFaction,
                defendingFaction: defendingFaction,

                attackingPieces: attackingPieces,
                defendingPieces: defendingPieces,

                canAmbush: canAmbush,
                enlistingGermans: enlistingGermans,
                defenderCanRetreat: defenderCanRetreat,
                defenderCanCounterattack: {normal: defenderCanCounterattack, ambush: defenderCanCounterattackAmbush},

                defenderLosses: {normal: noRetreatDefenderLosses, retreat: retreatDefenderLosses},

                worstCaseRetreatDefenderResults: worstCaseRetreatDefenderResults,
                worstCaseNoRetreatDefenderResults: {
                    normal: worstCaseNoRetreatDefenderResults,
                    ambush: worstCaseNoRetreatDefenderResultsWithAmbush
                },
                worstCaseDefenderLosses: {normal: worstCaseDefenderLosses, ambush: worstCaseDefenderLossesAmbush},
                worstCaseAttackerLosses: {normal: worstCaseAttackerLosses, ambush: worstCaseAttackerLossesAmbush},
                worstCaseCounterattackResults: {
                    normal: worstCaseCounterattackResults,
                    ambush: worstCaseCounterattackResultsWithAmbush
                }
            });
    }

    static doExecute(state, args) {
        const battleResults = args.battleResults || args;
        const region = battleResults.region;
        const attackingFaction = battleResults.attackingFaction;
        const defendingFaction = battleResults.defendingFaction;
        const attackingPlayer = state.playersByFaction[attackingFaction.id];
        const defendingPlayer = state.playersByFaction[defendingFaction.id];
        const enlistingGermans = battleResults.willEnlistGermans;
        const ambush = battleResults.willAmbush;

        console.log(
            attackingFaction.name + ' is battling ' + defendingFaction.name + ' in region ' + region.name + (enlistingGermans ? ' with German help' : '' ));
        console.log('*** Battleground: ***');
        region.logState();
        console.log('*** Battle: ***');
        if (ambush) {
            console.log(attackingFaction.name + ' is ambushing!');
        }

        let attackingPieces = region.piecesByFaction()[attackingFaction.id];
        if (enlistingGermans) {
            const germanicPieces = region.piecesByFaction()[attackingFaction.id] || [];
            attackingPieces = _.concat(attackingPieces, germanicPieces);
        }

        if (!battleResults.calculatedDefenderResults) {
            const defendingPieces = region.piecesByFaction()[defendingFaction.id];

            let unmodifiedDefenderLosses = Losses.calculateUnmodifiedLosses(state, attackingPieces);
            if (attackingFaction.id === FactionIDs.ARVERNI && state.hasUnshadedCapability(
                    CapabilityIDs.MASSED_GALLIC_ARCHERS)) {
                unmodifiedDefenderLosses = Math.max(0, unmodifiedDefenderLosses - 1);
            }
            // No Retreat
            let noRetreatDefenderLosses = unmodifiedDefenderLosses;
            if (this.defenderHasCitadelOrFort(defendingPieces)) {
                noRetreatDefenderLosses /= 2;
            }
            noRetreatDefenderLosses = Math.floor(noRetreatDefenderLosses);

            if (this.partyHasUnshadedLegioX(state, region, defendingFaction)) {
                noRetreatDefenderLosses -= 1;
            }
            if (this.partyHasUnshadedLegioX(state, region, attackingFaction)) {
                noRetreatDefenderLosses += 2;
            }

            let defenderResults = {
                losses: noRetreatDefenderLosses,
                targets: [],
                remaining: []
            };

            if (!ambush && this.canRetreat(attackingFaction, defendingFaction, region)) {
                let retreatDefenderLosses = Math.floor(unmodifiedDefenderLosses / 2);
                if (this.partyHasUnshadedLegioX(state, region, defendingFaction)) {
                    retreatDefenderLosses -= 1;
                }
                if (this.partyHasUnshadedLegioX(state, region, attackingFaction)) {
                    retreatDefenderLosses += 2;
                }

                const retreatDeclaration = this.getRetreatDeclaration(state, region, attackingFaction,
                                                                       defendingFaction,
                                                                       noRetreatDefenderLosses,
                                                                       retreatDefenderLosses);
                if (retreatDeclaration.willRetreat) {
                    console.log(defendingFaction.name + ' is retreating!');
                    battleResults.willRetreat = true;
                    defenderResults.losses = retreatDefenderLosses;
                    defenderResults.agreeingFactionId = retreatDeclaration.agreeingFactionId;
                }
            }

            battleResults.calculatedDefenderResults = defenderResults
        }

        if (battleResults.willBesiege && !battleResults.besieged) {
            const pieceToRemove = _.find(battleResults.defendingPieces, {type: 'citadel'}) ||
                                  _.find(battleResults.defendingPieces, {type: 'alliedtribe'});
            if (pieceToRemove) {
                console.log('*** Attacker is Besieging ***');
                RemovePieces.execute(state,
                                     {
                                         factionId: defendingFaction.id,
                                         regionId: region.id,
                                         pieces: [pieceToRemove]
                                     });
            }
            battleResults.besieged = true;
        }

        if (!battleResults.committedDefenderResults) {
            this.handleLosses(state, battleResults, battleResults.calculatedDefenderResults, false);
            battleResults.committedDefenderResults = battleResults.calculatedDefenderResults;
        }


        if (battleResults.committedDefenderResults.counterattackPossible && !battleResults.willRetreat) {
            let attackerLosses = Math.floor(
                Losses.calculateUnmodifiedLosses(state, battleResults.committedDefenderResults.remaining, true));
            if (this.partyHasUnshadedLegioX(state, region, attackingFaction)) {
                attackerLosses -= 1;
            }
            if (this.partyHasUnshadedLegioX(state, region, defendingFaction)) {
                attackerLosses += 2;
            }
            if (attackerLosses > 0) {
                const counterattackResults = {
                    losses: attackerLosses,
                    targets: [],
                    remaining: []
                };
                this.handleLosses(state, battleResults, counterattackResults, true);
            }
        }

        if (battleResults.willRetreat && !battleResults.retreated) {
            this.handleRetreat(state, battleResults, battleResults.committedDefenderResults);
            battleResults.retreated = true;
        }

        if (!battleResults.willRetreat) {
            RevealPieces.execute(state, {factionId: attackingFaction.id, regionId: region.id});
            RevealPieces.execute(state, {factionId: defendingFaction.id, regionId: region.id});
        }

        if (ambush && state.hasShadedCapability(CapabilityIDs.BALLISTAE, attackingFaction.id)) {
            const citadelOrFort = _.find(region.getPiecesForFaction(defendingFaction.id),
                                         (piece) => piece.type === 'citadel' || piece.type === 'fort');
            if (citadelOrFort) {
                console.log('*** Attacker is using Ballistae ***');
                RemovePieces.execute(state,
                                     {
                                         factionId: defendingFaction.id,
                                         regionId: region.id,
                                         pieces: [citadelOrFort]
                                     });
            }
        }
        battleResults.complete = true;
        console.log('Battle complete');

    }

    static partyHasUnshadedLegioX(state, region, faction) {
        if (faction.id !== FactionIDs.ROMANS) {
            return false;
        }

        if (!region.getLeaderForFaction(FactionIDs.ROMANS) || region.getLegions().length === 0) {
            return false;
        }

        return state.hasUnshadedCapability(CapabilityIDs.LEGIO_X);
    }

    static getRetreatDeclaration(state, region, attackingFaction, defendingFaction, noRetreatLosses, retreatLosses) {

        const existingRetreatDeclaration = _.find(state.turnHistory.getCurrentTurn().getCurrentInteractions(),
                                                  interaction => interaction.type === 'RetreatDeclaration' && interaction.regionId === region.id && interaction.respondingFactionId === defendingFaction.id);

        if (existingRetreatDeclaration) {
            return { willRetreat : existingRetreatDeclaration.status === 'agreed' }
        }

        return state.playersByFaction[defendingFaction.id].willRetreat(state, region, attackingFaction,
                                                                       noRetreatLosses,
                                                                       retreatLosses);
    }

    static handleLosses(state, battleResults, attackResults, counterattack) {
        const defender = counterattack ? battleResults.attackingFaction : battleResults.defendingFaction;

        if (battleResults.region.getPiecesForFaction(defender.id).length === 0) {
            return;
        }

        const existingLosses = _.find(state.turnHistory.getCurrentTurn().getCurrentInteractions(),
                                      interaction => interaction.type === 'Losses' && interaction.regionId === battleResults.region.id && interaction.respondingFactionId === defender.id);
        if (existingLosses) {
            attackResults.removed = existingLosses.removed;
            attackResults.remaining = battleResults.region.getPiecesForFaction(defender.id);
            attackResults.counterattackPossible = !counterattack && (!battleResults.willAmbush || existingLosses.caesarCanCounterattack);
        }
        else {
            state.playersByFaction[defender.id].takeLosses(state, battleResults, attackResults, counterattack)
        }
    }

    static handleRetreat(state, battleResults, attackResults) {
        const defender = battleResults.defendingFaction;

        const existingRetreat = _.find(state.turnHistory.getCurrentTurn().getCurrentInteractions(),
                                       interaction => interaction.type === 'Retreat' && interaction.regionId === battleResults.region.id && interaction.respondingFactionId === defender.id);
        if (!existingRetreat) {
            state.playersByFaction[defender.id].retreatFromBattle(state, battleResults, attackResults);
        }
    }

    static canRetreat(attackingFaction, defendingFaction, region) {

        // Germans always ambush
        if (attackingFaction.id === FactionIDs.GERMANIC_TRIBES) {
            return false;
        }

        // Germans never retreat
        if (defendingFaction.id === FactionIDs.GERMANIC_TRIBES) {
            return false;
        }

        // Have to have mobile pieces to retreat
        const mobileDefenders = _.filter(
            region.piecesByFaction()[defendingFaction.id], function (piece) {
                return piece.isMobile;
            });

        if (mobileDefenders.length === 0) {
            return false;
        }

        // Have to have a non-german and non-controlled adjacent region, or be defending against romans
        const adjacentNonGermanicControlledRegion = _.find(
            region.adjacent, function (adjacentRegion) {
                return adjacentRegion.controllingFactionId() && adjacentRegion.controllingFactionId() !== FactionIDs.GERMANIC_TRIBES;
            });

        if (!adjacentNonGermanicControlledRegion && attackingFaction.id !== FactionIDs.ROMANS) {
            return false;
        }

        return true;
    }

    static calculateLeastAttackResults(orderedFactionPieces, calculatedLosses, ambush) {
        const allowRolls = !ambush || this.caesarDefending(orderedFactionPieces);
        const firstRollablePieceIndex = _.findIndex(orderedFactionPieces, this.canRollForType);
        const removalCount = allowRolls ? Math.min(
            (firstRollablePieceIndex === -1 ? orderedFactionPieces.length : firstRollablePieceIndex),
            calculatedLosses) : calculatedLosses;
        const targets = _.take(orderedFactionPieces, removalCount);
        const remaining = _.drop(orderedFactionPieces, targets.length);

        return {
            losses: calculatedLosses,
            targets: targets,
            remaining: remaining
        };
    }

    static calculateAttackResults(orderedFactionPieces, calculatedLosses) {
        const targets = _.take(orderedFactionPieces, calculatedLosses);
        const remaining = _.drop(orderedFactionPieces, targets.length);

        return {
            losses: calculatedLosses,
            targets: targets,
            remaining: remaining
        };
    }

    static canRollForType(piece) {
        const typesForRolls = ['leader', 'citadel', 'legion', 'fort'];
        return _.indexOf(typesForRolls, piece.type) >= 0;
    }

    static defenderHasCitadelOrFort(defendingPieces) {
        return _.find(
            defendingPieces, function (piece) {
                return piece.type === 'citadel' || piece.type === 'fort';
            });
    }

    static canAmbush(state, region, attackingFaction, attackingPieces, defendingPieces) {

        if (attackingFaction.id === FactionIDs.BELGAE || attackingFaction.id === FactionIDs.ARVERNI) {
            const leaderRegion = _.find(state.regions, region => region.getLeaderForFaction(attackingFaction.id));
            if (!leaderRegion) {
                return false;
            }
            const leader = leaderRegion.getLeaderForFaction(attackingFaction.id);
            const isAmbiorixOrVercingetorix = leader && !leader.isSuccessor();
            const validRegionIds = isAmbiorixOrVercingetorix ? _(leaderRegion.adjacent).concat([leaderRegion]).map(
                'id').value() : [leaderRegion];

            if (_.indexOf(validRegionIds, region.id) < 0) {
                return false;
            }
        }

        const numAttackersHidden = this.calculateHidden(attackingPieces);
        const numDefendersHidden = this.calculateHidden(defendingPieces);
        return numAttackersHidden > numDefendersHidden;
    }

    static canCounterattack(ambush, defenderLosses, defendingPieces) {
        // Caesar might roll for a counterattack
        if (this.caesarDefending(defendingPieces)) {
            return true;
        }

        // Without Caesar an ambush will disallow
        if (ambush) {
            return false;
        }

        // Leaders and legions might survive loss rolls
        if (this.leaderOrLegionsDefending(defendingPieces)) {
            return true;
        }

        // Not enough losses will allow (but a single warband/auxilia cannot counterattack)
        const mobileDefenders = _.filter(defendingPieces, {isMobile: true});
        return defenderLosses < mobileDefenders.length - 1;
    }

    static calculateHidden(pieces) {
        return _.filter(
            pieces, function (piece) {
                return ((piece.type === 'auxilia' || piece.type === 'warband') && !piece.revealed());
            }).length;
    }

    static caesarDefending(defendingPieces) {
        const defendingRomanLeader = _.find(defendingPieces, {type: 'leader', factionId: FactionIDs.ROMANS});
        return defendingRomanLeader && !defendingRomanLeader.isSuccessor();
    }

    static leaderOrLegionsDefending(defendingPieces) {
        const defendingPiecesByType = _.groupBy(defendingPieces, 'type');
        return defendingPiecesByType.leader || defendingPiecesByType.legion;
    }

}

export default Battle;