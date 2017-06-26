import _ from '../../lib/lodash';
import Command from './command';
import FactionIDs from '../config/factionIds';
import BattleResults from './battleResults';

import RevealPieces from '../actions/revealPieces';
import RemovePieces  from '../actions/removePieces';
import {CapabilityIDs} from '../config/capabilities';
import Bot from '../bots/bot';

class Battle extends Command {

    static doTest(state, args) {
        const region = args.region;
        const enlistingGermans = args.enlistingGermans;
        const attackingFaction = args.attackingFaction;
        const defendingFaction = args.defendingFaction;
        const attackingPlayer = state.playersByFaction[attackingFaction.id];
        const defendingPlayer = state.playersByFaction[defendingFaction.id];

        let attackingPieces = region.piecesByFaction()[attackingFaction.id] || [];
        if(enlistingGermans) {
            const germanicPieces = region.piecesByFaction()[attackingFaction.id] || [];
            attackingPieces = _.concat(attackingPieces, germanicPieces);
        }
        const defendingPieces = region.piecesByFaction()[defendingFaction.id] || [];

        const canAmbush = !enlistingGermans && this.canAmbush(state, region, attackingFaction, attackingPieces, defendingPieces) ;
        const defenderCanRetreat = this.canRetreat(attackingFaction, defendingFaction, region);

        // Base Losses
        let unmodifiedDefenderLosses = this.calculateUnmodifiedLosses(attackingPieces);
        if (attackingFaction.id === FactionIDs.ARVERNI && state.hasUnshadedCapability(CapabilityIDs.MASSED_GALLIC_ARCHERS)) {
            unmodifiedDefenderLosses = Math.max(0, unmodifiedDefenderLosses - 1);
        }

        // No Retreat
        let noRetreatDefenderLosses = unmodifiedDefenderLosses;
        if (this.defenderHasCitadelOrFort(defendingPieces)) {
            noRetreatDefenderLosses /= 2;
        }

        noRetreatDefenderLosses = Math.min(Math.floor(noRetreatDefenderLosses), defendingPieces.length);
        const noRetreatOrderedDefendingPieces = defendingPlayer.orderPiecesForRemoval(state, defendingPieces, false);
        const noRetreatDefenderResults = this.calculateLeastAttackResults(noRetreatOrderedDefendingPieces, noRetreatDefenderLosses, false);
        const noRetreatDefenderResultsAmbush = this.calculateLeastAttackResults(noRetreatOrderedDefendingPieces, noRetreatDefenderLosses, true);

        // Counterattack
        const defenderCanCounterattack = this.canCounterattack(false, noRetreatDefenderLosses, defendingPieces);
        const defenderCanCounterattackAmbush = this.canCounterattack(true, noRetreatDefenderLosses, defendingPieces);

        const worstCaseAttackerLosses = Math.min(Math.floor(this.calculateUnmodifiedLosses(noRetreatDefenderResults.remaining, true)), attackingPieces.length);
        const worstCaseAttackerLossesAmbush = defenderCanCounterattackAmbush ? worstCaseAttackerLosses : 0;

        const orderedAttackingPieces = attackingPlayer.orderPiecesForRemoval(state, attackingPieces, false);
        const counterattackResults = this.calculateAttackResults(orderedAttackingPieces, worstCaseAttackerLosses, false);
        const counterattackResultsAmbush = this.calculateAttackResults(orderedAttackingPieces, worstCaseAttackerLossesAmbush, false);

        // Retreat
        const retreatDefenderLosses = Math.min(Math.floor(unmodifiedDefenderLosses / 2), defendingPieces.length);
        const retreatOrderedDefendingPieces = defendingPlayer.orderPiecesForRemoval(state, defendingPieces, true);
        const retreatDefenderResults = this.calculateLeastAttackResults(retreatOrderedDefendingPieces, retreatDefenderLosses, false);

        const worstCaseDefenderLosses = _.min([(defenderCanRetreat ? retreatDefenderResults.removed.length : noRetreatDefenderResults.removed.length), noRetreatDefenderResults.removed.length, defendingPieces.length]);
        const worstCaseDefenderLossesAmbush = noRetreatDefenderResultsAmbush.removed.length;

        return new BattleResults (
            {
                region: region,

                attackingFaction: attackingFaction,
                defendingFaction: defendingFaction,

                attackingPieces: attackingPieces,
                defendingPieces: defendingPieces,

                canAmbush: canAmbush,
                enlistingGermans: enlistingGermans,
                defenderCanRetreat: defenderCanRetreat,
                defenderCanCounterattack: { normal: defenderCanCounterattack, ambush: defenderCanCounterattackAmbush },

                worstCaseRetreatDefenderResults: retreatDefenderResults,
                worstCaseNoRetreatDefenderResults: { normal : noRetreatDefenderResults, ambush: noRetreatDefenderResultsAmbush },
                worstCaseDefenderLosses : { normal: worstCaseDefenderLosses, ambush: worstCaseDefenderLossesAmbush },
                worstCaseAttackerLosses: { normal: worstCaseAttackerLosses, ambush: worstCaseAttackerLossesAmbush },
                worstCaseCounterattackResults: { normal: counterattackResults, ambush: counterattackResultsAmbush }
            });
    }

