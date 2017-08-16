import FallingSkyPlayer from '../player/fallingSkyPlayer';
import _ from '../../lib/lodash';
import FactionIDs from '../config/factionIds';
import Battle from '../commands/battle';
import RemovePieces from '../actions/removePieces';
import MovePieces from '../actions/movePieces';
import PlaceLeader from '../actions/placeLeader';
import Logging from '../util/logging';
import FactionActions from '../../common/factionActions';
import PlayerInteractionNeededError from '../../common/playerInteractionNeededError';
import SupplyLineAgreement from 'fallingsky/interactions/supplyLineAgreement';
import QuartersAgreement from 'fallingsky/interactions/quartersAgreement';
import RetreatAgreement from 'fallingsky/interactions/retreatAgreement';
import Harassment from 'fallingsky/interactions/harassment';
import Losses from 'fallingsky/util/losses';
import {CapabilityIDs} from 'fallingsky/config/capabilities';

class Bot extends FallingSkyPlayer {
    constructor(definition) {
        super({isNonPlayer: true});
        this.factionId = definition.factionId;
    }

    toJSON() {
        return Object.assign(super.toJSON(), {});
    }

    takeTurn(state) {

    }

    resume(state) {
        state.turnHistory.currentTurn.resume();
        this.takeTurn(state)
    }

    quarters(state) {

    }

    placeLeader(state, allowMove = false, regionIds = null) {
        const faction = state.factionsById[this.factionId];
        const region = _(state.regions).filter(region=> regionIds ? _.indexOf(regionIds, region.id) >= 0 : true).map((region) => {
                const pieces = region.piecesByFaction()[this.factionId] || [];
                return {
                    region: region,
                    numPieces: pieces.length
                }
            }).sortBy('numPieces').groupBy('numPieces').map(_.shuffle).flatten().map('region').reverse().first();

        if (faction.hasAvailableLeader()) {
            PlaceLeader.execute(state, {factionId: faction.id, regionId: region.id});
        }
        else if(allowMove) {
            const leaderRegion = _.find(state.regions, region=> region.getLeaderForFaction(this.factionId));
            if(leaderRegion && leaderRegion.id !== region.id) {
                const leader = leaderRegion.getLeaderForFaction(this.factionId);
                MovePieces.execute(state, {
                    factionId: this.factionId,
                    sourceRegionId: leaderRegion.id,
                    destRegionId: region.id,
                    pieces: [leader]
                });
            }
        }
    }

    canPlayEvent(currentState) {
        return _.indexOf(currentState.sequenceOfPlay.availableActions(), FactionActions.EVENT) >= 0;
    }

    willHarass(factionId, context) {
        return true;
    }

    willAgreeToQuarters(state, factionId) {
        return false;
    }

    willAgreeToRetreat(state, factionId) {
        return false;
    }

    willAgreeToSupplyLine(state, factionId) {
        return false;
    }

