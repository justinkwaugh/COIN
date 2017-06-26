import Player from '../../common/player';
import _ from '../../lib/lodash';
import FactionIDs from '../config/factionIds';
import Battle from '../commands/battle';
import RemovePieces from '../actions/removePieces';
import MovePieces from '../actions/movePieces';
import PlaceLeader from '../actions/placeLeader';
import Logging from '../util/logging';
import FactionActions from '../../common/factionActions';

class Bot extends Player {
    constructor(definition) {
        super({isNonPlayer: true});
        this.factionId = definition.factionId;
    }

    takeTurn(currentState) {
    }

    quarters(currentState) {

    }

    placeLeader(state) {
        const faction = state.factionsById[this.factionId];
        if (faction.hasAvailableLeader()) {
            const region = _(state.regions).map((region) =>{
                const pieces = region.piecesByFaction()[this.factionId] || [];
                return {
                    region: region,
                    numPieces: pieces.length
                }
            }).sortBy('numPieces').groupBy('numPieces').map(_.shuffle).flatten().map('region').reverse().first();
            PlaceLeader.perform(state, { faction, region });
        }
    }

    canPlayEvent(currentState) {
        return _.indexOf(currentState.sequenceOfPlay.availableActions(), FactionActions.EVENT) >= 0;
    }

    willAgreeToQuarters(factionId) {
        return false;
    }

    willAgreeToRetreat() {
        return false;
    }

    willAgreeToSupplyLine(factionId) {
        return false;
    }

    orderPiecesForRemoval(state, factionPieces, retreat) {
        const alliesFortsAndCitadels = _(factionPieces).filter(
            function (piece) {
                return piece.type === 'alliedtribe' || piece.type === 'fort' || piece.type === 'citadel';
            }).sortBy(
            function (piece) {
                if (piece.type === 'alliedtribe') {
                    const tribe = state.tribesById[piece.tribeId];
                    if (!tribe.isCity) {
                        return 'a';
                    }
                    else {
                        return 'b';
                    }
                }
                else if (piece.type === 'fort') {
                    return 'c';
                }
                else if (piece.type === 'citadel') {
                    return 'd';
                }
            }).value();

        const warbandsAuxiliaLegionsAndLeader = _(factionPieces).filter(
            function (piece) {
                return piece.type === 'warband' || piece.type === 'auxilia' || piece.type === 'legion' || piece.type === 'leader';
            }).sortBy(
            function (piece) {
                if (piece.type === 'warband' || piece.type === 'auxilia') {
                    if (piece.scouted()) {
                        return 'a';
                    }
                    else if (piece.revealed()) {
                        return 'b';
                    }
                    else {
                        return 'c';
                    }

                }
                else if (piece.type === 'legion') {
                    return 'd';
                }
                else if (piece.type === 'leader') {
                    return 'e';
                }
            }).value();

        let piecesForRemoval = [];
        if (retreat) {
            piecesForRemoval = _.concat(alliesFortsAndCitadels, warbandsAuxiliaLegionsAndLeader);
        }
        else {
            piecesForRemoval = _.concat(warbandsAuxiliaLegionsAndLeader, alliesFortsAndCitadels);
        }
        return piecesForRemoval;
    }