    static doExecute(state, args) {
        const region = args.region;
        const attackingFaction = args.attackingFaction;
        const defendingFaction = args.defendingFaction;
        const attackingPlayer = state.playersByFaction[attackingFaction.id];
        const defendingPlayer = state.playersByFaction[defendingFaction.id];
        const enlistingGermans = args.enlistGermans;
        const ambush = args.ambush;

        console.log(args.attackingFaction.name + ' is battling ' + args.defendingFaction.name + ' in region ' + region.name + (enlistingGermans ? ' with German help' : '' ));
        console.log('*** Battleground: ***');
        region.logState();
        console.log('*** Battle: ***');
        if (ambush) {
            console.log(args.attackingFaction.name + ' is ambushing!');
        }

        let attackingPieces = region.piecesByFaction()[attackingFaction.id];
        if(enlistingGermans) {
            const germanicPieces = region.piecesByFaction()[attackingFaction.id] || [];
            attackingPieces = _.concat(attackingPieces, germanicPieces);
        }
        const defendingPieces = region.piecesByFaction()[defendingFaction.id];

        let unmodifiedDefenderLosses = this.calculateUnmodifiedLosses(attackingPieces);
        if (attackingFaction.id === FactionIDs.ARVERNI && state.hasUnshadedCapability(CapabilityIDs.MASSED_GALLIC_ARCHERS)) {
            unmodifiedDefenderLosses = Math.max(0, unmodifiedDefenderLosses - 1);
        }
        // No Retreat
        let noRetreatDefenderLosses = unmodifiedDefenderLosses;
        if (this.defenderHasCitadelOrFort(defendingPieces)) {
            noRetreatDefenderLosses /= 2;
        }
        noRetreatDefenderLosses = Math.min(Math.floor(noRetreatDefenderLosses), defendingPieces.length);
        const noRetreatOrderedDefendingPieces = defendingPlayer.orderPiecesForRemoval(state, defendingPieces, false);
        const noRetreatDefenderResults = this.calculateAttackResults(noRetreatOrderedDefendingPieces, noRetreatDefenderLosses);

        const attackerLosses = Math.min(Math.floor(this.calculateUnmodifiedLosses(noRetreatDefenderResults.remaining, true)), attackingPieces.length);
        const orderedAttackingPieces = attackingPlayer.orderPiecesForRemoval(state, attackingPieces, false);
        const counterattackResults = this.calculateAttackResults(orderedAttackingPieces, attackerLosses);

        let defenderResults = noRetreatDefenderResults;
        let retreatDeclared = false;

        if (!ambush && this.canRetreat(attackingFaction, defendingFaction, region)) {
            const retreatDefenderLosses = Math.min(Math.floor(unmodifiedDefenderLosses / 2), defendingPieces.length);
            const retreatOrderedDefendingPieces = defendingPlayer.orderPiecesForRemoval(state, defendingPieces, true);
            const retreatDefenderResults = this.calculateAttackResults(retreatOrderedDefendingPieces, retreatDefenderLosses);

            retreatDeclared = state.playersByFaction[defendingFaction.id].willRetreat(state, region, attackingFaction, attackerLosses, noRetreatDefenderResults, retreatDefenderResults);
            if (retreatDeclared) {
                console.log(args.defendingFaction.name + ' is retreating!');
                defenderResults = retreatDefenderResults;
            }
        }

        const counterattackPossible = state.playersByFaction[defendingFaction.id].takeLosses(state, region, attackingFaction, defenderResults, ambush);

        if (retreatDeclared) {
            state.playersByFaction[defendingFaction.id].retreatFromBattle(state, region, attackingFaction, defenderResults);
        }

        if (counterattackPossible && !retreatDeclared) {
            state.playersByFaction[attackingFaction.id].takeLosses(state, region, defendingFaction, counterattackResults, false);
        }

        if (!retreatDeclared) {
            RevealPieces.perform(state, {faction: attackingFaction, region: region});
            RevealPieces.perform(state, {faction: defendingFaction, region: region});
        }

        if (ambush && state.hasShadedCapability(CapabilityIDs.BALLISTAE, attackingFaction.id)) {
            const citadelOrFort = _.find(
                defendingPieces, function (piece) {
                    return piece.type === 'citadel' || piece.type === 'fort';
                });
            if (citadelOrFort) {
                console.log('*** Attacker is using Ballistae ***');
                RemovePieces.perform(state,
                    {
                        faction: defendingFaction,
                        region: region,
                        pieces: [citadelOrFort]
                    });
            }
        }
        // region.logState();
        console.log('Battle complete');

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

    static calculateUnmodifiedLosses(attackingPieces, counterattack) {
        let losses = 0;
        const leader = _.find(attackingPieces, {type: 'leader'});
        _.each(
            attackingPieces, function (piece) {
                if (piece.type === 'warband') {
                    if (!counterattack && leader && !leader.isSuccessor() && piece.factionId === FactionIDs.BELGAE) {
                        losses += 1;
                    }
                    else {
                        losses += 0.5;
                    }
                }
                else if (piece.type === 'auxilia') {
                    losses += 0.5;
                }
                else if (piece.type === 'legion') {
                    if (!counterattack && leader && !leader.isSuccessor() && piece.factionId === FactionIDs.ROMANS) {
                        losses += 2;
                    }
                    else {
                        losses += 1;
                    }
                }
                else if (piece.type === 'leader') {
                    losses += 1;
                }
            });

        return losses;
    }

    static calculateLeastAttackResults( orderedFactionPieces, calculatedLosses, ambush ) {
        const allowRolls = !ambush || this.caesarDefending(orderedFactionPieces);
        const firstRollablePieceIndex = _.findIndex(orderedFactionPieces, this.canRollForType);
        const removalCount = allowRolls ? Math.min((firstRollablePieceIndex === -1 ? orderedFactionPieces.length : firstRollablePieceIndex), calculatedLosses) : calculatedLosses;
        const removed = _.take(orderedFactionPieces, removalCount);
        const remaining = _.drop(orderedFactionPieces, removed.length);

        return {
            removed: removed,
            remaining: remaining
        };
    }

    static calculateAttackResults( orderedFactionPieces, calculatedLosses ) {
        const removed = _.take(orderedFactionPieces, calculatedLosses);
        const remaining = _.drop(orderedFactionPieces, removed.length);

        return {
            removed: removed,
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

        if(attackingFaction.id === FactionIDs.BELGAE || attackingFaction.id === FactionIDs.ARVERNI) {
            const leaderRegion = _.find(state.regions, region => region.getLeaderForFaction(attackingFaction.id));
            if (!leaderRegion) {
                return false;
            }
            const leader = leaderRegion.getLeaderForFaction(attackingFaction.id);
            const isAmbiorixOrVercingetorix = leader && !leader.isSuccessor();
            const validRegionIds = isAmbiorixOrVercingetorix ? _(leaderRegion.adjacent).concat([leaderRegion]).map('id').value() : [leaderRegion];

            if(_.indexOf(validRegionIds, region.id) < 0) {
                return false;
            }
        }

        const numAttackersHidden = this.calculateHidden(attackingPieces);
        const numDefendersHidden = this.calculateHidden(defendingPieces);
        return numAttackersHidden > numDefendersHidden;
    }

    static canCounterattack(ambush, defenderLosses, defendingPieces) {
        // Caesar might roll for a counterattack
        if(this.caesarDefending(defendingPieces)) {
            return true;
        }

        // Without Caesar an ambush will disallow
        if(ambush) {
            return false;
        }

        // Leaders and legions might survive loss rolls
        if(this.leaderOrLegionsDefending(defendingPieces)) {
            return true;
        }

        // Not enough losses will allow (but a single warband/auxilia cannot counterattack)
        const mobileDefenders = _.filter(defendingPieces, { isMobile : true });
        return defenderLosses < mobileDefenders.length-1;
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