    willRetreat(state, region, attackingFaction, noRetreatLosses, retreatLosses) {
        let wantToRetreat = false;
        const defendingPieces = region.getPiecesForFaction(this.factionId);

        // 3.2.4 - The defender may opt to have any Retreating Leader and/or Hidden Warbands stay put.
        const canRetreatInPlace = attackingFaction.id === FactionIDs.ROMANS &&
                                  this.factionId !== FactionIDs.GERMANIC_TRIBES;
        const hasRevealedPieces = _.find(defendingPieces, piece => (piece.type === 'warband' || piece.type === 'auxilia') &&  piece.revealed());
        const hasLossesFromRetreat = !canRetreatInPlace || (!hasSafeRetreatRegion && hasRevealedPieces);

        const hasSafeRetreatRegion = _.find(
                region.adjacent, (adjacentRegion) => {
                    return adjacentRegion.controllingFactionId() && adjacentRegion.controllingFactionId() === this.factionId;
                }) || !hasLossesFromRetreat;


        const noRetreatOrderedPieces = Losses.orderPiecesForRemoval(state, defendingPieces, false);
        const retreatOrderedPieces = Losses.orderPiecesForRemoval(state, defendingPieces, false);

        const noRetreatRemoved = _.take(noRetreatOrderedPieces, noRetreatLosses);
        const noRetreatRemaining = _.drop(noRetreatOrderedPieces, noRetreatLosses);
        const retreatRemoved = _.take(retreatOrderedPieces, retreatLosses);
        const retreatRemaining = _.drop(retreatOrderedPieces, retreatLosses);

        const worstCaseAttackerLosses = Math.floor(Losses.calculateUnmodifiedLosses(state, noRetreatRemaining, true));

        // 8.4.3 - When needed to ensure the survival off their last Defending piece.
        if (noRetreatRemaining.length === 0 && retreatRemaining.length > 0) {
            console.log(this.factionId + ' wants to retreat to save last piece');
            wantToRetreat = true;
        }

        // 8.4.3 - If Roman, when needed to lower the number of forced Loss rolls against Legions
        if (this.factionId === FactionIDs.ROMANS) {
            const nonRetreatLegionsRemoved = _.countBy(noRetreatRemoved, 'type').legion || 0;
            const retreatLegionsRemoved = _.countBy(retreatRemoved, 'type').legion || 0;

            if (retreatLegionsRemoved < nonRetreatLegionsRemoved) {
                console.log(this.factionId + ' wants to retreat to lower legion losses');
                wantToRetreat = true;
            }
        }

        // 8.4.3 - If defending without a Fort or Citadel and a Retreat itself would not remove any
        // defending pieces, when they cannot guarantee inflicting at least half the Losses against
        // the Attacker that they will suffer (regardless of how many pieces might be removed by the
        // Losses).
        const hasDefendingCitadelOrFort = _.find(defendingPieces, piece => piece.type === 'citadel' || piece.type === 'fort');
        const counterAttackLossesTooFew = worstCaseAttackerLosses < (noRetreatLosses / 2);

        if (!hasDefendingCitadelOrFort && counterAttackLossesTooFew) {
            console.log(
                this.factionId + ' wants to retreat due to lack of citadel or fort and too few counterattack losses');
            wantToRetreat = true;
        }

        if (wantToRetreat && hasSafeRetreatRegion) {
            console.log(this.factionId + ' will be able to retreat safely');
        }

        let agreeingFactionId;
        if (wantToRetreat && !hasSafeRetreatRegion) {
            agreeingFactionId = this.getRetreatAgreement(state, region);
        }

        const willRetreat = wantToRetreat && (hasSafeRetreatRegion || agreeingFactionId);
        return {
            willRetreat,
            agreeingFactionId
        };
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
            agreementRequiredRetreatRegions, (agreementRequiredRegion) => {
                const regionFactionId = agreementRequiredRegion.controllingFactionId();
                if (factionsAsked[regionFactionId]) {
                    return false;
                }
                console.log('Asking ' + regionFactionId + ' for region ' + agreementRequiredRegion.name);
                factionsAsked[regionFactionId] = true;
                const existingAgreement = this.getExistingAgreement(state, regionFactionId, 'RetreatAgreement');
                return existingAgreement ? existingAgreement.status === 'agreed' : state.playersByFaction[regionFactionId].willAgreeToRetreat(
                    state, regionFactionId);
            });