    willRetreat(state, region, attackingFaction, attackerLosses, nonRetreatResults, retreatResults) {
        let wantToRetreat = false;

        // 3.2.4 - The defender may opt to have any Retreating Leader and/or Hidden Warbands stay put.
        const canRetreatInPlace = attackingFaction.id === FactionIDs.ROMANS &&
                                  this.factionId !== FactionIDs.GERMANIC_TRIBES;
        const hasRevealedPieces = _.find(
            defendingPieces, function (piece) {
                return piece.revealed();
            });
        const hasLossesFromRetreat = !canRetreatInPlace || (!hasSafeRetreatRegion && hasRevealedPieces);

        const hasSafeRetreatRegion = _.find(
                region.adjacent, (adjacentRegion) => {
                    return adjacentRegion.controllingFactionId() && adjacentRegion.controllingFactionId() === this.factionId;
                }) || !hasLossesFromRetreat;

        // 8.4.3 - When needed to ensure the survival off their last Defending piece.
        if (nonRetreatResults.remaining.length === 0 && retreatResults.remaining.length > 0) {
            console.log(this.factionId + ' wants to retreat to save last piece');
            wantToRetreat = true;
        }

        // 8.4.3 - If Roman, when needed to lower the number of forced Loss rolls against Legions
        if (this.factionId === FactionIDs.ROMANS) {
            const nonRetreatLegionsRemoved = _.countBy(nonRetreatResults.removed, 'type').legion || 0;
            const retreatLegionsRemoved = _.countBy(nonRetreatResults.removed, 'type').legion || 0;

            if (retreatLegionsRemoved < nonRetreatLegionsRemoved) {
                console.log(this.factionId + ' wants to retreat to lower legion losses');
                wantToRetreat = true;
            }
        }

        // 8.4.3 - If defending without a Fort or Citadel and a Retreat itself would not remove any
        // defending pieces, when they cannot guarantee inflicting at least half the Losses against
        // the Attacker that they will suffer (regardless of how many pieces might be removed by the
        // Losses).
        const defendingPieces = region.piecesByFaction()[this.factionId];
        const hasDefendingCitadelOrFort = Battle.defenderHasCitadelOrFort(defendingPieces);
        const counterAttackLossesTooFew = attackerLosses < (nonRetreatResults.removed.length / 2);

        if (!hasDefendingCitadelOrFort && counterAttackLossesTooFew) {
            console.log(this.factionId + ' wants to retreat due to lack of citadel or fort and too few counterattack losses');
            wantToRetreat = true;
        }

        if (wantToRetreat && hasSafeRetreatRegion) {
            console.log(this.factionId + ' will be able to retreat safely');
        }

        if (wantToRetreat && !hasSafeRetreatRegion) {
            retreatResults.agreeingFaction = this.getRetreatAgreement(state, region);
        }

        return wantToRetreat && (hasSafeRetreatRegion || retreatResults.agreeingFaction);
    }

    getRetreatAgreement(state, region) {
        console.log(this.factionId + ' has to ask for agreement to retreat');
        const agreementRequiredRetreatRegions = _.filter(
            region.adjacent, (adjacentRegion) => {
                return adjacentRegion.controllingFactionId() && adjacentRegion.controllingFactionId() !== this.factionId;
            });

        if (agreementRequiredRetreatRegions.length === 0) {
            console.log('No adjacent regions can be asked');
        }

        const factionsAsked = {};
        const agreeingRegion = _.find(
            agreementRequiredRetreatRegions, function (agreementRequiredRegion) {
                const regionFactionId = agreementRequiredRegion.controllingFactionId();
                if (factionsAsked[regionFactionId]) {
                    return false;
                }
                console.log('Asking ' + regionFactionId + ' for region ' + agreementRequiredRegion.name);
                factionsAsked[regionFactionId] = true;
                return state.playersByFaction[regionFactionId].willAgreeToRetreat();
            });


        if (agreeingRegion) {
            console.log(agreeingRegion.controllingFactionId() + ' has agreed');
        }
        else {
            console.log('No agreement could be reached');
        }
        return agreeingRegion ? agreeingRegion.controllingFactionId() : null;
    }

    getSupplyLineAgreements(state, factionIds) {
        const agreements = [];
        _.each(
            factionIds, (factionId) => {
                const agreed = state.playersByFaction[factionId].willAgreeToSupplyLine(this.factionId);
                console.log(this.factionId + ' asked ' + factionId + ' for supply line agreement -> ' + factionId + (agreed ? ' agreed' : ' denied'));
                if (agreed) {
                    agreements.push(factionId);
                }
            });

        return agreements;
    }