        if (agreeingRegion) {
            console.log(agreeingRegion.controllingFactionId() + ' has agreed');
        }
        else {
            console.log('No agreement could be reached');
        }
        return agreeingRegion ? agreeingRegion.controllingFactionId() : null;
    }

    getExistingAgreement(state, factionId, agreementType) {
        return _.find(state.turnHistory.getCurrentTurn().getCurrentInteractions(),
                      agreement => agreement.type === agreementType && agreement.respondingFactionId === factionId);
    }

    getSupplyLineAgreements(state, modifiers, factionIds) {
        const agreements = [];
        _.each(
            factionIds, (factionId) => {
                const existingAgreement = this.getExistingAgreement(state, factionId, 'SupplyLineAgreement');
                const agreed = existingAgreement ? existingAgreement.status === 'agreed' : state.playersByFaction[factionId].willAgreeToSupplyLine(
                    state,
                    this.factionId);
                console.log(
                    this.factionId + ' asked ' + factionId + ' for supply line agreement -> ' + factionId + (agreed ? ' agreed' : ' denied'));
                if (agreed) {
                    agreements.push(factionId);
                }
            });

        return agreements;
    }

    takeLosses(state, battleResults, attackResults, counterattack, causedByCapability) {
        const region = battleResults.region;
        const attackingFaction = counterattack ? battleResults.defendingFaction : battleResults.attackingFaction;
        const ambush = battleResults.willAmbush && !causedByCapability;

        const ballistae = state.hasUnshadedCapability(CapabilityIDs.BALLISTAE) && this.factionId === FactionIDs.ROMANS;
        let allowRolls = causedByCapability || (!ambush && !counterattack);

        if (!allowRolls && !counterattack && this.factionId === FactionIDs.ROMANS) {
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


        const amAttacker = battleResults.attackingFaction.id === this.factionId;
        const myPieces = amAttacker ? Battle.getAttackingPieces(battleResults) : Battle.getDefendingPieces(battleResults);
        const helpingFactionId = (amAttacker && battleResults.willEnlistGermans) ? FactionIDs.GERMANIC_TRIBES : null;

        const targets = _.clone(Losses.orderPiecesForRemoval(state, myPieces, battleResults.willRetreat, helpingFactionId));
        let losses = attackResults.losses;

        const removed = [];

        if(battleResults.legiones) {
            const legionIndex = _.findIndex(targets, { type: 'legion'});
            if(legionIndex >= 0) {
                losses -= 1;
                removed.push(_.first(_.pullAt(targets,[legionIndex])));
            }
        }

        if(targets.length > 0) {
            _.each(_.range(0, losses), (index) => {
                const piece = _.first(targets);
                let willRemove = true;
                const canRollForLoss = piece.type === 'leader' || piece.type === 'citadel' || piece.type === 'legion' || piece.type === 'fort';
                if (canRollForLoss && allowRolls) {
                    const roll = _.random(1, 6);
                    console.log('Rolling for loss of ' + piece.type + ', need 4-6 and got ' + roll);
                    willRemove = roll < ((piece.type === 'fort' && ballistae) ? 3 : 4);
                }

                if (willRemove) {
                    removed.push(targets.shift());
                }
                else {
                    console.log(piece.type + ' saved!');
                }

                if (targets.length === 0) {
                    return false;
                }
            });
        }

        attackResults.removed = removed;
        attackResults.remaining = targets;

        if (attackResults.removed.length > 0) {
            RemovePieces.execute(
                state, {
                    regionId: region.id,
                    factionId: this.factionId,
                    pieces: attackResults.removed
                });
        }

        attackResults.counterattackPossible = allowRolls && _.find(attackResults.remaining, {isMobile: true});
    }



    retreatFromBattle(state, battleResults, attackResults) {
        const region = battleResults.region;
        const attackingFaction = battleResults.attackingFaction;
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

        let retreatRegion = this.retreatPieces(state, region, groupedPieces.leaving || [],
                                               attackResults.agreeingFactionId);


        if (groupedPieces.leader && retreatRegion) {
            const sourceFriendlyPieces = region.piecesByFaction()[this.factionId];
            const targetFriendlyPieces = retreatRegion.piecesByFaction()[this.factionId];
            if (targetFriendlyPieces.length > sourceFriendlyPieces.length) {
                MovePieces.execute(
                    state, {
                        sourceRegionId: region.id,
                        destRegionId: retreatRegion.id,
                        pieces: groupedPieces.leader
                    });
            }
        }
    }

    retreatPieces(state, region, pieces, agreeingFactionId) {
        if (pieces.length === 0) {
            return;
        }

        const targetRegion = this.findRetreatRegion(state, region, agreeingFactionId);
        if (targetRegion) {
            MovePieces.execute(
                state, {
                    sourceRegionId: region.id,
                    destRegionId: targetRegion.id,
                    pieces: pieces
                });
        }
        else {
            RemovePieces.execute(
                state, {
                    regionId: region.id,
                    factionId: this.factionId,
                    pieces: pieces
                });
        }

        return targetRegion;
    }

    findRetreatRegion(state, region, agreeingFactionId) {
        return _(region.adjacent).reject(
            adjacent => (!adjacent.controllingFactionId() || (adjacent.controllingFactionId() !== this.factionId && adjacent.controllingFactionId() !== agreeingFactionId))).map(
            (adjacent) => {
                const friendlyPieces = adjacent.getPiecesForFaction(this.factionId);
                return {
                    numFriendly: friendlyPieces.length,
                    region: adjacent
                }
            }).sortBy('numFriendly').groupBy('numFriendly').map(_.shuffle).flatten().reverse().map('region').first();

    }

    removePieces(state, region, numPieces) {
        const pieces = region.getPiecesForFaction(this.factionId);
        const piecesToRemove = _.take(Losses.orderPiecesForRemoval(state, pieces), numPieces);
        RemovePieces.execute(state, {
            factionId: this.factionId,
            regionId: region.id,
            pieces: piecesToRemove
        });
    }
}

export default Bot;