    takeLosses(state, region, attackingFaction, attackResults, ambush) {
        let allowRolls = !ambush;

        if (!allowRolls && this.factionId === FactionIDs.ROMANS) {
            const defendingLeader = _.find(region.piecesByFaction()[this.factionId], {type: 'leader'});
            const caesarDefending = defendingLeader && !defendingLeader.isSuccessor();

            if (caesarDefending) {
                const minRoll = attackingFaction.id === FactionIDs.BELGAE ? 5 : 4;
                const roll = _.random(1, 6);
                console.log('Caesar is defending, requires a roll > ' + minRoll + ', got ' + roll);
                allowRolls = roll >= minRoll;
                if (allowRolls) {
                    console.log('Loss rolls and counterattack allowed!');
                }
            }
        }

        const pieces = _.groupBy(
            attackResults.removed, function (piece) {
                let willRemove = true;
                const canRollForLoss = piece.type === 'leader' || piece.type === 'citadel' || piece.type === 'legion' || piece.type === 'fort';
                if (canRollForLoss && allowRolls) {
                    const roll = _.random(1, 6);
                    console.log('Rolling for loss of ' + piece.type + ', need 4-6 and got ' + roll);
                    willRemove = roll < 4;
                }

                if (willRemove) {
                    return 'removed';
                }
                else {
                    console.log(piece.type + ' saved!');
                    return 'saved';
                }
            });

        attackResults.removed = pieces.removed;
        attackResults.remaining.push.apply(attackResults.remaining, pieces.saved);

        RemovePieces.perform(
            state, {
                region: region,
                factionId: this.factionId,
                pieces: pieces.removed
            });

        return allowRolls;
    }

    retreatFromBattle(state, region, attackingFaction, attackResults) {
        const canRetreatInPlace = attackingFaction.id === FactionIDs.ROMANS &&
                                  this.factionId !== FactionIDs.GERMANIC_TRIBES;

        const leader = _.find(attackResults.remaining, {type: 'leader'});
        const groupedPieces = _.groupBy(
            attackResults.remaining, (piece) => {
                if (piece.type === 'warband' && !piece.revealed() && canRetreatInPlace) {
                    return 'staying';
                }

                if (piece.type === 'leader' && canRetreatInPlace) {
                    return 'leader';
                }

                if (piece.isMobile) {
                    return 'leaving';
                }

                return 'staying';
            });

        let retreatRegion = this.retreatPieces(state, region, groupedPieces.leaving || [], attackResults.agreeingFactionId);

        if (groupedPieces.leader) {
            const sourceFriendlyPieces = region.piecesByFaction()[this.factionId];
            const targetFriendlyPieces = retreatRegion.piecesByFaction()[this.factionId];
            if (targetFriendlyPieces.length > sourceFriendlyPieces.length) {
                MovePieces.run(
                    state, {
                        sourceRegionId: region.id,
                        destRegionId: retreatRegion.id,
                        pieces: groupedPieces.leader
                    });
            }
        }
    }

    retreatPieces( state, region, pieces, agreeingFactionId ) {
        if(pieces.length === 0) {
            return;
        }

        const targetRegion = this.findRetreatRegion(state, region, agreeingFactionId);
        if (targetRegion) {
            MovePieces.run(
                state, {
                    sourceRegionId: region.id,
                    destRegionId: targetRegion.id,
                    pieces: pieces
                });
        }
        else {
            RemovePieces.perform(
                state, {
                    region: region,
                    factionId: this.factionId,
                    pieces: pieces
                });
        }

        return targetRegion;
    }

    findRetreatRegion(state, region, agreeingFactionId) {
        let mostFriendly = 0;
        let targetRegion = null;
        _.each(
            region.adjacent, (adjacentRegion) => {
                if (adjacentRegion.controllingFactionId() !== this.factionId && adjacentRegion.controllingFactionId() !== agreeingFactionId) {
                    return;
                }

                const friendlyPieces = adjacentRegion.piecesByFaction()[this.factionId];
                if (friendlyPieces && friendlyPieces.length > mostFriendly) {
                    mostFriendly = friendlyPieces.length;
                    targetRegion = adjacentRegion;
                }
            });
        return targetRegion;
    }
}
export default Bot;